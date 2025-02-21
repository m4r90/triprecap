const express = require('express');
const router = express.Router();
const Sketchbook = require('../models/Sketchbook');

// Get all sketchbooks
router.get('/', async (req, res) => {
  try {
    const sketchbooks = await Sketchbook.find();
    res.json(sketchbooks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ... autres routes ...

module.exports = router; 