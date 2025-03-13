const mongoose = require('mongoose');

const CoordinatesSchema = new mongoose.Schema({
  canvasId: {
    type: String,
    required: true,
    unique: true
  },
  latitude: {
    type: Number,
    required: true
  },
  longitude: {
    type: Number,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Coordinates', CoordinatesSchema); 