CREATE DATABASE IF NOT EXISTS perpustakaan
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE perpustakaan;

-- =========================================================
-- USERS / MAHASISWA
-- =========================================================
CREATE TABLE IF NOT EXISTS users (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    nim VARCHAR(30) NOT NULL,
    nama VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_users_nim (nim)
) ENGINE=InnoDB;

-- =========================================================
-- BOOKS
-- status = available / borrowed
-- =========================================================
CREATE TABLE IF NOT EXISTS books (
    id VARCHAR(30) NOT NULL,
    judul VARCHAR(255) NOT NULL,
    penulis VARCHAR(150) NOT NULL,
    category VARCHAR(100) NULL,
    sampul TEXT NULL,
    status ENUM('available', 'borrowed') NOT NULL DEFAULT 'available',
    PRIMARY KEY (id)
) ENGINE=InnoDB;

-- =========================================================
-- LOANS / PEMINJAMAN
-- status dan tanggal_dikembalikan dipertahankan untuk mendukung
-- alur pengembalian yang sudah ada di project.
-- =========================================================
CREATE TABLE IF NOT EXISTS loans (
    id VARCHAR(50) NOT NULL,
    nim VARCHAR(30) NOT NULL,
    id_buku VARCHAR(30) NOT NULL,
    tanggal_pinjam DATE NOT NULL,
    batas_pengembalian DATE NOT NULL,
    status ENUM('borrowed', 'returned') NOT NULL DEFAULT 'borrowed',
    tanggal_dikembalikan DATE NULL,
    PRIMARY KEY (id),
    KEY idx_loans_nim (nim),
    KEY idx_loans_id_buku (id_buku),
    CONSTRAINT fk_loans_user_nim
        FOREIGN KEY (nim) REFERENCES users(nim)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT fk_loans_book_id
        FOREIGN KEY (id_buku) REFERENCES books(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) ENGINE=InnoDB;

-- =========================================================
-- SEED USERS
-- Berdasarkan borrowing-service/data.json
-- =========================================================
INSERT INTO users (id, nim, nama, password)
VALUES
    (1, '2310001', 'Mahasiswa 1', '12345'),
    (2, '2310002', 'Mahasiswa 2', '12345'),
    (3, '2310003', 'Mahasiswa 3', '12345')
ON DUPLICATE KEY UPDATE
    nim = VALUES(nim),
    nama = VALUES(nama),
    password = VALUES(password);

-- =========================================================
-- SEED BOOKS
-- Berdasarkan book-service/books.json
-- =========================================================
INSERT INTO books (id, judul, penulis, category, sampul, status)
VALUES
    (
        'BK001',
        'Laskar Pelangi',
        'Andrea Hirata',
        'Novel',
        'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=85',
        'borrowed'
    ),
    (
        'BK002',
        'Bumi Manusia',
        'Pramoedya Ananta Toer',
        'Novel',
        'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=600&q=85',
        'borrowed'
    ),
    (
        'BK003',
        'Negeri 5 Menara',
        'Ahmad Fuadi',
        'Novel',
        'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=85',
        'borrowed'
    ),
    (
        'BK004',
        'Filosofi Teras',
        'Henry Manampiring',
        'Pengembangan Diri',
        'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=600&q=85',
        'available'
    ),
    (
        'BK005',
        'Atomic Habits',
        'James Clear',
        'Pengembangan Diri',
        'https://images.unsplash.com/photo-1511108690759-009324a90311?auto=format&fit=crop&w=600&q=85',
        'available'
    ),
    (
        'BK006',
        'Clean Code',
        'Robert C. Martin',
        'Teknologi',
        'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=600&q=85',
        'available'
    )
ON DUPLICATE KEY UPDATE
    judul = VALUES(judul),
    penulis = VALUES(penulis),
    category = VALUES(category),
    sampul = VALUES(sampul),
    status = VALUES(status);

-- =========================================================
-- SEED LOANS
-- Berdasarkan borrowing-service/data.json
-- =========================================================
INSERT INTO loans
    (id, nim, id_buku, tanggal_pinjam, batas_pengembalian, status, tanggal_dikembalikan)
VALUES
    ('BR1790948746781', '2310001', 'BK001', '2026-10-02', '2026-10-09', 'returned', '2026-10-02'),
    ('BR1790948748085', '2310001', 'BK002', '2026-10-02', '2026-10-09', 'borrowed', NULL),
    ('BR1790948749174', '2310001', 'BK003', '2026-10-02', '2026-10-09', 'borrowed', NULL),
    ('BR1790953676532', '2310001', 'BK001', '2026-10-02', '2026-10-09', 'borrowed', NULL)
ON DUPLICATE KEY UPDATE
    nim = VALUES(nim),
    id_buku = VALUES(id_buku),
    tanggal_pinjam = VALUES(tanggal_pinjam),
    batas_pengembalian = VALUES(batas_pengembalian),
    status = VALUES(status),
    tanggal_dikembalikan = VALUES(tanggal_dikembalikan);
