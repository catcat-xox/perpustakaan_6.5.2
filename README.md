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
