const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const db = require("../config/db");

const router = express.Router();

// ======================================
// POST /api/auth/login
// ======================================
router.post("/login", async (req, res) => {
    const {
        nim,
        studentId,
        password
    } = req.body;

    // Mendukung nama field lama:
    // studentId
    // dan nama baru:
    // nim
    const loginNim = nim || studentId;

    if (!loginNim || !password) {
        return res.status(400).json({
            message:
                "NIM dan password wajib diisi."
        });
    }

    try {
        // ======================================
        // Cari user berdasarkan NIM
        // ======================================

        const [rows] = await db.query(
            `
            SELECT
                id,
                nim,
                nama,
                password
            FROM users
            WHERE nim = ?
            LIMIT 1
            `,
            [String(loginNim)]
        );

        if (rows.length === 0) {
            return res.status(401).json({
                message:
                    "NIM atau password salah."
            });
        }

        const user = rows[0];

        // ======================================
        // Verifikasi password dengan bcrypt
        // ======================================

        const passwordValid =
            await bcrypt.compare(
                String(password),
                user.password
            );

        if (!passwordValid) {
            return res.status(401).json({
                message:
                    "NIM atau password salah."
            });
        }

        // ======================================
        // Buat JWT
        // ======================================

        const token = jwt.sign(
            {
                id: user.id,
                nim: user.nim,
                nama: user.nama
            },
            process.env.JWT_SECRET,
            {
                expiresIn:
                    process.env.JWT_EXPIRES_IN ||
                    "2h"
            }
        );

        // ======================================
        // Response
        // ======================================

        res.json({
            message: "Login berhasil.",

            token,

            user: {
                studentId: user.nim,
                name: user.nama
            }
        });

    } catch (error) {
        console.error(
            "POST /api/auth/login:",
            error
        );

        res.status(500).json({
            message:
                "Gagal melakukan login."
        });
    }
});

module.exports = router;