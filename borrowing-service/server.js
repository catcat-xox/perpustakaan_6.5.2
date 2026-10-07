const express = require("express");
const axios = require("axios");
const db = require("../config/db");

const router = express.Router();

// Book Service sekarang diakses melalui server utama
const BOOK_SERVICE_URL = "http://localhost:3000/api";

const MAX_ACTIVE_LOANS = 3;
const BORROWING_DAYS = 7;

function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

function toDateOnly(date) {
    return date.toISOString().slice(0, 10);
}

function mapLoan(row) {
    const loan = {
        id: row.id,
        studentId: row.nim,
        bookId: row.id_buku,
        tanggalPinjam: row.tanggal_pinjam,
        batasPengembalian: row.batas_pengembalian,
        status: row.status
    };

    if (row.tanggal_dikembalikan) {
        loan.tanggalDikembalikan = row.tanggal_dikembalikan;
    }

    return loan;
}

// ===============================
// BORROWING SERVICE HEALTH
// ===============================
router.get("/borrowings/health", (req, res) => {
    res.json({
        service: "borrowing-service",
        status: "ok"
    });
});

async function getBorrowingsByStudent(studentId) {
    const [rows] = await db.query(`
        SELECT
            id,
            nim,
            id_buku,
            tanggal_pinjam,
            batas_pengembalian,
            status,
            tanggal_dikembalikan
        FROM loans
        WHERE nim = ?
        ORDER BY tanggal_pinjam DESC, id DESC
    `, [String(studentId)]);

    const borrowings = rows.map(mapLoan);
    const activeCount = borrowings.filter(
        (item) => item.status === "borrowed"
    ).length;

    return { borrowings, activeCount };
}

// ===============================
// RIWAYAT PEMINJAMAN MAHASISWA
// ===============================
router.get(
    "/borrowings/student/:studentId",
    async (req, res) => {
        try {
            const result = await getBorrowingsByStudent(
                req.params.studentId
            );

            res.json(result);
        } catch (error) {
            console.error("GET /borrowings/student/:studentId:", error);
            res.status(500).json({
                message: "Gagal mengambil riwayat peminjaman."
            });
        }
    }
);

// ===============================
// RIWAYAT PEMINJAMAN USER
// ===============================
router.get(
    "/borrowings/user/:userId",
    async (req, res) => {
        try {
            const result = await getBorrowingsByStudent(
                req.params.userId
            );

            res.json(result);
        } catch (error) {
            console.error("GET /borrowings/user/:userId:", error);
            res.status(500).json({
                message: "Gagal mengambil riwayat peminjaman."
            });
        }
    }
);

// ===============================
// PINJAM BUKU
// ===============================
router.post("/borrowings", async (req, res) => {
    const { studentId, bookId } = req.body;

    if (!studentId || !bookId) {
        return res.status(400).json({
            message: "studentId dan bookId wajib diisi."
        });
    }

    try {
        // Cek mahasiswa
        const [users] = await db.query(`
            SELECT nim, nama
            FROM users
            WHERE nim = ?
        `, [String(studentId)]);

        if (users.length === 0) {
            return res.status(404).json({
                message: "Mahasiswa tidak ditemukan."
            });
        }

        // Cek jumlah buku yang sedang dipinjam
        const [activeRows] = await db.query(`
            SELECT COUNT(*) AS activeCount
            FROM loans
            WHERE nim = ?
              AND status = 'borrowed'
        `, [String(studentId)]);

        const activeCount = Number(activeRows[0].activeCount);

        if (activeCount >= MAX_ACTIVE_LOANS) {
            return res.status(409).json({
                reason:
                    "Maksimal 3 buku aktif. Kembalikan salah satu buku terlebih dahulu."
            });
        }

        // Ambil data buku dari Book Service
        let book;

        try {
            const response = await axios.get(
                `${BOOK_SERVICE_URL}/books/${encodeURIComponent(bookId)}`,
                {
                    headers: {
                        Authorization:
                            req.headers.authorization
                    }
                }
            );

            book = response.data;
        } catch (error) {
            const status = error.response?.status || 500;

            return res.status(status).json({
                reason:
                    error.response?.data?.message ||
                    "Gagal mengambil data buku."
            });
        }

        // Cek ketersediaan buku
        if (!book.available) {
            return res.status(409).json({
                reason: "Buku sedang dipinjam / tidak tersedia."
            });
        }

        // Ubah status buku menjadi tidak tersedia
        try {
            await axios.patch(
                `${BOOK_SERVICE_URL}/books/${encodeURIComponent(bookId)}/status`,
                {
                    available: false
                },
                {
                    headers: {
                        Authorization:
                            req.headers.authorization
                    }
                }
            );

        } catch (error) {
            return res.status(502).json({
                reason: "Gagal memperbarui status buku."
            });
        }

        // Buat data peminjaman
        const now = new Date();
        const borrowing = {
            id: `BR${Date.now()}`,
            studentId: String(studentId),
            bookId: String(bookId),
            tanggalPinjam: toDateOnly(now),
            batasPengembalian: toDateOnly(
                addDays(now, BORROWING_DAYS)
            ),
            status: "borrowed"
        };

        try {
            await db.query(`
                INSERT INTO loans
                    (id, nim, id_buku, tanggal_pinjam, batas_pengembalian, status)
                VALUES (?, ?, ?, ?, ?, ?)
            `, [
                borrowing.id,
                borrowing.studentId,
                borrowing.bookId,
                borrowing.tanggalPinjam,
                borrowing.batasPengembalian,
                borrowing.status
            ]);
        } catch (error) {
            // Roll back Book Service status if the loan insert fails.
            try {
                await axios.patch(
                    `${BOOK_SERVICE_URL}/books/${encodeURIComponent(bookId)}/status`,
                    {
                        available: true
                    },
                    {
                        headers: {
                            Authorization:
                                req.headers.authorization
                        }
                    }
                );

            } catch (rollbackError) {
                console.error("Rollback status buku gagal:", rollbackError.message);
            }

            throw error;
        }

        res.status(201).json({
            message: "Peminjaman berhasil.",
            borrowing
        });
    } catch (error) {
        console.error("POST /borrowings:", error);
        res.status(500).json({
            message: "Gagal menyimpan data peminjaman."
        });
    }
});

// ===============================
// KEMBALIKAN BUKU
// ===============================
router.patch("/borrowings/:id", async (req, res) => {
    if (req.body.status !== "returned") {
        return res.status(400).json({
            message: "Status pengembalian harus 'returned'."
        });
    }

    try {
        const [rows] = await db.query(`
            SELECT
                id,
                nim,
                id_buku,
                tanggal_pinjam,
                batas_pengembalian,
                status,
                tanggal_dikembalikan
            FROM loans
            WHERE id = ?
        `, [req.params.id]);

        if (rows.length === 0) {
            return res.status(404).json({
                message: "Data peminjaman tidak ditemukan."
            });
        }

        const borrowing = mapLoan(rows[0]);

        if (borrowing.status === "returned") {
            return res.status(409).json({
                message: "Buku sudah dikembalikan."
            });
        }

        // Ubah status buku menjadi tersedia
        try {
            await axios.patch(
                `${BOOK_SERVICE_URL}/books/${encodeURIComponent(borrowing.bookId)}/status`,
                {
                    available: true
                },
                {
                    headers: {
                        Authorization:
                            req.headers.authorization
                    }
                }
            );

        } catch (error) {
            return res.status(502).json({
                message: "Gagal memperbarui status buku."
            });
        }

        const tanggalDikembalikan = toDateOnly(new Date());

        try {
            await db.query(`
                UPDATE loans
                SET
                    status = 'returned',
                    tanggal_dikembalikan = ?
                WHERE id = ?
            `, [tanggalDikembalikan, req.params.id]);
        } catch (error) {
            // Roll back Book Service status if the loan update fails.
            try {
                await axios.patch(
                    `${BOOK_SERVICE_URL}/books/${encodeURIComponent(borrowing.bookId)}/status`,
                    {
                        available: false
                    },
                    {
                        headers: {
                            Authorization:
                                req.headers.authorization
                        }
                    }
                );

            } catch (rollbackError) {
                console.error("Rollback status buku gagal:", rollbackError.message);
            }

            throw error;
        }

        borrowing.status = "returned";
        borrowing.tanggalDikembalikan = tanggalDikembalikan;

        res.json({
            message: "Buku berhasil dikembalikan.",
            borrowing
        });
    } catch (error) {
        console.error("PATCH /borrowings/:id:", error);
        res.status(500).json({
            message: "Gagal memperbarui data peminjaman."
        });
    }
});

// ===============================
// EXPORT KE SERVER UTAMA
// ===============================
module.exports = router;
