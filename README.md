# Perpustakaan Microservices — UTS Vibe Coding

Proyek ini adalah kelanjutan dari proyek kelompok yang sudah ada. Struktur awal dipertahankan: `book-service/`, `borrowing-service/`, `config/`, `middleware/`, `routes/`, `frontend/`, `database.sql`, dan `server.js`. Folder `docs/` dan `api-test/` ditambahkan hanya untuk memenuhi deliverables UTS.

## Struktur proyek

```text
perpustakaan-microservices/
├── book-service/
│   └── server.js
├── borrowing-service/
│   └── server.js
├── config/
│   └── db.js
├── database.sql
├── frontend/
│   ├── index.html
│   ├── script.js
│   └── style.css
├── middleware/
│   └── auth.js
├── routes/
│   └── authRoutes.js
├── scripts/
│   └── hashPasswords.js
├── docs/
│   ├── PRD.md
│   ├── API-CONTRACT.md
│   ├── CODE_REVIEW_LOG.md
│   └── AI_PROMPTS.md
├── api-test/
│   └── collection.json
├── postman_collection.json
├── TESTING.md
├── .env.example
├── package.json
└── server.js
```

## Teknologi
- Node.js dan Express
- MySQL/MariaDB dengan `mysql2/promise`
- JWT untuk autentikasi (`jsonwebtoken`)
- bcrypt (`bcryptjs`) untuk memverifikasi password
- Postman untuk pengujian API
- Frontend HTML/CSS/JavaScript lama tetap dipertahankan

## Kebutuhan
- Node.js versi 18 atau lebih baru
- MySQL/MariaDB (misalnya XAMPP)
- Postman (untuk tes API)

## 1. Konfigurasi database

1. Jalankan MySQL dari XAMPP.
2. Buka phpMyAdmin.
3. Impor file `database.sql`. File ini membuat database `perpustakaan`, tabel `users`, `books`, `loans`, relasi foreign key, serta data uji.
4. Periksa `.env` di root proyek. Nilai default disediakan untuk instalasi lokal:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASS=
   DB_NAME=perpustakaan
   DB_PORT=3306
   JWT_SECRET=dev-only-change-this-secret-before-deployment
   JWT_EXPIRES_IN=2h
   ```
   Sesuaikan nama pengguna/password MySQL jika berbeda. Secret default hanya untuk development lokal; ganti sebelum deployment.

## 2. Instal dependency

Buka terminal di root folder `perpustakaan-microservices/`:

```bash
npm install
```

## 3. Jalankan dan periksa backend

```bash
npm run check
npm start
```

Server utama berjalan di `http://localhost:3000`. Jalankan **satu server saja**; `book-service/server.js` dan `borrowing-service/server.js` adalah router yang dipasang oleh `server.js`, bukan server terpisah.

Buka `http://localhost:3000/` untuk frontend. Health checks:
- `GET http://localhost:3000/api/books/health`
- `GET http://localhost:3000/api/borrowings/health`

## 4. Akun uji

Semua akun seed menggunakan password `12345` (password disimpan sebagai bcrypt hash di database).

| NIM | Password | Kegunaan |
|---|---|---|
| `2310001` | `12345` | Seed memiliki 3 peminjaman aktif untuk menguji limit |
| `2310002` | `12345` | Pengujian pinjam dan kembali |
| `2310003` | `12345` | Akun pengujian tambahan |

Buku `BK001`–`BK003` diset sedang dipinjam pada seed; `BK004`–`BK006` tersedia. Seed transaksi demo dapat diimpor ulang untuk reset status data demo, tetapi gunakan database uji, bukan database berisi data penting.

## 5. API utama

Base URL: `http://localhost:3000`

| Method | Endpoint | Tujuan | Login |
|---|---|---|---|
| POST | `/api/auth/login` | Login dan memperoleh JWT | Tidak |
| GET | `/api/books` | Daftar buku | Ya |
| GET | `/api/books/:id` | Detail buku | Ya |
| POST | `/api/borrowings` | Meminjam buku | Ya |
| GET | `/api/borrowings` | Riwayat akun login | Ya |
| GET | `/api/borrowings/student/:studentId` | Riwayat kompatibilitas | Ya, NIM harus milik token |
| PATCH | `/api/borrowings/:id/return` | Mengembalikan buku | Ya |
| PATCH | `/api/borrowings/:id` | Route pengembalian lama | Ya |

Header endpoint terlindungi:

```http
Authorization: Bearer <JWT>
Content-Type: application/json
```

Detail request, response, validasi, dan status code ada di `docs/API-CONTRACT.md`.

## 6. Business rules yang diterapkan

- Maksimal 3 peminjaman aktif per mahasiswa.
- Buku tidak tersedia ditolak.
- Jatuh tempo ditetapkan database menjadi tanggal pinjam + 7 hari.
- Peminjam ditentukan oleh JWT, bukan nilai `studentId` yang dikirim klien.
- Peminjaman dan pengembalian memperbarui transaksi dan status buku dalam transaksi SQL.
- Mahasiswa hanya dapat melihat riwayat dan mengembalikan transaksi miliknya. Frontend menyediakan tombol Kembalikan Buku pada setiap transaksi aktif.
- Status buku tidak dapat diubah secara langsung lewat `PATCH /api/books/:id/status`; perubahan harus melalui alur pinjam/kembali.

## 7. Pengujian Postman

1. Pastikan MySQL dan server Node.js berjalan.
2. Impor `api-test/collection.json` (atau file kompatibel `postman_collection.json`) ke Postman.
3. Jalankan request collection dari atas ke bawah. Dua login valid menyimpan token pada collection variables: `tokenLimit` untuk mahasiswa 2310001 dan `token` untuk mahasiswa 2310002.
4. Collection menguji login valid/salah, token hilang, katalog, ID buku tidak ada, riwayat sendiri/akun lain, limit tiga buku, buku tidak tersedia, peminjaman berhasil, tanggal jatuh tempo tujuh hari, pengembalian, pengembalian ganda, dan perubahan status langsung yang ditolak.
5. Setelah menjalankan tes, simpan screenshot hasil aktual ke folder `api-test/` untuk bukti UTS. Collection tidak berarti semua tes sudah lulus sebelum dijalankan.

## 8. Code review dan penggunaan AI

- Temuan review awal ada di `docs/CODE_REVIEW_LOG.md`.
- Prompt pengembangan dicatat di `docs/AI_PROMPTS.md`.
- Anggota kelompok harus menguji ulang, mengisi reviewer/tanggal, mencatat hasil aktual, dan memahami semua perubahan sebelum mengumpulkan.
- PRD ada di `docs/PRD.md`; lengkapi nama/NIM anggota dan URL repository.

## Catatan
File `.env` lokal tidak boleh di-commit ke repository. Gunakan `.env.example` sebagai template. Jangan gunakan data/password uji pada sistem produksi.
