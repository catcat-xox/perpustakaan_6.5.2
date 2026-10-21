# Catatan Prompt AI

Dokumen ini mencatat prompt yang digunakan sebagai bukti alur AI-assisted development. Sesuaikan dengan aktivitas kelompok yang benar-benar dilakukan.

## Prompt 1 — Analisis gap
> Bandingkan struktur dan kode proyek Perpustakaan Microservices dengan instruksi UTS Vibe Coding Bagian B. Pertahankan struktur folder asli dan identifikasi kekurangan pada database, autentikasi, peminjaman, pengembalian, API Contract, pengujian, serta README.

## Prompt 2 — Review business rule
> Tinjau endpoint peminjaman dan pengembalian Express/MySQL. Pastikan identitas peminjam diambil dari JWT, maksimal tiga buku aktif, jatuh tempo tujuh hari, buku tidak tersedia ditolak, kepemilikan transaksi diperiksa, dan perubahan status transaksi/buku konsisten.

## Prompt 3 — Dokumentasi dan pengujian
> Buat API Contract dan Postman Collection sesuai endpoint yang benar-benar ada. Sertakan kasus sukses dan gagal, autentikasi Bearer JWT, limit tiga buku aktif, buku tidak tersedia, dan pengembalian ganda. Jangan menyatakan tes lulus tanpa menjalankannya.

## Review kelompok
Anggota kelompok harus mencatat perubahan yang diterima/ditolak, menjalankan `npm run check`, mengimpor database ke MySQL, menguji collection, serta melampirkan screenshot hasil aktual.
