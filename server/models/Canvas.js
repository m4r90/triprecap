const mongoose = require('mongoose');

// Define a specific schema for coordinates
const CoordinatesSchema = new mongoose.Schema({
    latitude: {
        type: Number,
        required: true
    },
    longitude: {
        type: Number,
        required: true
    }
}, { _id: false });

const ElementSchema = new mongoose.Schema({
    id: String,
    type: String, // 'text', 'image', etc.
    content: String,
    position: {
        x: Number,
        y: Number
    },
    style: {
        width: String,
        height: String,
        transform: String,
        // Add other style properties as needed
    },
    metadata: {
        width: Number,
        height: Number,
        format: String,
        coordinates: CoordinatesSchema,
        timestamp: Date,
        originalTimestamp: Date
    }
});

const CanvasSchema = new mongoose.Schema({
    title: {
        type: String,
        default: 'Untitled Canvas'
    },
    elements: [ElementSchema],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    // Use the explicit coordinates schema
    location: CoordinatesSchema
});

// Pre-save middleware to extract coordinates from the first image
CanvasSchema.pre('save', function(next) {
    console.log('Canvas pre-save hook running...');
    console.log('Canvas elements count:', this.elements?.length || 0);
    
    if (this.elements && this.elements.length > 0) {
        // Find the first image with coordinates
        const imageWithCoords = this.elements.find(el => 
            el.type === 'image' && 
            el.metadata && 
            el.metadata.coordinates && 
            el.metadata.coordinates.latitude && 
            el.metadata.coordinates.longitude
        );
        
        if (imageWithCoords) {
            this.location = {
                latitude: imageWithCoords.metadata.coordinates.latitude,
                longitude: imageWithCoords.metadata.coordinates.longitude
            };
            console.log('Canvas pre-save: Found and saved coordinates', JSON.stringify(this.location));
        } else {
            console.log('Canvas pre-save: No coordinates found in any image elements');
        }
    }
    
    this.updatedAt = new Date();
    next();
});

module.exports = mongoose.model('Canvas', CanvasSchema); 