const express = require('express');
const router = express.Router();
const Coordinates = require('../models/Coordinates');

// Save coordinates for a canvas
router.post('/', async (req, res) => {
  try {
    const { canvasId, latitude, longitude } = req.body;
    
    if (!canvasId || !latitude || !longitude) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    console.log(`Saving coordinates for canvas ${canvasId}: ${latitude}, ${longitude}`);
    
    // Upsert - update if exists, create if not
    const result = await Coordinates.findOneAndUpdate(
      { canvasId },
      { latitude, longitude, timestamp: new Date() },
      { upsert: true, new: true }
    );
    
    res.status(201).json(result);
  } catch (error) {
    console.error('Error saving coordinates:', error);
    res.status(500).json({ error: 'Failed to save coordinates' });
  }
});

// Get coordinates for all canvases
router.get('/', async (req, res) => {
  try {
    const allCoordinates = await Coordinates.find();
    res.json(allCoordinates);
  } catch (error) {
    console.error('Error fetching coordinates:', error);
    res.status(500).json({ error: 'Failed to fetch coordinates' });
  }
});

// Get coordinates for a specific canvas
router.get('/:canvasId', async (req, res) => {
  try {
    const { canvasId } = req.params;
    const coordinates = await Coordinates.findOne({ canvasId });
    
    if (!coordinates) {
      return res.status(404).json({ error: 'Coordinates not found' });
    }
    
    res.json(coordinates);
  } catch (error) {
    console.error('Error fetching coordinates:', error);
    res.status(500).json({ error: 'Failed to fetch coordinates' });
  }
});

module.exports = router; 