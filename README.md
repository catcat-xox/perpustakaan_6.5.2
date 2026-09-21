# Perpustakaan Microservices

Project terdiri dari frontend asli dan dua microservice:

- Frontend: folder `frontend/`
- Book Service: port 3002
- Borrowing Service: port 3001

## Menjalankan

Terminal 1:
```bash
cd book-service
npm install
npm start
```

Terminal 2:
```bash
cd borrowing-service
npm install
npm start
```

Frontend dapat dibuka menggunakan Live Server/HTTP server pada folder `frontend`.

Akun uji:
- NIM: 2310001, Password: 12345
- NIM: 2310002, Password: 12345
- NIM: 2310003, Password: 12345

Data buku disimpan terpisah di `book-service/books.json`.
Data mahasiswa dan peminjaman disimpan di `borrowing-service/data.json`.

Frontend tidak menggunakan localStorage/sessionStorage untuk data aplikasi.


## Git & Repository Hygiene

File `.gitignore` di root project mengecualikan `node_modules/`, file `.env`, dan file log agar dependency hasil instalasi dan konfigurasi lokal tidak ikut masuk repository.

### Jika `node_modules` sudah terlanjur di-track Git

Perintah berikut menghapus file dari **Git tracking/index**, tetapi tidak menghapus `node_modules` dari komputer lokal:

```bash
git rm -r --cached .
git add .
git commit -m "chore: add gitignore and remove generated files from tracking"
git push
```

Setelah itu, `node_modules/` akan tetap tersedia secara lokal tetapi tidak lagi ditambahkan ke commit karena sudah dikecualikan oleh `.gitignore`.

# Analisis Pengembangan Project

## 1. Architecture Sebelum dan Sesudah Dikembangkan

Sebelum dikembangkan, sistem perpustakaan masih menggunakan aplikasi sederhana dan fitur-fiturnya masih berada dalam satu sistem. Jadi pengelolaan buku dan peminjaman belum dipisahkan.

Setelah dikembangkan, sistem menggunakan konsep **microservices**. Sistem dibagi menjadi frontend, **Book Service** pada port `3002`, dan **Borrowing Service** pada port `3001`. Book Service digunakan untuk mengelola data buku, sedangkan Borrowing Service digunakan untuk proses login, peminjaman, dan pengembalian. Kedua service tersebut saling berkomunikasi menggunakan API.

## 2. Microservice yang Dibuat

Pada project ini terdapat 2 microservice, yaitu:

* **Book Service**, digunakan untuk mengelola data buku seperti melihat daftar buku, melihat detail buku, menambahkan buku, dan mengubah status ketersediaan buku.
* **Borrowing Service**, digunakan untuk login mahasiswa, melihat data peminjaman, melakukan peminjaman, dan mengembalikan buku.

Book Service menyimpan data buku di `books.json`, sedangkan Borrowing Service menggunakan `data.json` untuk menyimpan data mahasiswa dan peminjaman.

## 3. Technology yang Digunakan

Technology yang digunakan dalam project ini yaitu:

* HTML, CSS, dan JavaScript untuk membuat tampilan frontend.
* Node.js untuk menjalankan backend.
* Express.js untuk membuat API.
* Axios untuk menghubungkan Book Service dan Borrowing Service.
* CORS untuk membantu komunikasi antara frontend dan backend.
* JSON untuk penyimpanan data.
* Postman untuk melakukan testing API.

## 4. AI Coding Tool yang Digunakan

AI Coding Tool yang digunakan dalam pengembangan project ini adalah **ChatGPT**.

## 5. Bagaimana AI Membantu Proses Pengembangan

ChatGPT membantu dalam proses pembuatan struktur project dan penulisan kode. Selain itu, AI juga membantu membuat API untuk buku dan peminjaman, menghubungkan antar-service, serta membantu mencari penyebab error ketika program tidak berjalan sesuai yang diharapkan.

Namun, hasil dari AI tetap perlu dicek dan dijalankan kembali karena tidak semua kode yang diberikan langsung sesuai dengan kebutuhan project.

## 6. Masalah atau Kesalahan yang Ditemukan dari Hasil AI

Saat proses pengembangan, ditemukan adanya ketidaksesuaian endpoint antara frontend dan backend. Frontend menggunakan endpoint `/api/borrowings/user/:userId`, sedangkan endpoint yang dibuat sebelumnya menggunakan `/api/borrowings/student/:studentId`.

Karena perbedaan tersebut, endpoint perlu disesuaikan dengan menambahkan alias `/api/borrowings/user/:userId` agar dapat digunakan oleh frontend.

Selain itu, komunikasi antara Borrowing Service dan Book Service juga perlu dites kembali karena proses peminjaman dan pengembalian buku bergantung pada Book Service.
