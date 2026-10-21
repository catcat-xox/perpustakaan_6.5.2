const express = require("express");
const crypto = require("crypto");
const db = require("../config/db");

const router = express.Router();
const MAX_ACTIVE_LOANS = 3;
const BORROWING_DAYS = 7;

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

router.get("/borrowings/health", (req, res) => {
    res.json({ service: "borrowing-service", status: "ok" });
});

async function getBorrowingsByStudent(studentId) {
    const [rows] = await db.query(`
        SELECT id, nim, id_buku, tanggal_pinjam, batas_pengembalian,
               status, tanggal_dikembalikan
        FROM loans
        WHERE nim = ?
        ORDER BY tanggal_pinjam DESC, id DESC
    `, [String(studentId)]);
    const borrowings = rows.map(mapLoan);
    return {
        borrowings,
        activeCount: borrowings.filter(item => item.status === "borrowed").length
    };
}

// Endpoint lama dipertahankan. Pengguna hanya boleh melihat riwayat miliknya sendiri.
async function historyHandler(req, res) {
    const requestedNim = req.params.studentId || req.params.userId;
    if (String(requestedNim) !== String(req.user.nim)) {
        return res.status(403).json({ message: "Anda hanya dapat melihat riwayat peminjaman sendiri." });
    }
    try {
        res.json(await getBorrowingsByStudent(req.user.nim));
    } catch (error) {
        console.error("GET borrowing history:", error);
        res.status(500).json({ message: "Gagal mengambil riwayat peminjaman." });
    }
}
router.get("/borrowings/student/:studentId", historyHandler);
router.get("/borrowings/user/:userId", historyHandler);
router.get("/borrowings", async (req, res) => {
    try {
        res.json(await getBorrowingsByStudent(req.user.nim));
    } catch (error) {
        console.error("GET /borrowings:", error);
        res.status(500).json({ message: "Gagal mengambil riwayat peminjaman." });
    }
});

// POST /api/borrowings — identitas mahasiswa berasal dari JWT, bukan request body.
router.post("/borrowings", async (req, res) => {
    const { bookId } = req.body;
    if (!bookId || typeof bookId !== "string") {
        return res.status(400).json({ message: "bookId wajib diisi sebagai teks." });
    }
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        // Lock baris user agar dua permintaan paralel tidak melewati limit 3.
        const [users] = await conn.query(
            "SELECT nim FROM users WHERE nim = ? FOR UPDATE",
            [String(req.user.nim)]
        );
        if (!users.length) {
            await conn.rollback();
            return res.status(401).json({ message: "Akun mahasiswa tidak ditemukan." });
        }

        const [activeRows] = await conn.query(
            "SELECT COUNT(*) AS activeCount FROM loans WHERE nim = ? AND status = 'borrowed'",
            [String(req.user.nim)]
        );
        if (Number(activeRows[0].activeCount) >= MAX_ACTIVE_LOANS) {
            await conn.rollback();
            return res.status(409).json({
                message: "Maksimal 3 buku aktif. Kembalikan salah satu buku terlebih dahulu.",
                code: "ACTIVE_LOAN_LIMIT"
            });
        }

        const [books] = await conn.query(
            "SELECT id, status FROM books WHERE id = ? FOR UPDATE",
            [bookId]
        );
        if (!books.length) {
            await conn.rollback();
            return res.status(404).json({ message: "Buku tidak ditemukan." });
        }
        if (books[0].status !== "available") {
            await conn.rollback();
            return res.status(409).json({
                message: "Buku sedang dipinjam / tidak tersedia.",
                code: "BOOK_UNAVAILABLE"
            });
        }

        const id = `BR${Date.now()}${crypto.randomBytes(3).toString("hex")}`;
        await conn.query(`
            INSERT INTO loans
                (id, nim, id_buku, tanggal_pinjam, batas_pengembalian, status)
            VALUES (?, ?, ?, CURDATE(), DATE_ADD(CURDATE(), INTERVAL ? DAY), 'borrowed')
        `, [id, String(req.user.nim), bookId, BORROWING_DAYS]);
        await conn.query("UPDATE books SET status = 'borrowed' WHERE id = ?", [bookId]);

        const [createdRows] = await conn.query(`
            SELECT id, nim, id_buku, tanggal_pinjam, batas_pengembalian,
                   status, tanggal_dikembalikan
            FROM loans WHERE id = ?
        `, [id]);
        await conn.commit();
        res.status(201).json({
            message: "Peminjaman berhasil.",
            borrowing: mapLoan(createdRows[0])
        });
    } catch (error) {
        await conn.rollback();
        console.error("POST /borrowings:", error);
        res.status(500).json({ message: "Gagal menyimpan data peminjaman." });
    } finally {
        conn.release();
    }
});

// PATCH /api/borrowings/:id/return — kompatibel dengan route lama PATCH /:id.
async function returnHandler(req, res) {
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();
        const [rows] = await conn.query(`
            SELECT id, nim, id_buku, tanggal_pinjam, batas_pengembalian,
                   status, tanggal_dikembalikan
            FROM loans WHERE id = ? FOR UPDATE
        `, [req.params.id]);

        if (!rows.length) {
            await conn.rollback();
            return res.status(404).json({ message: "Data peminjaman tidak ditemukan." });
        }
        const row = rows[0];
        if (String(row.nim) !== String(req.user.nim)) {
            await conn.rollback();
            return res.status(403).json({ message: "Anda hanya dapat mengembalikan peminjaman sendiri." });
        }
        if (row.status === "returned") {
            await conn.rollback();
            return res.status(409).json({ message: "Buku sudah dikembalikan.", code: "ALREADY_RETURNED" });
        }

        await conn.query(
            "UPDATE loans SET status = 'returned', tanggal_dikembalikan = CURDATE() WHERE id = ?",
            [req.params.id]
        );
        await conn.query(
            "UPDATE books SET status = 'available' WHERE id = ?",
            [row.id_buku]
        );
        const [updatedRows] = await conn.query(`
            SELECT id, nim, id_buku, tanggal_pinjam, batas_pengembalian,
                   status, tanggal_dikembalikan
            FROM loans WHERE id = ?
        `, [req.params.id]);
        await conn.commit();
        return res.json({ message: "Buku berhasil dikembalikan.", borrowing: mapLoan(updatedRows[0]) });
    } catch (error) {
        await conn.rollback();
        console.error("Return borrowing:", error);
        return res.status(500).json({ message: "Gagal memperbarui data peminjaman." });
    } finally {
        conn.release();
    }
}
router.patch("/borrowings/:id/return", returnHandler);
router.patch("/borrowings/:id", returnHandler);

module.exports = router;
