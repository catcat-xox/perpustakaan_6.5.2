# Code Review Log — Perpustakaan Microservices

> Catatan ini berisi temuan yang diidentifikasi saat meninjau kode dengan bantuan AI. Kelompok wajib menjalankan ulang pengujian, mengisi reviewer/tanggal, dan mengubah status berdasarkan hasil review manusia yang sebenarnya.

| No. | Bagian | Temuan | Perbaikan/Keputusan | Validasi yang harus dilakukan |
|---|---|---|---|---|
| 1 | `database.sql` + `routes/authRoutes.js` | Seed password sebelumnya tersimpan sebagai plaintext, sedangkan login memakai `bcrypt.compare`, sehingga akun seed gagal login. | Password seed diganti menjadi bcrypt hash untuk password uji `12345`. | Impor database bersih lalu login untuk ketiga akun uji. |
| 2 | `borrowing-service/server.js` | Identitas peminjam sebelumnya dibaca dari body `studentId`, sehingga klien dapat mencoba meminjam atas nama NIM lain. | Peminjam sekarang diambil dari klaim `req.user.nim` dalam JWT. | Login sebagai satu akun, kirim `studentId` berbeda, pastikan transaksi tetap atas akun token. |
| 3 | `borrowing-service/server.js` | Pemeriksaan limit dan perubahan status buku/transaksi dilakukan terpisah, sehingga permintaan bersamaan berisiko melewati limit atau membuat status tidak konsisten. | Menggunakan transaksi SQL, `SELECT ... FOR UPDATE`, serta commit/rollback untuk pinjam dan kembali. | Jalankan pinjaman berurutan dan paralel; verifikasi maksimal tiga buku aktif dan konsistensi tabel. |
| 4 | `borrowing-service/server.js` | Riwayat dan pengembalian sebelumnya tidak memastikan bahwa transaksi dimiliki akun yang sedang login. | Riwayat berbasis parameter memeriksa kecocokan NIM JWT; pengembalian memeriksa pemilik transaksi. | Uji akses riwayat dan pengembalian milik akun lain; harapkan 403. |
| 5 | `book-service/server.js` | Endpoint perubahan status buku dapat digunakan terpisah dari transaksi peminjaman/pengembalian. | Endpoint status dipertahankan tetapi mengembalikan 403; status hanya diperbarui dalam transaksi pinjam/kembali. | Panggil endpoint status langsung dan pastikan status buku tidak berubah. |
