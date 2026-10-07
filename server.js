const express = require("express");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config();

const authRoutes = require("./routes/authRoutes");
const verifyToken = require("./middleware/auth");

const bookService = require("./book-service/server");
const borrowingService = require("./borrowing-service/server");

const app = express();
const PORT = 3000;

// ======================================
// GLOBAL MIDDLEWARE
// ======================================

app.use(cors());
app.use(express.json());

// ======================================
// AUTHENTICATION
// ======================================

// Login TIDAK membutuhkan JWT
app.use("/api/auth", authRoutes);

// ======================================
// PROTECTED API
// ======================================

// Semua endpoint service setelah bagian ini
// membutuhkan JWT.
app.use("/api", verifyToken);

// Book Service
app.use("/api", bookService);

// Borrowing Service
app.use("/api", borrowingService);

// ======================================
// FRONTEND
// ======================================

app.use(
    express.static(
        path.join(__dirname, "frontend")
    )
);

app.get("/", (req, res) => {
    res.sendFile(
        path.join(
            __dirname,
            "frontend",
            "index.html"
        )
    );
});

// ======================================
// START SERVER
// ======================================

app.listen(PORT, () => {
    console.log(
        `Server berjalan di http://localhost:${PORT}`
    );
});