const express = require("express");
const db = require("../config/db");

const router = express.Router();

function mapBook(row) {
    return {
        id: row.id,
        title: row.judul,
        author: row.penulis,
        category: row.category || "",
        available: row.status === "available",
        cover_url: row.sampul || ""
    };
}

// ===============================
// BOOK SERVICE HEALTH
// ===============================
router.get("/books/health", (req, res) => {
    res.json({
        service: "book-service",
        status: "ok"
    });
});

// ===============================
// GET SEMUA BUKU
// ===============================
router.get("/books", async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT
                id,
                judul,
                penulis,
                category,
                sampul,
                status
            FROM books
            ORDER BY id
        `);

        res.json(rows.map(mapBook));
    } catch (error) {
        console.error("GET /books:", error);
        res.status(500).json({
            message: "Gagal mengambil data buku."
        });
    }
});

// ===============================
// GET BUKU BERDASARKAN ID
// ===============================
router.get("/books/:id", async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT
                id,
                judul,
                penulis,
                category,
                sampul,
                status
            FROM books
            WHERE id = ?
        `, [req.params.id]);

        if (rows.length === 0) {
            return res.status(404).json({
                message: "Buku tidak ditemukan."
            });
        }

        res.json(mapBook(rows[0]));
    } catch (error) {
        console.error("GET /books/:id:", error);
        res.status(500).json({
            message: "Gagal mengambil data buku."
        });
    }
});

// ===============================
// TAMBAH BUKU
// ===============================
router.post("/books", async (req, res) => {
    const {
        id,
        title,
        author,
        category,
        available = true,
        cover_url = "",
        judul,
        penulis,
        sampul,
        status
    } = req.body;

    const bookTitle = title || judul;
    const bookAuthor = author || penulis;
    const bookCover = cover_url || sampul || "";
    const bookAvailable = typeof available === "boolean"
        ? available
        : status === "available";

    if (!id || !bookTitle || !bookAuthor) {
        return res.status(400).json({
            message: "id, title, dan author wajib diisi."
        });
    }

    try {
        const [existing] = await db.query(
            "SELECT id FROM books WHERE id = ?",
            [id]
        );

        if (existing.length > 0) {
            return res.status(409).json({
                message: "ID buku sudah digunakan."
            });
        }

        await db.query(`
            INSERT INTO books
                (id, judul, penulis, sampul, status)
            VALUES (?, ?, ?, ?, ?)
        `, [
            String(id),
            bookTitle,
            bookAuthor,
            bookCover,
            bookAvailable ? "available" : "borrowed"
        ]);

        const [rows] = await db.query(`
            SELECT
                id,
                judul,
                penulis,
                category,
                sampul,
                status
            FROM books
            WHERE id = ?
        `, [id]);

        res.status(201).json(mapBook(rows[0]));
    } catch (error) {
        console.error("POST /books:", error);
        res.status(500).json({
            message: "Gagal menambahkan buku."
        });
    }
});

// ===============================
// UPDATE STATUS BUKU
// ===============================
router.patch("/books/:id/status", async (req, res) => {
    // Status buku hanya boleh berubah melalui transaksi peminjaman/pengembalian.
    // Endpoint dipertahankan untuk kompatibilitas, tetapi perubahan langsung ditolak.
    return res.status(403).json({
        message: "Status buku hanya dapat diubah melalui endpoint peminjaman atau pengembalian."
    });
});

// ===============================
// EXPORT KE SERVER UTAMA
// ===============================
module.exports = router;
