const mongoose = require('mongoose');

// 1. EMBEDDING: Subschema alamatPelanggan (Embedded Document di dalam ElectricityBill)
const alamatPelangganSchema = new mongoose.Schema(
  {
    jalan: { type: String, trim: true, default: '' },
    kota: { type: String, trim: true, default: '' },
    kodePos: { type: String, trim: true, default: '' }
  },
  { _id: false }
);

// 2. Main Schema: ElectricityBill
const electricityBillSchema = new mongoose.Schema(
  {
    nomorPelanggan: {
      type: String,
      required: [true, 'nomorPelanggan/idPelanggan wajib diisi'],
      trim: true
    },
    namaPelanggan: {
      type: String,
      required: [true, 'namaPelanggan/nama wajib diisi'],
      trim: true
    },
    golongan: {
      type: String,
      required: [true, 'golongan wajib diisi'],
      trim: true
    },
    bulan: {
      type: String,
      default: 'Januari 2025',
      trim: true
    },
    pemakaianKwh: {
      type: Number,
      required: [true, 'pemakaianKwh wajib diisi']
    },
    totalTagihan: {
      type: Number,
      required: [true, 'totalTagihan wajib diisi']
    },
    status: {
      type: String,
      default: 'Belum Lunas',
      trim: true
    },
    // EMBEDDING: schema alamatPelanggan tertanam langsung di dokumen
    alamat: alamatPelangganSchema,

    // REFERENCING: Menghubungkan ke collection TarifListrik via ObjectId (populate)
    tarifId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TarifListrik'
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id;
        ret.idPelanggan = ret.nomorPelanggan;
        ret.nama = ret.namaPelanggan;
        return ret;
      }
    },
    toObject: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id;
        ret.idPelanggan = ret.nomorPelanggan;
        ret.nama = ret.namaPelanggan;
        return ret;
      }
    }
  }
);

module.exports = mongoose.model('ElectricityBill', electricityBillSchema);
