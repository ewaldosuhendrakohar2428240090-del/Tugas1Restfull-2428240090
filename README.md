# Tugas 1: RESTful API Express.js - Utilitas Tagihan Listrik

Repositori ini berisi implementasi RESTful API murni menggunakan Express.js tanpa view/HTML untuk mengelola resource data tagihan listrik (`/electricity-bills`) dengan penyimpanan sementara di memory array.

Dibuat untuk memenuhi Tugas 1 mata kuliah Pemrograman Aplikasi Web 2 (PAW2) - Kelas SI5B, mengikuti panduan materi pada [https://rachmat-nur.gitbook.io/express](https://rachmat-nur.gitbook.io/express).

---

## 👤 Identitas Mahasiswa
- **Nama** : Ewaldo Suhendra Kohar
- **NIM** : 2428240090
- **Kelas** : SI5B
- **Topik** : Utilitas Tagihan Listrik
- **Resource** : `/electricity-bills`
- **Parameter Filter** : `golongan`
- **Link Deploy Vercel** : https://tugas1restfull-2428240090.vercel.app *(dapat disesuaikan dengan URL Vercel setelah di-deploy)*
- **Link Repository GitHub** : https://github.com/ewaldosuhendrakohar2428240090-del/Tugas1Restfull-2428240090

---

## 📁 Struktur Project
```text
tugas1-restful-2428240090/
├── .gitignore
├── vercel.json
├── package.json
├── app.js                   # Seluruh kode server dan endpoint RESTful API
├── postman_collection.json  # File export koleksi Postman untuk pengujian
└── README.md                # Dokumentasi lengkap project
```

---

## 🚀 Cara Menjalankan Secara Lokal

### 1. Prasyarat
- Node.js (versi LTS direkomendasikan, v18+)
- npm (Node Package Manager)

### 2. Instalasi Dependensi
Buka terminal pada folder project ini, lalu jalankan:
```bash
npm install
```

### 3. Menjalankan Server
- **Mode Normal:**
  ```bash
  npm start
  ```
- **Mode Pengembangan (dengan Nodemon auto-reload):**
  ```bash
  npm run dev
  ```

Server akan aktif dan dapat diakses di:
```
http://localhost:3000
```

---

## 📑 Daftar Endpoint RESTful API

| No | Method | Endpoint | Fungsi | Status Sukses | Status Gagal |
|:--:|:------:|:---------|:-------|:-------------:|:------------:|
| 1 | `GET` | `/` | Menampilkan info API | `200 OK` | — |
| 2 | `GET` | `/electricity-bills` | Mengambil seluruh data tagihan | `200 OK` | — |
| 3 | `GET` | `/electricity-bills?golongan=nilai` | Filter data berdasarkan golongan tarif | `200 OK` | — |
| 4 | `GET` | `/electricity-bills/:id` | Mengambil satu data berdasarkan ID | `200 OK` | `404 Not Found` |
| 5 | `POST` | `/electricity-bills` | Menambahkan data tagihan baru | `201 Created` | `400 Bad Request` |
| 6 | `PUT` | `/electricity-bills/:id` | Mengubah seluruh data (penggantian penuh) | `200 OK` | `400 Bad Request` / `404 Not Found` |
| 7 | `DELETE` | `/electricity-bills/:id` | Menghapus data berdasarkan ID | `200 OK` | `404 Not Found` |
| 8 | `*` | *Route tak terdaftar* | Catch-all handler untuk 404 | — | `404 Not Found` |

---

## 📋 Struktur Data Resource (`/electricity-bills`)

Setiap data tagihan listrik memiliki atribut:
- `id` *(Number, auto-increment server-side)*
- `nomorPelanggan` *(String, Wajib)* - Nomor ID / meter pelanggan PLN
- `namaPelanggan` *(String, Wajib)* - Nama pelanggan
- `golongan` *(String, Wajib)* - Golongan tarif (contoh: `R1-900VA`, `R1-1300VA`, `B1-4500VA`)
- `bulan` *(String, Wajib)* - Bulan periode tagihan (contoh: `Januari 2025`)
- `pemakaianKwh` *(Number, Wajib)* - Jumlah konsumsi listrik dalam kWh
- `totalTagihan` *(Number, Wajib)* - Total biaya tagihan listrik (Rp)
- `status` *(String, Wajib)* - Status pembayaran (`Lunas` / `Belum Lunas`)

---

## 🧪 Contoh Request & Response

### 1. GET `/` (Info API)
**Response `200 OK`:**
```json
{
  "status": "success",
  "message": "RESTful API Utilitas Tagihan Listrik berjalan dengan baik",
  "author": "Ewaldo Suhendra Kohar",
  "nim": "2428240090",
  "kelas": "SI5B",
  "topik": "Utilitas Tagihan Listrik",
  "resource": "/electricity-bills",
  "filter": "golongan"
}
```

### 2. GET `/electricity-bills` (Ambil Semua Data)
**Response `200 OK`:**
```json
[
  {
    "id": 1,
    "nomorPelanggan": "512019827364",
    "namaPelanggan": "Budi Santoso",
    "golongan": "R1-900VA",
    "bulan": "Januari 2025",
    "pemakaianKwh": 125,
    "totalTagihan": 168750,
    "status": "Lunas"
  },
  {
    "id": 2,
    "nomorPelanggan": "512088374612",
    "namaPelanggan": "Siti Rahmawati",
    "golongan": "R1-1300VA",
    "bulan": "Januari 2025",
    "pemakaianKwh": 240,
    "totalTagihan": 346560,
    "status": "Belum Lunas"
  }
]
```

### 3. GET `/electricity-bills?golongan=R1-900VA` (Filter Query String)
**Response `200 OK`:**
```json
[
  {
    "id": 1,
    "nomorPelanggan": "512019827364",
    "namaPelanggan": "Budi Santoso",
    "golongan": "R1-900VA",
    "bulan": "Januari 2025",
    "pemakaianKwh": 125,
    "totalTagihan": 168750,
    "status": "Lunas"
  },
  {
    "id": 3,
    "nomorPelanggan": "512044918233",
    "namaPelanggan": "Hendro Wijaya",
    "golongan": "R1-900VA",
    "bulan": "Januari 2025",
    "pemakaianKwh": 180,
    "totalTagihan": 243000,
    "status": "Lunas"
  }
]
```

### 4. GET `/electricity-bills/:id` (Ambil Berdasarkan ID)
- **Sukses `200 OK` (`GET /electricity-bills/1`):**
  ```json
  {
    "id": 1,
    "nomorPelanggan": "512019827364",
    "namaPelanggan": "Budi Santoso",
    "golongan": "R1-900VA",
    "bulan": "Januari 2025",
    "pemakaianKwh": 125,
    "totalTagihan": 168750,
    "status": "Lunas"
  }
  ```
- **Gagal `404 Not Found` (`GET /electricity-bills/99`):**
  ```json
  {
    "status": "error",
    "message": "Data dengan id 99 tidak ditemukan",
    "data": null
  }
  ```

### 5. POST `/electricity-bills` (Tambah Data Baru)
**Headers:** `Content-Type: application/json`  
**Request Body:**
```json
{
  "nomorPelanggan": "512033445566",
  "namaPelanggan": "Fajar Pratama",
  "golongan": "R1-900VA",
  "bulan": "Februari 2025",
  "pemakaianKwh": 135,
  "totalTagihan": 182250,
  "status": "Belum Lunas"
}
```
- **Sukses `201 Created`:**
  ```json
  {
    "status": "success",
    "message": "Data berhasil ditambahkan",
    "data": {
      "id": 5,
      "nomorPelanggan": "512033445566",
      "namaPelanggan": "Fajar Pratama",
      "golongan": "R1-900VA",
      "bulan": "Februari 2025",
      "pemakaianKwh": 135,
      "totalTagihan": 182250,
      "status": "Belum Lunas"
    }
  }
  ```
- **Gagal `400 Bad Request` (Jika ada field wajib yang kosong):**
  ```json
  {
    "status": "error",
    "message": "Semua field wajib diisi: nomorPelanggan, namaPelanggan, golongan, bulan, pemakaianKwh, totalTagihan, status",
    "data": null
  }
  ```

### 6. PUT `/electricity-bills/:id` (Ubah Seluruh Data)
**Headers:** `Content-Type: application/json`  
**Request Body:**
```json
{
  "nomorPelanggan": "512019827364",
  "namaPelanggan": "Budi Santoso (Updated)",
  "golongan": "R1-1300VA",
  "bulan": "Januari 2025",
  "pemakaianKwh": 150,
  "totalTagihan": 216600,
  "status": "Lunas"
}
```
- **Sukses `200 OK`:**
  ```json
  {
    "status": "success",
    "message": "Data berhasil diperbarui",
    "data": {
      "id": 1,
      "nomorPelanggan": "512019827364",
      "namaPelanggan": "Budi Santoso (Updated)",
      "golongan": "R1-1300VA",
      "bulan": "Januari 2025",
      "pemakaianKwh": 150,
      "totalTagihan": 216600,
      "status": "Lunas"
    }
  }
  ```
- **Gagal `404 Not Found` (ID tidak ada):**
  ```json
  {
    "status": "error",
    "message": "Data dengan id 99 tidak ditemukan",
    "data": null
  }
  ```

### 7. DELETE `/electricity-bills/:id` (Hapus Data)
- **Sukses `200 OK` (`DELETE /electricity-bills/2`):**
  ```json
  {
    "status": "success",
    "message": "Data tagihan listrik dengan id 2 berhasil dihapus",
    "data": null
  }
  ```
- **Gagal `404 Not Found` (`DELETE /electricity-bills/99`):**
  ```json
  {
    "status": "error",
    "message": "Data dengan id 99 tidak ditemukan",
    "data": null
  }
  ```

### 8. Catch-All Route 404 (Endpoint Tidak Dikenal)
`GET /halaman-acak`
```json
{
  "status": "error",
  "message": "Endpoint tidak ditemukan",
  "data": null
}
```

---

## 🛠️ Pengujian dengan Postman
File `postman_collection.json` sudah disediakan dalam repositori ini.
1. Buka aplikasi **Postman**.
2. Klik tombol **Import** dan pilih file `postman_collection.json`.
3. Variabel `baseUrl` default diatur ke `http://localhost:3000`. Jika menguji endpoint di Vercel, cukup ganti nilai variabel `baseUrl` dengan URL Vercel kamu.
4. Jalankan setiap request pada koleksi untuk memvalidasi seluruh skenario pengujian (sukses dan gagal).
