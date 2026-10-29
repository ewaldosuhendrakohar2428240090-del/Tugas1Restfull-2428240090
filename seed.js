require('dotenv').config();
const mongoose = require('mongoose');
const TarifListrik = require('./models/TarifListrik');
const ElectricityBill = require('./models/ElectricityBill');

const initialTarif = [
  {
    golongan: 'R1-900VA',
    daya: '900 VA',
    tarifPerKwh: 1352,
    deskripsi: 'Rumah Tangga Daya 900 VA Subsidi & Non-Subsidi'
  },
  {
    golongan: 'R1-1300VA',
    daya: '1300 VA',
    tarifPerKwh: 1444,
    deskripsi: 'Rumah Tangga Daya 1300 VA Non-Subsidi'
  },
  {
    golongan: 'R1-2200VA',
    daya: '2200 VA',
    tarifPerKwh: 1444,
    deskripsi: 'Rumah Tangga Daya 2200 VA Non-Subsidi'
  }
];

async function seedData() {
  try {
    const dbUri = process.env.DB_URI || 'mongodb://localhost:27017/utilitas_listrik';
    await mongoose.connect(dbUri);
    console.log('Terhubung ke MongoDB untuk seeder...');

    // 1. Seed TarifListrik (Referencing Master)
    await TarifListrik.deleteMany({});
    const tarifDocs = await TarifListrik.insertMany(initialTarif);
    console.log('Data master TarifListrik berhasil di-seed.');

    const tarif900 = tarifDocs.find((t) => t.golongan === 'R1-900VA');
    const tarif1300 = tarifDocs.find((t) => t.golongan === 'R1-1300VA');

    // 2. Seed ElectricityBill dengan Embedding (alamat) & Referencing (tarifId)
    await ElectricityBill.deleteMany({});
    const initialBills = [
      {
        nomorPelanggan: '512019827364',
        namaPelanggan: 'Yudi Pratama',
        golongan: 'R1-900VA',
        bulan: 'Januari 2025',
        pemakaianKwh: 210,
        totalTagihan: 303000,
        status: 'Lunas',
        alamat: {
          jalan: 'Jl. Sudirman No. 12',
          kota: 'Palembang',
          kodePos: '30129'
        },
        tarifId: tarif900 ? tarif900._id : null
      },
      {
        nomorPelanggan: '512028374651',
        namaPelanggan: 'Andi Setiawan',
        golongan: 'R1-1300VA',
        bulan: 'Januari 2025',
        pemakaianKwh: 150,
        totalTagihan: 216600,
        status: 'Belum Lunas',
        alamat: {
          jalan: 'Jl. Merdeka No. 45',
          kota: 'Palembang',
          kodePos: '30113'
        },
        tarifId: tarif1300 ? tarif1300._id : null
      },
      {
        nomorPelanggan: '512037465819',
        namaPelanggan: 'Budi Santoso',
        golongan: 'R1-900VA',
        bulan: 'Januari 2025',
        pemakaianKwh: 300,
        totalTagihan: 450000,
        status: 'Lunas',
        alamat: {
          jalan: 'Jl. Kolonel Atmo No. 8',
          kota: 'Jakarta',
          kodePos: '10110'
        },
        tarifId: tarif900 ? tarif900._id : null
      }
    ];

    await ElectricityBill.insertMany(initialBills);
    console.log('Data ElectricityBill dengan Embedding & Referencing berhasil di-seed!');

    await mongoose.disconnect();
    console.log('Seeder selesai dan koneksi ditutup.');
  } catch (err) {
    console.error('Gagal menjalankan seeder:', err.message);
  }
}

seedData();
