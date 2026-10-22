/**
 * Tugas 1: RESTful API Murni dengan Express.js
 * Sesuai panduan: https://rachmat-nur.gitbook.io/express
 * 
 * Nama    : Ewaldo Suhendra Kohar
 * NIM     : 2428240090
 * Kelas   : SI5B
 * Topik   : Utilitas Tagihan Listrik
 * Resource: /electricity-bills
 * Filter  : golongan
 */

const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware logger untuk mencatat setiap request yang masuk
function logger(req, res, next) {
  const waktu = new Date().toISOString();
  console.log(`[${waktu}] ${req.method} ${req.url}`);
  next();
}
app.use(logger);

// Middleware agar req.body (JSON) dapat dibaca
app.use(express.json());

// Data sementara (disimpan di memori, hilang saat server restart)
let electricityBills = [
  {
    id: 1,
    nomorPelanggan: '512019827364',
    idPelanggan: '512019827364',
    namaPelanggan: 'Yudi Pratama',
    nama: 'Yudi Pratama',
    golongan: 'R1-900VA',
    bulan: 'Januari 2025',
    pemakaianKwh: 210,
    totalTagihan: 303000,
    status: 'Lunas'
  },
  {
    id: 2,
    nomorPelanggan: '512028374651',
    idPelanggan: '512028374651',
    namaPelanggan: 'Andi Setiawan',
    nama: 'Andi Setiawan',
    golongan: 'R1-1300VA',
    bulan: 'Januari 2025',
    pemakaianKwh: 150,
    totalTagihan: 216600,
    status: 'Belum Lunas'
  },
  {
    id: 3,
    nomorPelanggan: '512037465819',
    idPelanggan: '512037465819',
    namaPelanggan: 'Budi Santoso',
    nama: 'Budi Santoso',
    golongan: 'R1-900VA',
    bulan: 'Januari 2025',
    pemakaianKwh: 300,
    totalTagihan: 450000,
    status: 'Lunas'
  }
];

let nextId = 4; // penghitung id untuk data baru

// GET / -> memastikan server berjalan dan menampilkan info API
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'RESTful API Utilitas Tagihan Listrik berjalan dengan baik',
    author: 'Ewaldo Suhendra Kohar',
    nim: '2428240090',
    kelas: 'SI5B',
    topik: 'Utilitas Tagihan Listrik',
    resource: '/electricity-bills',
    filter: 'golongan'
  });
});

// GET /electricity-bills -> seluruh data, bisa difilter: /electricity-bills?golongan=R1-900VA
app.get('/electricity-bills', (req, res) => {
  const { golongan } = req.query;

  if (golongan) {
    const hasil = electricityBills.filter(
      (b) => b.golongan.toLowerCase() === golongan.toLowerCase()
    );
    return res.json(hasil);
  }

  res.json(electricityBills);
});

// GET /electricity-bills/:id -> satu data berdasarkan id
app.get('/electricity-bills/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const data = electricityBills.find((b) => b.id === id);

  if (!data) {
    return res.status(404).json({
      status: 'error',
      message: `Data dengan id ${id} tidak ditemukan`,
      data: null
    });
  }

  res.json(data);
});

// POST /electricity-bills -> tambah data baru via Postman
// Body mendukung: nomorPelanggan (atau idPelanggan), namaPelanggan (atau nama), golongan, bulan, pemakaianKwh, totalTagihan, status
app.post('/electricity-bills', (req, res) => {
  const nomorPelanggan = req.body.nomorPelanggan || req.body.idPelanggan;
  const namaPelanggan = req.body.namaPelanggan || req.body.nama;
  const golongan = req.body.golongan;
  const bulan = req.body.bulan || 'Februari 2025';
  const pemakaianKwh = req.body.pemakaianKwh;
  const totalTagihan = req.body.totalTagihan;
  const status = req.body.status || 'Belum Lunas';

  // Validasi seluruh field wajib topik
  if (
    !nomorPelanggan ||
    !namaPelanggan ||
    !golongan ||
    pemakaianKwh === undefined ||
    pemakaianKwh === null ||
    pemakaianKwh === '' ||
    totalTagihan === undefined ||
    totalTagihan === null ||
    totalTagihan === ''
  ) {
    return res.status(400).json({
      status: 'error',
      message: 'Semua field wajib diisi: nomorPelanggan/idPelanggan, namaPelanggan/nama, golongan, pemakaianKwh, totalTagihan',
      data: null
    });
  }

  const baru = {
    id: nextId++,
    nomorPelanggan: String(nomorPelanggan),
    idPelanggan: String(nomorPelanggan),
    namaPelanggan: String(namaPelanggan),
    nama: String(namaPelanggan),
    golongan: String(golongan),
    bulan: String(bulan),
    pemakaianKwh: Number(pemakaianKwh),
    totalTagihan: Number(totalTagihan),
    status: String(status)
  };

  electricityBills.push(baru);

  res.status(201).json({
    status: 'success',
    message: 'Data berhasil ditambahkan',
    data: baru
  });
});

// PUT /electricity-bills/:id -> ubah seluruh data (penggantian penuh)
app.put('/electricity-bills/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = electricityBills.findIndex((b) => b.id === id);

  if (index === -1) {
    return res.status(404).json({
      status: 'error',
      message: `Data dengan id ${id} tidak ditemukan`,
      data: null
    });
  }

  const nomorPelanggan = req.body.nomorPelanggan || req.body.idPelanggan;
  const namaPelanggan = req.body.namaPelanggan || req.body.nama;
  const golongan = req.body.golongan;
  const bulan = req.body.bulan || electricityBills[index].bulan || 'Januari 2025';
  const pemakaianKwh = req.body.pemakaianKwh;
  const totalTagihan = req.body.totalTagihan;
  const status = req.body.status || electricityBills[index].status || 'Belum Lunas';

  if (
    !nomorPelanggan ||
    !namaPelanggan ||
    !golongan ||
    pemakaianKwh === undefined ||
    pemakaianKwh === null ||
    pemakaianKwh === '' ||
    totalTagihan === undefined ||
    totalTagihan === null ||
    totalTagihan === ''
  ) {
    return res.status(400).json({
      status: 'error',
      message: 'Semua field wajib diisi untuk penggantian penuh',
      data: null
    });
  }

  const dataDiperbarui = {
    id,
    nomorPelanggan: String(nomorPelanggan),
    idPelanggan: String(nomorPelanggan),
    namaPelanggan: String(namaPelanggan),
    nama: String(namaPelanggan),
    golongan: String(golongan),
    bulan: String(bulan),
    pemakaianKwh: Number(pemakaianKwh),
    totalTagihan: Number(totalTagihan),
    status: String(status)
  };

  electricityBills[index] = dataDiperbarui;

  res.json({
    status: 'success',
    message: 'Data berhasil diperbarui',
    data: dataDiperbarui
  });
});

// DELETE /electricity-bills/:id -> hapus data
app.delete('/electricity-bills/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = electricityBills.findIndex((b) => b.id === id);

  if (index === -1) {
    return res.status(404).json({
      status: 'error',
      message: `Data dengan id ${id} tidak ditemukan`,
      data: null
    });
  }

  const deleted = electricityBills.splice(index, 1);

  res.json({
    status: 'success',
    message: `Data tagihan listrik dengan id ${id} berhasil dihapus`,
    data: deleted[0]
  });
});

// Middleware catch-all untuk route yang tidak terdaftar (404 Not Found)
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Endpoint tidak ditemukan',
    data: null
  });
});

// Jalankan server hanya saat diuji secara lokal
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
  });
}

module.exports = app;
