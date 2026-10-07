# Perpustakaan Microservices

Project ini mempertahankan frontend dan route API yang sudah ada, tetapi penyimpanan data telah dimigrasikan dari file JSON ke MySQL. Frontend tidak menggunakan `localStorage`/`sessionStorage` untuk data aplikasi.

## Struktur utama

- `frontend/` — HTML, CSS, dan JavaScript asli
- `book-service/server.js` — katalog buku dan status ketersediaan
- `borrowing-service/server.js` — login, peminjaman, dan pengembalian
- `config/db.js` — connection pool MySQL menggunakan `mysql2/promise`
- `database.sql` — DDL dan seeder database
- `.env.example` — template konfigurasi database
- `.env` — konfigurasi lokal (jangan di-commit)
- `server.js` — satu server utama pada port 3000

## Database

Database yang digunakan: `perpustakaan`

Tabel:

- `users` — id, NIM, nama, password
- `books` — id, judul, penulis, kategori, sampul, status
- `loans` — id, NIM, id buku, tanggal pinjam, batas pengembalian, status, tanggal dikembalikan

Relasi:

```text
users.nim 1 ───────< loans.nim
books.id  1 ───────< loans.id_buku
```

## 1. Persiapan MySQL

Pastikan MySQL/MariaDB sudah berjalan, misalnya melalui XAMPP.

Import `database.sql` melalui phpMyAdmin menu **Import/SQL**, atau melalui MySQL CLI:

```bash
mysql -u root -p < database.sql
```

Sesuaikan `.env` dengan konfigurasi MySQL lokal Anda:

```env
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=perpustakaan
DB_PORT=3306
```

## 2. Instal dependency

Dari root project:

```bash
npm install
```

Dependency utama:

- Express
- Axios
- CORS
- dotenv
- mysql2

## 3. Jalankan aplikasi

Cukup jalankan satu server dari root:

```bash
npm start
```

Server:

```text
http://localhost:3000
```

Kemudian buka alamat tersebut di browser.

Tidak perlu menjalankan `book-service` dan `borrowing-service` sebagai server terpisah karena keduanya dipasang sebagai router ke server utama.

## 4. Akun uji

- NIM: `2310001` — Password: `12345`
- NIM: `2310002` — Password: `12345`
- NIM: `2310003` — Password: `12345`

## 5. Aturan bisnis yang dipertahankan

- Login menggunakan NIM dan password.
- Katalog buku dan status ketersediaan berasal dari MySQL.
- Maksimal 3 buku aktif per mahasiswa.
- Masa pinjam otomatis 7 hari.
- Buku harus tersedia sebelum dipinjam.
- Saat peminjaman berhasil, status buku menjadi `borrowed`.
- Saat dikembalikan, status buku menjadi `available`.

## 6. API utama

```text
GET    /api/books/health
GET    /api/books
GET    /api/books/:id
POST   /api/books
PATCH  /api/books/:id/status

GET    /api/borrowings/health
POST   /api/auth/login
GET    /api/borrowings/student/:studentId
GET    /api/borrowings/user/:userId
POST   /api/borrowings
PATCH  /api/borrowings/:id
```

## 7. Catatan keamanan

File `.env` dikecualikan oleh `.gitignore`. Jangan mengunggah password database asli ke repository. Password mahasiswa pada seeder masih plaintext untuk mempertahankan perilaku project tugas; untuk aplikasi produksi, gunakan password hashing seperti bcrypt.

## Git & Repository Hygiene

File `.gitignore` mengecualikan `node_modules/`, file `.env`, dan file log agar dependency hasil instalasi dan konfigurasi lokal tidak ikut masuk repository.

Jika `node_modules` sudah terlanjur di-track Git:

```bash
git rm -r --cached .
git add .
git commit -m "chore: add gitignore and remove generated files from tracking"
git push
```
