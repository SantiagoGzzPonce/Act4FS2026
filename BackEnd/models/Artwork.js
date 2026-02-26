const mongoose = require('mongoose');

const artworkSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  artist: { type: String, required: true, trim: true },
  year: { type: Number, required: true },
  inventoryNumber: { type: String, required: true, unique: true },
  description: { type: String, trim: true, default: "" },
  technique: { type: String, trim: true, default: "" },
  location: { type: String, trim: true, default: "" },
  condition: { 
    type: String, 
    enum: ['Excelente', 'Bueno', 'Regular', 'En restauración', 'Dañado'],
    default: 'Bueno'
  },
  createdAt: { type: Date, default: Date.now },
  lastRevised: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Artwork', artworkSchema);