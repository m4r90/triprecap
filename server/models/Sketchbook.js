const mongoose = require('mongoose');

const elementSchema = new mongoose.Schema({
    id: String,
    type: String,
    content: String,
    position: {
        x: Number,
        y: Number
    },
    metadata: {
        coordinates: {
            latitude: Number,
            longitude: Number
        },
        timestamp: Date,
        originalTimestamp: Date
    },
    style: mongoose.Schema.Types.Mixed
});

const canvasSchema = new mongoose.Schema({
    title: {
        type: String,
        default: 'Untitled Canvas'
    },
    elements: [elementSchema],
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastModified: {
        type: Date,
        default: Date.now
    }
});

const sketchbookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        default: 'Untitled Sketchbook'
    },
    canvases: [canvasSchema],
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastModified: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Sketchbook', sketchbookSchema); 