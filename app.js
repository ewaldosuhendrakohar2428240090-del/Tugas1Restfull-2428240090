require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const ElectricityBill = require('./models/ElectricityBill');
const TarifListrik = require('./models/TarifListrik');
const cekApiKey = require('./middlewares/cekApiKey');

const app = express();
const PORT = process.env.PORT || 4000;
const DB_URI = process.env.DB_URI || 'mongodb://localhost:27017/utilitas_listrik';

// Batasan bawaan pagination & query
const LIMIT_DEFAULT = 10;
const LIMIT_MAKS = 50;
const FIELD_SORT = ['namaPelanggan', 'pemakaianKwh', 'totalTagihan', 'createdAt', 'golongan', 'status'];
const FIELD_BOLEH_DIPILIH = [
  'nomorPelanggan',
  'namaPelanggan',
  'golongan',
  'bulan',
  'pemakaianKwh',
  'totalTagihan',
  'status',
  'alamat',
  'tarifId',
  'createdAt'
];

// Helper angka aman untuk query pagination
function angkaAman(nilai, bawaan, min, maks) {
  const n = parseInt(nilai, 10);
  if (Number.isNaN(n)) return bawaan;
  return Math.min(Math.max(n, min), maks);
}

// Helper untuk mengecek apakah format ID valid sebagai MongoDB ObjectId
function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// Middleware logger untuk mencatat setiap request yang masuk
function logger(req, res, next) {
  const waktu = new Date().toISOString();
  console.log(`[${waktu}] ${req.method} ${req.url}`);
  next();
}
app.use(logger);

// Middleware agar req.body (JSON) dapat dibaca
app.use(express.json());

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
    fitur: ['Embedding Schema', 'Referencing Schema', 'Filtering', 'Pagination', 'Sorting', 'Projection']
  });
});

// GET /tariffs -> endpoint pendukung untuk melihat data master tarif listrik (Referencing)
app.get('/tariffs', async (req, res) => {
  try {
    const data = await TarifListrik.find();
    res.json(data);
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

/**
 * GET /electricity-bills -> Endpoint Utama
 * Mendukung:
 * 1. Filtering:
 *    - ?golongan=R1-900VA
 *    - ?status=Lunas
 *    - ?kota=Palembang (filter pada Embedded Schema alamat.kota)
 * 2. Pagination:
 *    - ?page=1&limit=5
 * 3. Sorting:
 *    - ?sort=totalTagihan (naik) atau ?sort=-totalTagihan (turun)
 * 4. Projection:
 *    - ?fields=namaPelanggan,totalTagihan,status
 * 5. Referencing:
 *    - populate('tarifId') secara otomatis
 */
app.get('/electricity-bills', async (req, res) => {
  try {
    const filter = {};

    // 1. FILTERING
    if (req.query.golongan) {
      filter.golongan = { $regex: new RegExp(`^${req.query.golongan}$`, 'i') };
    }
    if (req.query.status) {
      filter.status = { $regex: new RegExp(`^${req.query.status}$`, 'i') };
    }
    if (req.query.kota) {
      filter['alamat.kota'] = { $regex: new RegExp(`^${req.query.kota}$`, 'i') };
    }

    // 2. PAGINATION
    const isPaginated = req.query.page !== undefined || req.query.limit !== undefined;
    const page = angkaAman(req.query.page, 1, 1, Number.MAX_SAFE_INTEGER);
    const limit = angkaAman(req.query.limit, LIMIT_DEFAULT, 1, LIMIT_MAKS);

    // 3. SORTING: ?sort=totalTagihan atau ?sort=-totalTagihan
    const sortParam = String(req.query.sort || '-createdAt');
    const arah = sortParam.startsWith('-') ? -1 : 1;
    const sortField = sortParam.replace(/^-/, '');

    if (req.query.sort && !FIELD_SORT.includes(sortField)) {
      return res.status(400).json({
        status: 'error',
        message: `sort hanya boleh salah satu dari: ${FIELD_SORT.join(', ')}`
      });
    }

    // 4. PROJECTION: ?fields=namaPelanggan,totalTagihan
    let select = '';
    if (req.query.fields) {
      const fields = String(req.query.fields).split(',').map((f) => f.trim());
      const isValid = fields.every((f) => FIELD_BOLEH_DIPILIH.includes(f));
      if (!isValid) {
        return res.status(400).json({
          status: 'error',
          message: `fields hanya boleh dari: ${FIELD_BOLEH_DIPILIH.join(', ')}`
        });
      }
      select = fields.join(' ');
    }

    // Bangun Query Mongoose
    let query = ElectricityBill.find(filter).select(select);

    if (req.query.sort) {
      query = query.sort({ [sortField]: arah, _id: 1 });
    }

    // REFERENCING: populate tarifId
    if (!select || select.split(' ').includes('tarifId')) {
      query = query.populate('tarifId', 'golongan daya tarifPerKwh deskripsi');
    }

    if (isPaginated) {
      query = query.skip((page - 1) * limit).limit(limit);
      const [data, total] = await Promise.all([query, ElectricityBill.countDocuments(filter)]);
      return res.json({
        status: 'success',
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        data
      });
    }

    // Jika tanpa parameter page/limit, kembalikan array langsung untuk kompatibilitas tugas sebelumnya
    const data = await query;
    res.json(data);
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Gagal mengambil data tagihan listrik',
      error: err.message
    });
  }
});

// GET /electricity-bills/:id -> satu data berdasarkan id (lengkap dengan populate tarifId)
app.get('/electricity-bills/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(404).json({
        status: 'error',
        message: `Data dengan id ${id} tidak ditemukan`,
        data: null
      });
    }

    const data = await ElectricityBill.findById(id).populate('tarifId');

    if (!data) {
      return res.status(404).json({
        status: 'error',
        message: `Data dengan id ${id} tidak ditemukan`,
        data: null
      });
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Gagal mengambil data tagihan listrik',
      error: err.message
    });
  }
});

// POST /electricity-bills -> tambah data baru (dilindungi dengan cekApiKey)
app.post('/electricity-bills', cekApiKey, async (req, res) => {
  try {
    const nomorPelanggan = req.body.nomorPelanggan || req.body.idPelanggan;
    const namaPelanggan = req.body.namaPelanggan || req.body.nama;
    const golongan = req.body.golongan;
    const bulan = req.body.bulan || 'Februari 2025';
    const pemakaianKwh = req.body.pemakaianKwh;
    const totalTagihan = req.body.totalTagihan;
    const status = req.body.status || 'Belum Lunas';
    const alamat = req.body.alamat || {};
    let tarifId = req.body.tarifId;

    // Validasi field wajib
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

    // Auto-resolve tarifId jika user tidak mengirimkan ObjectId tarifId secara manual
    if (!tarifId) {
      const tarifMatch = await TarifListrik.findOne({ golongan: String(golongan).trim() });
      if (tarifMatch) {
        tarifId = tarifMatch._id;
      }
    }

    const baru = await ElectricityBill.create({
      nomorPelanggan: String(nomorPelanggan),
      namaPelanggan: String(namaPelanggan),
      golongan: String(golongan),
      bulan: String(bulan),
      pemakaianKwh: Number(pemakaianKwh),
      totalTagihan: Number(totalTagihan),
      status: String(status),
      alamat,
      tarifId
    });

    const populatedBaru = await ElectricityBill.findById(baru._id).populate('tarifId');

    res.status(201).json({
      status: 'success',
      message: 'Data berhasil ditambahkan',
      data: populatedBaru || baru
    });
  } catch (err) {
    res.status(400).json({
      status: 'error',
      message: err.message,
      data: null
    });
  }
});

// PUT /electricity-bills/:id -> ubah data (dilindungi dengan cekApiKey)
app.put('/electricity-bills/:id', cekApiKey, async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(404).json({
        status: 'error',
        message: `Data dengan id ${id} tidak ditemukan`,
        data: null
      });
    }

    const nomorPelanggan = req.body.nomorPelanggan || req.body.idPelanggan;
    const namaPelanggan = req.body.namaPelanggan || req.body.nama;
    const golongan = req.body.golongan;
    const bulan = req.body.bulan || 'Januari 2025';
    const pemakaianKwh = req.body.pemakaianKwh;
    const totalTagihan = req.body.totalTagihan;
    const status = req.body.status || 'Belum Lunas';
    const alamat = req.body.alamat;
    let tarifId = req.body.tarifId;

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

    // Auto-resolve tarifId jika golongan diubah
    if (!tarifId && golongan) {
      const tarifMatch = await TarifListrik.findOne({ golongan: String(golongan).trim() });
      if (tarifMatch) {
        tarifId = tarifMatch._id;
      }
    }

    const updatePayload = {
      nomorPelanggan: String(nomorPelanggan),
      namaPelanggan: String(namaPelanggan),
      golongan: String(golongan),
      bulan: String(bulan),
      pemakaianKwh: Number(pemakaianKwh),
      totalTagihan: Number(totalTagihan),
      status: String(status)
    };

    if (alamat) updatePayload.alamat = alamat;
    if (tarifId) updatePayload.tarifId = tarifId;

    const dataDiperbarui = await ElectricityBill.findByIdAndUpdate(
      id,
      updatePayload,
      { returnDocument: 'after', runValidators: true }
    ).populate('tarifId');

    if (!dataDiperbarui) {
      return res.status(404).json({
        status: 'error',
        message: `Data dengan id ${id} tidak ditemukan`,
        data: null
      });
    }

    res.json({
      status: 'success',
      message: 'Data berhasil diperbarui',
      data: dataDiperbarui
    });
  } catch (err) {
    res.status(400).json({
      status: 'error',
      message: err.message,
      data: null
    });
  }
});

// DELETE /electricity-bills/:id -> hapus data (dilindungi dengan cekApiKey)
app.delete('/electricity-bills/:id', cekApiKey, async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(404).json({
        status: 'error',
        message: `Data dengan id ${id} tidak ditemukan`,
        data: null
      });
    }

    const deleted = await ElectricityBill.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        status: 'error',
        message: `Data dengan id ${id} tidak ditemukan`,
        data: null
      });
    }

    res.json({
      status: 'success',
      message: `Data tagihan listrik dengan id ${id} berhasil dihapus`,
      data: deleted
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Gagal menghapus data',
      error: err.message
    });
  }
});

// Middleware catch-all untuk route yang tidak terdaftar (404 Not Found)
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Endpoint tidak ditemukan',
    data: null
  });
});

// Koneksi ke MongoDB dan jalankan server
mongoose
  .connect(DB_URI)
  .then(() => {
    console.log('Terhubung ke MongoDB');
    if (process.env.NODE_ENV !== 'production') {
      app.listen(PORT, () => {
        console.log(`Server berjalan di http://localhost:${PORT}`);
      });
    }
  })
  .catch((err) => {
    console.error('Gagal terhubung ke MongoDB:', err.message);
    process.exit(1);
  });

module.exports = app;
