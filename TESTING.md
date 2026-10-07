# TESTING

Project menggunakan satu server utama pada port `3000`.

## Health check

```http
GET http://localhost:3000/api/books/health
GET http://localhost:3000/api/borrowings/health
```

## Login

```http
POST http://localhost:3000/api/auth/login
Content-Type: application/json
```

```json
{
  "studentId": "2310001",
  "password": "12345"
}
```

## Catalog

```http
GET http://localhost:3000/api/books
```

## Get book by ID

```http
GET http://localhost:3000/api/books/BK001
```

## History

```http
GET http://localhost:3000/api/borrowings/student/2310001
```

## Borrow

Use a book that is initially available, for example `BK004`:

```http
POST http://localhost:3000/api/borrowings
Content-Type: application/json
```

```json
{
  "studentId": "2310001",
  "bookId": "BK004"
}
```

## Return

Replace `BR_ID` with an active loan ID:

```http
PATCH http://localhost:3000/api/borrowings/BR_ID
Content-Type: application/json
```

```json
{
  "status": "returned"
}
```

## Database verification

```sql
USE perpustakaan;

SELECT * FROM users;
SELECT * FROM books;
SELECT * FROM loans;
```
