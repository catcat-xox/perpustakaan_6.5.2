# Dokumentasi Penggunaan AI Coding Tool

## 1. Pendahuluan

Pengembangan Sistem Perpustakaan berbasis Microservices dilakukan dengan bantuan **AI Coding Tool**.

AI digunakan sebagai alat bantu dalam proses pengembangan, bukan sebagai pengganti proses pemeriksaan dan pengujian oleh anggota kelompok.

Setiap kode atau solusi yang diberikan oleh AI diperiksa kembali dengan cara membaca kode, menjalankan aplikasi, menguji endpoint, dan membandingkan hasilnya dengan kebutuhan project.

---

# 2. Tujuan Penggunaan AI Coding Tool

AI Coding Tool digunakan untuk membantu:

* Menganalisis source code project sebelumnya.
* Memahami requirement dan fitur yang sudah ada.
* Merancang architecture microservices.
* Menentukan pembagian fungsi setiap service.
* Membantu membuat backend service.
* Membantu membuat komunikasi API antar-service.
* Membantu menyesuaikan frontend dengan API baru.
* Membantu debugging.
* Membantu menemukan penyebab error.
* Membantu menyusun dokumentasi project.

---

# 3. Tahapan Penggunaan AI

## 3.1 Analisis Project Sebelumnya

Tahap pertama dilakukan dengan memberikan struktur dan source code project sebelumnya kepada AI.

Tujuannya adalah agar AI memahami fitur yang sudah tersedia sebelum proses migrasi dilakukan.

Hal yang diperiksa antara lain:

* Struktur folder.
* Fitur login.
* Data buku.
* Fitur peminjaman.
* Status ketersediaan buku.
* Aturan batas peminjaman.

---

## 3.2 Perancangan Microservices

Setelah memahami project sebelumnya, AI digunakan untuk membantu menentukan pembagian service.

Hasil pembagian:

### Book Service

Bertanggung jawab terhadap:

* Data buku.
* Detail buku.
* Status ketersediaan buku.

### Borrowing & Authentication Service

Bertanggung jawab terhadap:

* Login.
* Data peminjaman.
* Proses peminjaman.
* Pengembalian.
* Batas maksimal peminjaman.

---

## 3.3 Implementasi

AI digunakan untuk membantu implementasi:

* Express.js server.
* REST API.
* Endpoint Book Service.
* Endpoint Borrowing Service.
* Komunikasi antar-service menggunakan Axios.
* Integrasi frontend menggunakan `fetch()`.

Setelah implementasi selesai, kode diperiksa dan dijalankan secara langsung.

---

# 4. Pemeriksaan Hasil AI

Kode hasil AI diperiksa menggunakan beberapa cara:

1. Membaca kembali kode yang dibuat.
2. Memastikan endpoint sesuai kebutuhan.
3. Menjalankan masing-masing service.
4. Menguji API.
5. Menguji komunikasi antar-service.
6. Menguji fitur dari frontend.
7. Memeriksa hasil apabila terjadi error.
8. Melakukan perbaikan apabila hasil tidak sesuai.

Dengan demikian, hasil akhir project bukan sekadar hasil copy-paste dari AI, tetapi melalui proses pemeriksaan dan pengujian.

---

# 5. Masalah yang Ditemukan dari Hasil AI

## 5.1 Cover Buku Hilang Setelah Migrasi ke Microservices

### Kondisi

Pada project sebelum dikembangkan menjadi microservices, buku memiliki gambar cover.

Setelah architecture diubah menjadi microservices, data buku berhasil ditampilkan tetapi gambar cover tidak lagi muncul pada frontend.

### Analisis

Setelah dilakukan pemeriksaan, salah satu bagian data yang tidak terbawa dengan benar pada proses pemisahan service adalah informasi URL cover buku.

AI lebih berfokus pada pemisahan fungsi menjadi service dan komunikasi API, sehingga beberapa detail fitur dari project sebelumnya perlu diperiksa kembali.

### Perbaikan

Data buku diperbaiki dengan mempertahankan atribut:

```json
"cover_url": "..."
```

Book Service kemudian memastikan objek buku yang dikirim melalui API tetap membawa informasi `cover_url`.

Pada frontend, URL tersebut digunakan untuk menampilkan gambar cover:

```javascript
book.cover_url
```

Frontend juga menggunakan fallback apabila URL cover tidak tersedia.

### Hasil

Setelah perbaikan:

* Data cover kembali tersedia.
* Book Service mengembalikan informasi cover.
* Frontend dapat menampilkan gambar buku.
* Fitur visual dari project sebelumnya tetap dipertahankan.

### Pembelajaran

Masalah ini menunjukkan bahwa ketika melakukan migrasi architecture, bukan hanya struktur backend yang perlu diperiksa. Semua fitur dan atribut data dari project sebelumnya juga harus dibandingkan kembali.

---

## 5.2 `node_modules` Masuk ke Repository

### Kondisi

Pada proses pengembangan dan pengunggahan project ke GitHub, folder `node_modules` sempat masuk atau terdeteksi sebagai file yang dilacak oleh Git.

Folder `node_modules` berisi dependency hasil instalasi `npm` sehingga seharusnya tidak perlu disimpan di repository.

### Analisis

Setelah diperiksa, project belum memiliki konfigurasi `.gitignore` yang sesuai untuk mengabaikan:

```text
node_modules/
```

Akibatnya Git dapat mendeteksi file dependency tersebut sebagai file yang perlu dilacak.

### Perbaikan

File `.gitignore` ditambahkan pada root repository.

Contoh:

```gitignore
node_modules/
.env
.DS_Store
```

Karena beberapa file `node_modules` sudah terlanjur masuk dalam tracking Git, file tersebut juga perlu dikeluarkan dari Git tracking.

Perintah yang digunakan:

```bash
git rm -r --cached .
git add .
git commit -m "chore: remove node_modules from tracking"
git push
```

Perintah tersebut menghapus file dari Git tracking tanpa menghapus folder dependency dari komputer lokal.

### Hasil

Setelah perbaikan:

* `node_modules` tidak lagi dilacak oleh Git.
* Repository menjadi lebih ringan.
* Dependency tetap dapat di-install kembali menggunakan `npm install`.
* Konfigurasi repository menjadi lebih sesuai untuk project Node.js.

### Pembelajaran

Masalah ini menunjukkan bahwa pemeriksaan project tidak hanya mencakup source code aplikasi. Konfigurasi repository seperti `.gitignore` juga perlu diperhatikan sebelum project diunggah ke GitHub.

---
