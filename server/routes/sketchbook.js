const express = require('express');
const router = express.Router();
const Sketchbook = require('../models/Sketchbook');
const mongoose = require('mongoose');

// Debug middleware
router.use((req, res, next) => {
    console.log('Sketchbook Route:', req.method, req.path, req.params);
    console.log('Request body:', req.body);
    next();
});

// Get all sketchbooks
router.get('/', async (req, res) => {
    try {
        const sketchbooks = await Sketchbook.find().sort({ createdAt: -1 });
        res.json(sketchbooks);
    } catch (err) {
        console.error('Get error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Get single sketchbook by ID
router.get('/:id', async (req, res) => {
    try {
        const sketchbook = await Sketchbook.findById(req.params.id);
        if (!sketchbook) {
            return res.status(404).json({ error: 'Sketchbook not found' });
        }
        res.json(sketchbook);
    } catch (err) {
        console.error('Get error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Create new sketchbook
router.post('/', async (req, res) => {
    try {
        const newSketchbook = new Sketchbook({
            title: req.body.title || 'Untitled Sketchbook',
            canvases: []
        });
        const savedSketchbook = await newSketchbook.save();
        res.json(savedSketchbook);
    } catch (err) {
        console.error('Save error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Add new canvas to sketchbook
router.post('/:id/canvases', async (req, res) => {
    try {
        const sketchbook = await Sketchbook.findById(req.params.id);
        if (!sketchbook) {
            return res.status(404).json({ error: 'Sketchbook not found' });
        }

        const now = new Date();
        sketchbook.canvases.push({
            title: req.body.title || 'Untitled Canvas',
            elements: [],
            createdAt: now,
            lastModified: now
        });
        sketchbook.lastModified = now;
        
        const updatedSketchbook = await sketchbook.save();
        const newCanvas = updatedSketchbook.canvases[updatedSketchbook.canvases.length - 1];
        res.json(newCanvas);
    } catch (err) {
        console.error('Save error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Get canvas by ID
router.get('/canvas/:canvasId', async (req, res) => {
    try {
        const sketchbook = await Sketchbook.findOne({
            'canvases._id': req.params.canvasId
        });
        if (!sketchbook) {
            return res.status(404).json({ error: 'Canvas not found' });
        }
        const canvas = sketchbook.canvases.id(req.params.canvasId);
        res.json(canvas);
    } catch (err) {
        console.error('Get error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Update canvas by ID
router.put('/canvas/:canvasId', async (req, res) => {
    try {
        const sketchbook = await Sketchbook.findOne({
            'canvases._id': req.params.canvasId
        });
        if (!sketchbook) {
            return res.status(404).json({ error: 'Canvas not found' });
        }
        const canvas = sketchbook.canvases.id(req.params.canvasId);
        canvas.elements = req.body.elements;
        canvas.lastModified = new Date();
        sketchbook.lastModified = new Date();
        await sketchbook.save();
        res.json(canvas);
    } catch (err) {
        console.error('Update error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Delete sketchbook
router.delete('/:id', async (req, res) => {
    try {
        console.log('Attempting to delete sketchbook with ID:', req.params.id);
        const result = await Sketchbook.findByIdAndDelete(req.params.id);
        
        if (!result) {
            console.log('Sketchbook not found');
            return res.status(404).json({ error: 'Sketchbook not found' });
        }
        
        console.log('Sketchbook deleted successfully');
        res.json({ message: 'Sketchbook deleted successfully' });
    } catch (err) {
        console.error('Delete error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Delete canvas from sketchbook
router.delete('/:sketchbookId/canvases/:canvasId', async (req, res) => {
    try {
        console.log('Attempting to delete canvas:', req.params.canvasId);
        const sketchbook = await Sketchbook.findById(req.params.sketchbookId);
        
        if (!sketchbook) {
            console.log('Sketchbook not found');
            return res.status(404).json({ error: 'Sketchbook not found' });
        }

        const canvasIndex = sketchbook.canvases.findIndex(canvas => 
            canvas._id.toString() === req.params.canvasId
        );

        if (canvasIndex === -1) {
            console.log('Canvas not found');
            return res.status(404).json({ error: 'Canvas not found' });
        }

        sketchbook.canvases.splice(canvasIndex, 1);
        await sketchbook.save();
        
        console.log('Canvas deleted successfully');
        res.json({ message: 'Canvas deleted successfully' });
    } catch (err) {
        console.error('Delete error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Get recent canvases
router.get('/canvases/recent', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 5;
        const sketchbooks = await Sketchbook.find();
        let allCanvases = [];
        
        sketchbooks.forEach(sketchbook => {
            sketchbook.canvases.forEach(canvas => {
                allCanvases.push({
                    ...canvas.toObject(),
                    sketchbookId: sketchbook._id
                });
            });
        });

        // Sort by last modified date
        allCanvases.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));
        
        // Return only the requested number of canvases
        res.json(allCanvases.slice(0, limit));
    } catch (err) {
        console.error('Get error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Find sketchbook by canvas ID
router.get('/findByCanvas/:canvasId', async (req, res) => {
    try {
        console.log('Looking for canvas with ID:', req.params.canvasId);
        const sketchbook = await Sketchbook.findOne({
            'canvases._id': req.params.canvasId
        });
        
        if (!sketchbook) {
            console.log('No sketchbook found for canvas');
            return res.status(404).json({ error: 'Sketchbook not found' });
        }
        
        console.log('Found sketchbook:', sketchbook.title);
        res.json(sketchbook);
    } catch (err) {
        console.error('Find error:', err);
        res.status(500).json({ error: err.message });
    }
});

// ... autres routes ...

module.exports = router; 