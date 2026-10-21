# TESTING — Perpustakaan Microservices

Pastikan database MySQL/MariaDB sudah diimpor dari `database.sql`, lalu jalankan server utama dari root proyek:

```bash
npm install
npm run check
npm start
```

Base URL: `http://localhost:3000`

## 1. Login

```http
POST /api/auth/login
Content-Type: application/json
```

```json
{
  "nim": "2310002",
  "password": "12345"
}
```

Simpan nilai `token` dari response. Untuk endpoint terlindungi, kirim header:

```http
Authorization: Bearer <JWT>
```

## 2. Katalog buku

```http
GET /api/books
GET /api/books/BK004
```

Gunakan token JWT. `BK004` adalah salah satu buku yang tersedia pada seed awal.

## 3. Riwayat peminjaman

```http
GET /api/borrowings
```

Endpoint ini hanya mengembalikan riwayat akun yang sedang login. Route kompatibilitas `GET /api/borrowings/student/2310002` juga tersedia dan hanya menerima NIM yang sama dengan NIM di token.

## 4. Pinjam buku

```http
POST /api/borrowings
Authorization: Bearer <JWT>
Content-Type: application/json
```

```json
{
  "bookId": "BK004"
}
```

Identitas mahasiswa diambil dari JWT. Jangan mengandalkan `studentId` yang dikirim dalam body. Pinjam dengan akun `2310002` untuk skenario sukses. Akun `2310001` memiliki tiga transaksi aktif pada seed untuk menguji penolakan peminjaman keempat.

## 5. Kembalikan buku

Ganti `BR_ID` dengan ID peminjaman dari response:

```http
PATCH /api/borrowings/BR_ID/return
Authorization: Bearer <JWT>
```

Body tidak diperlukan. Route lama `PATCH /api/borrowings/BR_ID` tetap tersedia untuk kompatibilitas.

## 6. Skenario wajib

- Login valid dan login dengan password salah.
- Request endpoint protected tanpa token.
- Daftar buku dan detail buku valid/tidak ditemukan.
- Pinjam buku tersedia.
- Pinjam buku tidak tersedia.
- Pinjaman keempat ditolak.
- Jatuh tempo tujuh hari setelah tanggal pinjam.
- Riwayat akun sendiri dapat diakses, riwayat akun lain ditolak.
- Pengembalian berhasil dan pengembalian ganda ditolak.
- Status buku tersedia lagi setelah dikembalikan.
- Perubahan status buku secara langsung ditolak.

Impor `api-test/collection.json` ke Postman dan jalankan request secara berurutan. Simpan screenshot hasil tes aktual ke folder `api-test/` sebagai bukti tugas. Lihat `docs/API-CONTRACT.md` untuk detail request/response.
