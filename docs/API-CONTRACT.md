# API Contract — Perpustakaan Microservices

## Base URL
`http://localhost:3000`

Format request/response: `application/json`. Semua endpoint `/api/*` kecuali `POST /api/auth/login` membutuhkan header `Authorization: Bearer <JWT>`.

## 1. Login
`POST /api/auth/login` — publik

Request:
```json
{ "nim": "2310002", "password": "12345" }
```
Field lama `studentId` juga diterima untuk kompatibilitas frontend.

Success `200`:
```json
{
  "message": "Login berhasil.",
  "token": "<JWT>",
  "user": { "studentId": "2310002", "name": "Mahasiswa 2" }
}
```
Errors: `400` field wajib kosong; `401` NIM/password salah; `500` kegagalan server/database.

## 2. Health checks
- `GET /api/books/health`
- `GET /api/borrowings/health`

Success `200`: `{ "service": "book-service", "status": "ok" }` atau nama service terkait. Health route saat ini memeriksa proses router, bukan melakukan query DB.

## 3. Daftar buku
`GET /api/books` — JWT wajib; tanpa parameter.

Success `200`:
```json
[
  {
    "id": "BK004",
    "title": "Filosofi Teras",
    "author": "Henry Manampiring",
    "category": "Pengembangan Diri",
    "available": true,
    "cover_url": "https://..."
  }
]
```
Errors: `401` token hilang/tidak valid; `500` gagal membaca database.

## 4. Detail buku
`GET /api/books/{id}` — JWT wajib. Path parameter `id`, contoh `BK004`.

Success `200`: objek buku dengan field yang sama seperti daftar buku.
Errors: `401` token tidak valid; `404` buku tidak ditemukan; `500` kegagalan server.

## 5. Buat peminjaman
`POST /api/borrowings` — JWT wajib.

Request:
```json
{ "bookId": "BK004" }
```
`studentId` dari body tidak digunakan untuk menentukan peminjam; identitas diambil dari token.

Success `201`:
```json
{
  "message": "Peminjaman berhasil.",
  "borrowing": {
    "id": "BR...",
    "studentId": "2310002",
    "bookId": "BK004",
    "tanggalPinjam": "YYYY-MM-DD",
    "batasPengembalian": "YYYY-MM-DD",
    "status": "borrowed"
  }
}
```
Errors:
- `400` `bookId` kosong/bukan string.
- `401` token tidak valid atau akun tidak ada.
- `404` buku tidak ditemukan.
- `409` `ACTIVE_LOAN_LIMIT` bila sudah ada 3 buku aktif; `BOOK_UNAVAILABLE` bila buku sedang dipinjam.
- `500` transaksi database gagal.

Business rules: maksimal tiga transaksi `borrowed` per mahasiswa; tanggal jatuh tempo ditetapkan database menjadi tanggal pinjam + 7 hari; insert transaksi dan update status buku dijalankan dalam satu transaksi SQL.

## 6. Riwayat peminjaman
`GET /api/borrowings` — JWT wajib; mengembalikan riwayat akun yang login.

Success `200`:
```json
{
  "borrowings": [
    {
      "id": "BR...",
      "studentId": "2310002",
      "bookId": "BK004",
      "tanggalPinjam": "YYYY-MM-DD",
      "batasPengembalian": "YYYY-MM-DD",
      "status": "returned",
      "tanggalDikembalikan": "YYYY-MM-DD"
    }
  ],
  "activeCount": 0
}
```
Route kompatibilitas `GET /api/borrowings/student/{studentId}` dan `/api/borrowings/user/{userId}` tetap tersedia. Parameter harus sama dengan NIM token; selain itu `403`.

Errors: `401` token tidak valid; `403` mencoba membaca riwayat pengguna lain; `500` gagal membaca database.

## 7. Pengembalian buku
`PATCH /api/borrowings/{id}/return` — JWT wajib.

Request body tidak diperlukan. Route lama `PATCH /api/borrowings/{id}` tetap diterima; jika menggunakan route lama, body `{ "status": "returned" }` boleh dikirim.

Success `200`:
```json
{
  "message": "Buku berhasil dikembalikan.",
  "borrowing": {
    "id": "BR...",
    "studentId": "2310002",
    "bookId": "BK004",
    "tanggalPinjam": "YYYY-MM-DD",
    "batasPengembalian": "YYYY-MM-DD",
    "status": "returned",
    "tanggalDikembalikan": "YYYY-MM-DD"
  }
}
```
Errors: `401` token tidak valid; `403` transaksi milik pengguna lain; `404` transaksi tidak ditemukan; `409` transaksi sudah dikembalikan; `500` transaksi database gagal. Pengembalian mengubah status loan menjadi `returned`, mengisi tanggal pengembalian, dan mengubah status buku menjadi `available` dalam transaksi SQL.

## 8. Endpoint kompatibilitas pengelolaan buku
- `POST /api/books` dipertahankan dari proyek lama. Endpoint ini saat ini belum memiliki role admin terpisah; untuk penggunaan produksi perlu ditambahkan otorisasi admin.
- `PATCH /api/books/{id}/status` dipertahankan agar klien lama tidak mendapat 404, tetapi mengembalikan `403`. Status buku hanya boleh berubah melalui transaksi pinjam/kembali agar stok tidak dapat dimanipulasi langsung.

## Header dan status umum
- `Content-Type: application/json` untuk request dengan body.
- `Authorization: Bearer <JWT>` untuk semua endpoint terlindungi.
- `200` sukses baca/perubahan; `201` berhasil membuat peminjaman; `400` validasi; `401` autentikasi; `403` akses dilarang; `404` resource tidak ada; `409` konflik business rule; `500` kesalahan server.
