const express = require('express');
const router = express.Router();
const multer = require('multer');
const sharp = require('sharp');
const convert = require('heic-convert');
const ExifReader = require('exif-reader');

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 25 * 1024 * 1024, // 25MB limit
    }
});
 
router.post('/image', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        console.log('File received:', {
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size
        });

        let imageBuffer = req.file.buffer;
        
        // Check if client sent coordinates
        let coordinates = null;
        if (req.body.coordinates) {
            try {
                coordinates = JSON.parse(req.body.coordinates);
                console.log('Using client-provided coordinates:', coordinates);
            } catch (error) {
                console.error('Error parsing client coordinates:', error);
            }
        }

        // Handle HEIC/HEIF files
        if (req.file.originalname.toLowerCase().match(/\.(heic|heif)$/)) {
            try {
                console.log('Converting HEIC/HEIF image...');
                const { buffer } = await convert({
                    buffer: imageBuffer,
                    format: 'JPEG',
                    quality: 0.9
                });
                imageBuffer = buffer;
            } catch (error) {
                console.error('HEIC conversion error:', error);
                return res.status(500).json({ error: 'Failed to convert HEIC image' });
            }
        }

        // Get metadata
        const metadata = await sharp(imageBuffer).metadata();

        // Process image
        const processedImage = await sharp(imageBuffer)
            .resize(800, 800, {
                fit: 'inside',
                withoutEnlargement: true
            })
            .toBuffer();

        // Send response with client-provided coordinates
        res.json({
            imageData: `data:image/jpeg;base64,${processedImage.toString('base64')}`,
            metadata: {
                width: metadata.width,
                height: metadata.height,
                format: metadata.format,
                coordinates: coordinates,  // Use client-provided coordinates
                timestamp: new Date(),
                originalTimestamp: metadata?.exif?.dateTimeOriginal
            }
        });

    } catch (error) {
        console.error('Image processing error:', error);
        res.status(500).json({ error: 'Failed to process image: ' + error.message });
    }
});

module.exports = router; 