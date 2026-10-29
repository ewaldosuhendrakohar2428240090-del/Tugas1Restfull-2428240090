const mongoose = require('mongoose');

const tarifSchema = new mongoose.Schema(
  {
    golongan: {
      type: String,
      required: [true, 'golongan wajib diisi'],
      unique: true,
      trim: true
    },
    daya: {
      type: String,
      required: [true, 'daya wajib diisi'],
      trim: true
    },
    tarifPerKwh: {
      type: Number,
      required: [true, 'tarifPerKwh wajib diisi']
    },
    deskripsi: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('TarifListrik', tarifSchema);
