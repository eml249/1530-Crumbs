const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomName: {
    type: String,
    required: true,
    trim: true
  },
  inBuilding: {
    type: String,
    required: true,
    trim: true
  },
  roomNum: {
    type: Number,
    required: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 0
  },
  available: {
    type: Boolean,
    required: true,
    default: true
  },
  congestionIndex: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields automatically
});

module.exports = mongoose.model('Room', roomSchema);
