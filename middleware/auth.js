const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
    const authHeader = req.headers.authorization;

    // Tidak ada Authorization header
    if (!authHeader) {
        return res.status(401).json({
            message: "Unauthorized. Token tidak ditemukan."
        });
    }

    // Format harus:
    // Authorization: Bearer TOKEN
    const parts = authHeader.split(" ");

    if (
        parts.length !== 2 ||
        parts[0] !== "Bearer"
    ) {
        return res.status(401).json({
            message:
                "Unauthorized. Format Authorization harus Bearer <TOKEN>."
        });
    }

    const token = parts[1];

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // Simpan informasi user ke request
        req.user = decoded;

        next();

    } catch (error) {
        console.error("JWT verification:", error.message);

        return res.status(401).json({
            message:
                "Unauthorized. Token tidak valid atau sudah kedaluwarsa."
        });
    }
}

module.exports = verifyToken;