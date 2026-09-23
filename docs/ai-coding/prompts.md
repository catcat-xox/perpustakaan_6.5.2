# 🤖 Prompt yang Digunakan dalam AI Coding Tool

Dokumen ini berisi prompt yang digunakan dalam proses pengembangan Sistem Perpustakaan berbasis Microservices.

Prompt digunakan secara bertahap mulai dari analisis project, perancangan architecture, implementasi, pemeriksaan, hingga perbaikan.

---

## 1. Prompt Analisis Project Sebelumnya

### Prompt

```text
"Saya memiliki proyek perpustakaan monolitik berbasis web statis (index.html, style.css, dan script.js). Tolong bedah dan analisis proyek ini berdasarkan poin-poin berikut:   

- Struktur Folder & Teknologi: Jelaskan struktur file yang ada dan teknologi yang digunakan (HTML/CSS/JS native).   
- Penyimpanan Data: Identifikasi bagaimana data disimpan (apakah menggunakan localStorage, sessionStorage, atau array in-memory di script.js).   
- Alur Fitur Utama: Jelaskan alur logika eksisting untuk:Alur LoginAlur Menampilkan Daftar BukuAlur Peminjaman BukuSajikan hasil analisis ini secara ringkas dan terstruktur."
``` 

### Tujuan

Prompt ini digunakan untuk membantu memahami project sebelum dilakukan migrasi ke microservices.

---

## 2. Prompt Perancangan Architecture Microservices

### Prompt

```text
"buatkan rancangan arsitektur microservices untuk aplikasi perpustakaan berdasarkan hasil mapping sebelumnya:

- Daftar Service & Database: Tentukan nama service (minimal 2), port running, dan skema penyimpanan data (JSON/Database) untuk masing-masing service agar data terisolasi.
- Daftar Endpoint API: Rincikan method (GET, POST, PATCH), URL path, request body, dan response JSON untuk:
   - Service Mahasiswa / Borrowing Service (Port 3001)
   - Service Perpustakaan / Book Service (Port 3002)
- Diagram Alur Komunikasi (Sequence): Jelaskan alur komunikasi HTTP/REST antarservice saat mahasiswa meminjam buku (termasuk validasi kuota 3 buku dan pembaruan status ketersediaan buku)."
```

### Tujuan

Prompt digunakan untuk membantu merancang pembagian service dan komunikasi antar-service.

---

## 3. Prompt Implementasi 

### Prompt

```text
implementasikan arsitektur ini secara bertahap:

- Tahap A - Service 1 (Book Service - Port 3002):
Buatkan REST API dengan Express.js untuk mengelola katalog buku, detail buku, dan pembaruan status ketersediaan (`available`/`borrowed`).

- Tahap B - Service 2 (Borrowing & Auth Service - Port 3001):
Buatkan REST API dengan Express.js untuk login mahasiswa, riwayat peminjaman, dan fungsi `POST /api/borrowings`.

- Aturan Logika Peminjaman:
    - Cek apakah user sudah meminjam $\ge 3$ buku aktif. Jika ya, tolak.
    - Panggil `Book Service` via `axios` (`http://localhost:3002/api/books/:id`) untuk mengecek ketersediaan buku. Jika tidak tersedia, tolak.
    - Jika lolos, simpan transaksi dan panggil `PATCH http://localhost:3002/api/books/:id/status` untuk mengubah status buku menjadi `borrowed`.

- Tahap C - Refactoring Frontend (`script.js`):
Ubah file `script.js` eksisting agar memanggil REST API Port 3001 & 3002 menggunakan `fetch()` alih-alih `localStorage` atau memori lokal.   

- Tahap D - Skenario Pengujian Acceptance Criteria (AC-01 sampai AC-09):
Buatkan tabel atau panduan pengujian langkah demi langkah (termasuk request Postman/cURL) untuk memverifikasi seluruh AC-01 hingga AC-09, serta buktikan alur peminjaman yang melewati kedua service tersebut secara sukses."
```

### Tujuan

Prompt digunakan untuk membantu membuat service yang menangani data buku.

---

## 7. Prompt Perbaikan

### Prompt Analisis Masalah

```text
Kami menemukan dua masalah utama pada hasil generasi AI ini:

1. Feature Regression:
   Fitur gambar sampul buku dari Unsplash (yang sebelumnya ada di versi
   monolithic 3 file sederhana) hilang di versi microservices ini.

2. Missing Configuration & Git Hygiene:
   AI tidak memicu pembuatan file .gitignore, sehingga folder dependensi
   (node_modules) ikut ter-push ke repository GitHub.

TOLONG BUATKAN ANALISIS TEKNIS MENDALAM TERKAIT DUA MASALAH DI ATAS.

Catatan:
JANGAN berikan kode perbaikan atau skrip apapun terlebih dahulu.
Cukup lakukan analisis dengan sistematika berikut:

1. Analisis Masalah 1 (Feature Regression - Sampul Unsplash):
   - Dampak terhadap pengguna (UI/UX).
   - Akar penyebab (root cause) mengapa AI cenderung 'melupakan' logika
     ini saat memecah monolithic ke microservices.
   - Poin-poin berkas mana saja yang terdampak (misal: books.json, script.js).

2. Analisis Masalah 2 (Git Governance - Missing .gitignore):
   - Dampak teknis dan risiko terhadap repository GitHub
     (ukuran repo, potensi conflict, kepatuhan/best practices).
   - Akar penyebab teknis mengapa node_modules ikut ter-push.

3. Ringkasan Evaluasi AI:
   - Kesimpulan singkat mengenai keterbatasan AI dalam memahami konteks
     jangka panjang (context window/loss of scope) dan konfigurasi lingkungan
     (environment config) untuk bahan bab Laporan Tugas.
```

### Prompt Perbaikan

```text
Tolong bantu kami mengeksekusi PERBAIKAN KODE berdasarkan kedua masalah tersebut.

Aturan Utama:
- Fokus HANYA pada perbaikan dua masalah di atas.
- JANGAN mengubah arsitektur, pustaka, alur logika, atau fungsionalitas lain yang sudah berjalan baik.

Tolong berikan perbaikan lengkap dan kemas seluruh file proyek yang telah diperbaiki ke dalam satu file .zip yang dapat kami unduh secara langsung.

Berikut rincian perbaikan yang diperlukan:

---

1. PERBAIKAN MASALAH 1 (Sampul Unsplash):

- `book-service/books.json`: Tambahkan atribut URL gambar Unsplash (misalnya: `"cover_url"` atau `"cover"`) pada tiap data buku.

- `frontend/script.js`: Sesuaikan logika rendering/fetch data buku agar menampilkan elemen gambar (`<img src="...">`) dari atribut URL Unsplash yang disediakan oleh book-service.

- `book-service/server.js`: Pastikan endpoint API tetap me-return seluruh objek buku (termasuk atribut gambar baru) tanpa mengubah alur server.

---

2. PERBAIKAN MASALAH 2 (Konfigurasi Git & node_modules):

- `.gitignore`: Buat file `.gitignore` di root folder project (`perpustakaan-microservices/.gitignore`) yang mengecualikan `node_modules/`, file `.env`, dan log files.

- Sertakan file instruksi atau sertakan langkah terminal Git CLI di dalam penjelasan jawaban/README untuk menghapus `node_modules` dari tracking Git tanpa menghapus file di lokal (`git rm -r --cached .`).

---

OUTPUT YANG DIMINTA:

1. Buatkan dan berikan tautan/file .zip berisi struktur folder lengkap proyek yang sudah diperbaiki.

2. Tampilkan juga kode dan penjelasan per file di pesan jawaban agar kami bisa mereview perubahannya.
```

### Tujuan

Prompt digunakan setelah ditemukan masalah cover buku yang hilang.

---

# 10. Prinsip Penggunaan AI

Dalam project ini, AI Coding Tool digunakan sebagai **alat bantu pengembangan**.

Kode yang diberikan AI tidak langsung digunakan tanpa pemeriksaan. Setiap hasil perlu:

1. Dibaca kembali.
2. Dipahami fungsinya.
3. Dibandingkan dengan requirement.
4. Dijalankan.
5. Diuji.
6. Diperbaiki apabila ditemukan masalah.

Dengan pendekatan tersebut, AI membantu proses pengembangan tetapi hasil akhir tetap diperiksa oleh anggota kelompok.