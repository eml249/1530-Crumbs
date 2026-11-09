const mongoose = require('mongoose');

const buildingSchema = new mongoose.Schema({
  buildName: { type: String, required: true },
  address: { type: String, required: true },
  classification: { 
    type: String, 
    required: true, 
    enum: ['Academic', 'Dining', 'Residence Hall', 'Library', 'Administrative', 'Recreational', 'Other'],
    default: 'Academic'
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Building', buildingSchema);