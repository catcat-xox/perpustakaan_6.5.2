# Product Requirements Document (PRD) — Perpustakaan Microservices

## 1. Informasi Proyek
- **Nama proyek:** Perpustakaan Microservices
- **Anggota dan NIM:** 
Wandi Saputra – 2441919033
Siti Hafizah – 2441919064
Divani Laras Putri – 2441919041
Nabila Familya Putri – 2441919039 
Gracia Dinata Afni Oktavia – 2441919047
- **Versi/tanggal:** UTS v3.0 — 19 Oktober 2026
- **Repository:** https://github.com/catcat-xox/perpustakaan_6.5.2.git.

## 2. Ringkasan
Aplikasi perpustakaan ini merupakan kelanjutan proyek kelompok yang menggunakan frontend web sederhana dan backend Node.js/Express. Mahasiswa login, melihat katalog dan ketersediaan buku, meminjam buku, melihat riwayat, dan mengembalikan buku. Data pengguna, buku, serta transaksi tersimpan di MySQL/MariaDB; endpoint diuji melalui Postman.

## 3. Tujuan
1. Mempertahankan proyek Tugas 3 dan struktur folder awal.
2. Menghubungkan autentikasi, katalog, dan transaksi ke database relasional.
3. Menerapkan limit maksimal tiga buku aktif per mahasiswa.
4. Menetapkan jatuh tempo tujuh hari setelah tanggal pinjam.
5. Mendokumentasikan dan menguji endpoint sukses maupun gagal.

## 4. Pengguna dan Peran
- **Mahasiswa:** login, melihat buku, meminjam buku yang tersedia, melihat riwayat sendiri, dan mengembalikan peminjaman milik sendiri.
- **Pengelola proyek/penguji:** menyiapkan database dan menjalankan pengujian. Sistem belum memiliki peran admin terpisah.

## 5. Ruang Lingkup
**In scope:** autentikasi JWT, katalog daftar/detail, peminjaman, riwayat, pengembalian, database MySQL/MariaDB, API contract, Postman collection, code review log, README.

**Out of scope:** frontend baru, denda, notifikasi, reservasi, banyak server/port, dan fitur di luar arahan UTS.

## 6. Technology Stack
- Backend: Node.js + Express
- Database: MySQL/MariaDB dengan `mysql2/promise`
- Auth: JWT (`jsonwebtoken`) dan password hashing bcrypt (`bcryptjs`)
- API: HTTP/JSON
- Pengujian: Postman
- AI assistant: ChatGPT; hasilnya harus direview dan diuji oleh anggota kelompok.

## 7. Kebutuhan Fungsional dan Acceptance Criteria
- **FR-01 Login:** `POST /api/auth/login` menerima NIM dan password. Kredensial valid menghasilkan token JWT; salah menghasilkan 401; field kosong menghasilkan 400.
- **FR-02 Katalog:** `GET /api/books` menampilkan buku dan status ketersediaan; `GET /api/books/:id` menampilkan detail; ID yang tidak ada menghasilkan 404.
- **FR-03 Meminjam:** `POST /api/borrowings` menerima `bookId`; identitas peminjam berasal dari JWT. Berhasil menghasilkan 201, transaksi tersimpan, status buku menjadi `borrowed`, dan jatuh tempo tujuh hari.
- **FR-04 Batas aktif:** transaksi keempat ditolak dengan 409 jika mahasiswa sudah memiliki tiga transaksi `borrowed`.
- **FR-05 Stok tersedia:** buku dengan status bukan `available` tidak dapat dipinjam dan menghasilkan 409.
- **FR-06 Riwayat:** `GET /api/borrowings` menampilkan riwayat peminjam yang login. Route historis `/api/borrowings/student/:studentId` dan `/api/borrowings/user/:userId` tetap ada tetapi hanya boleh mengakses NIM sendiri.
- **FR-07 Pengembalian:** `PATCH /api/borrowings/:id/return` memperbarui transaksi menjadi `returned`, mengisi tanggal pengembalian, dan mengubah status buku menjadi `available`. Pengembalian ganda menghasilkan 409; transaksi milik orang lain menghasilkan 403.

## 8. Business Rules
- **BR-01:** Maksimal 3 transaksi berstatus `borrowed` per mahasiswa.
- **BR-02:** Buku harus berstatus `available` sebelum dipinjam.
- **BR-03:** `batas_pengembalian = tanggal_pinjam + 7 hari`.
- **BR-04:** Perubahan status transaksi dan buku dilakukan dalam transaksi database.
- **BR-05:** Semua endpoint `/api` selain login membutuhkan `Authorization: Bearer <token>`.
- **BR-06:** Mahasiswa hanya dapat melihat dan mengembalikan transaksi miliknya.

## 9. Model Data
- `users(id, nim, nama, password)`: NIM unik.
- `books(id, judul, penulis, category, sampul, status)`: status `available` atau `borrowed`.
- `loans(id, nim, id_buku, tanggal_pinjam, batas_pengembalian, status, tanggal_dikembalikan)`: relasi ke `users.nim` dan `books.id`; status `borrowed` atau `returned`.

Skema SQL utama ada di `database.sql`.

## 10. Endpoint
Lihat `docs/API-CONTRACT.md`. Endpoint dikelompokkan secara logis dalam satu server utama port 3000.

## 11. Rencana Pengujian
Login valid/tidak valid; token hilang; daftar/detail buku; ID buku tidak ada; pinjam berhasil; buku tidak tersedia; limit buku aktif; riwayat sendiri dan akses riwayat orang lain; pengembalian berhasil, ganda, dan milik pengguna lain; status buku setelah transaksi. Collection berada di `api-test/collection.json` dan salinannya tetap di `postman_collection.json`.

## 12. Rencana Penggunaan AI
Alur: requirement/PRD → prompt terarah → kode usulan AI → review anggota → uji sintaks dan Postman → iterasi. Prompt penting dicatat di `docs/AI_PROMPTS.md`; hasil review nyata harus dilengkapi oleh kelompok di `docs/CODE_REVIEW_LOG.md`.

## 13. Rencana Implementasi
1. Review struktur dan kode lama — seluruh kelompok.
2. Periksa skema dan seed database — penanggung jawab database.
3. Implementasi dan review autentikasi — penanggung jawab backend.
4. Implementasi peminjaman/pengembalian dan aturan bisnis — penanggung jawab backend.
5. Jalankan seluruh Postman Collection dan simpan bukti — seluruh kelompok.
6. Lengkapi dokumen, identitas anggota, dan repository — ketua kelompok.

## 14. Definition of Done
Semua acceptance criteria dipenuhi; endpoint diuji untuk kasus sukses/gagal; database menyimpan transaksi; anggota melakukan review kode; API Contract dan README sesuai implementasi; bukti pengujian aktual disimpan.
+
## 15. Risiko dan Pertanyaan Terbuka
- Perilaku locking bergantung pada tabel InnoDB; gunakan MySQL/MariaDB yang mendukung transaksi.
- Akun dan data seed hanya untuk pengujian lokal.
- Identitas anggota dan URL repository harus diisi kelompok.
- Status tes Postman harus dicatat berdasarkan hasil aktual, bukan diasumsikan lulus.
