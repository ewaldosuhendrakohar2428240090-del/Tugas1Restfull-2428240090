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

// Middleware agar req.body (JSON) dapat dibaca
app.use(express.json());

// Data sementara (disimpan di memori, hilang saat server restart)
let electricityBills = [
  {
    id: 1,
    idPelanggan: '171234567890',
    nama: 'Yudi Pratama',
    golongan: 'R1',
    pemakaianKwh: 210,
    totalTagihan: 303000
  },
  {
    id: 2,
    idPelanggan: '171234567891',
    nama: 'Andi Setiawan',
    golongan: 'R2',
    pemakaianKwh: 150,
    totalTagihan: 210000
  },
  {
    id: 3,
    idPelanggan: '171234567892',
    nama: 'Budi Santoso',
    golongan: 'R1',
    pemakaianKwh: 300,
    totalTagihan: 450000
  }
];

let nextId = 5; // penghitung id untuk data baru

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

// POST /electricity-bills -> tambah data baru
// Body: { nomorPelanggan, namaPelanggan, golongan, bulan, pemakaianKwh, totalTagihan, status }
app.post('/electricity-bills', (req, res) => {
  const {
    nomorPelanggan,
    namaPelanggan,
    golongan,
    bulan,
    pemakaianKwh,
    totalTagihan,
    status
  } = req.body;

  // Validasi seluruh field wajib topik
  if (
    !idPelanggan ||
    !nama ||
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
      message: 'Semua field wajib diisi: idPelanggan, nama, golongan, pemakaianKwh, totalTagihan',
      data: null
    });
  }

  const baru = {
    id: nextId++,
    idPelanggan: String(idPelanggan),
    nama: String(nama),
    golongan: String(golongan),
    pemakaianKwh: Number(pemakaianKwh),
    totalTagihan: Number(totalTagihan)
  };

  electricityBills.push(baru);

  res.status(201).json({
    status: 'success',
    message: 'Data berhasil ditambahkan',
    data: baru
  });
});

// PUT /electricity-bills/:id -> ubah seluruh data (penggantian penuh)
// Body: { nomorPelanggan, namaPelanggan, golongan, bulan, pemakaianKwh, totalTagihan, status }
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

  const {
    nomorPelanggan,
    namaPelanggan,
    golongan,
    bulan,
    pemakaianKwh,
    totalTagihan,
    status
  } = req.body;

  if (
    !idPelanggan ||
    !nama ||
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
    idPelanggan: String(idPelanggan),
    nama: String(nama),
    golongan: String(golongan),
    pemakaianKwh: Number(pemakaianKwh),
    totalTagihan: Number(totalTagihan)
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

  electricityBills.splice(index, 1);

  res.json({
    status: 'success',
    message: `Data tagihan listrik dengan id ${id} berhasil dihapus`,
    data: null
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
// module.exports = app digunakan oleh Vercel untuk serverless function
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
  });
}

module.exports = app;
