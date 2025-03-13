const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Debug middleware
app.use((req, res, next) => {
    console.log('Incoming request:', req.method, req.path, req.params);
    next();
});

// CORS and JSON parsing middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/triprecap', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// Import routes
const sketchbookRoutes = require('./routes/sketchbook');
const userRoutes = require('./routes/users');

// Use routes with explicit paths
app.use('/api/sketchbooks', sketchbookRoutes);
app.use('/api/users', userRoutes);

// Test route
app.get('/test', (req, res) => {
    res.json({ message: 'Server is working' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API available at http://localhost:${PORT}`);
}); 