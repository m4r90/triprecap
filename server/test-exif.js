const express = require('express');
const router = express.Router();
const multer = require('multer');
const sharp = require('sharp');
const convert = require('heic-convert');
const ExifReader = require('exif-reader');
const fs = require('fs');

// Keep original images for debugging
const saveOriginalImage = async (buffer, filename) => {
    const dir = './uploads';
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
    fs.writeFileSync(`${dir}/${filename}`, buffer);
    console.log(`Saved original image to ${dir}/${filename}`);
};

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

        // Save original image for debugging
        await saveOriginalImage(req.file.buffer, `original_${Date.now()}_${req.file.originalname}`);

        let imageBuffer = req.file.buffer;
        let coordinates = null; // Initialize coordinates variable first

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

        // Get metadata BEFORE processing the image
        const metadata = await sharp(imageBuffer).metadata();
        console.log('Raw metadata keys:', Object.keys(metadata));
        console.log('EXIF buffer exists:', !!metadata.exif);
        console.log('EXIF buffer size:', metadata.exif ? metadata.exif.length : 0);

        // Try different methods to extract GPS data
        try {
            if (metadata.exif && metadata.exif.length > 0) {
                console.log('Found EXIF data, attempting to extract GPS info');
                
                try {
                    // Method 1: Try direct ExifReader
                    const exifData = ExifReader(metadata.exif);
                    console.log('ExifReader result keys:', Object.keys(exifData));
                    
                    if (exifData && exifData.gps) {
                        console.log('GPS data found:', JSON.stringify(exifData.gps, null, 2));
                        
                        if (exifData.gps.GPSLatitude && exifData.gps.GPSLongitude) {
                            coordinates = {
                                latitude: exifData.gps.GPSLatitude,
                                longitude: exifData.gps.GPSLongitude
                            };
                            console.log('Successfully extracted coordinates:', coordinates);
                        } else {
                            console.log('GPS object exists but missing latitude/longitude');
                        }
                    } else {
                        console.log('No GPS data in EXIF using direct method');
                        
                        // Method 2: Try a buffer from Sharp with metadata preserved
                        const bufferWithMetadata = await sharp(imageBuffer)
                            .withMetadata()
                            .toBuffer();
                            
                        const metadataWithExif = await sharp(bufferWithMetadata).metadata();
                        
                        if (metadataWithExif.exif) {
                            const exifData2 = ExifReader(metadataWithExif.exif);
                            console.log('Second attempt ExifReader result:', Object.keys(exifData2));
                            
                            if (exifData2 && exifData2.gps) {
                                console.log('Second attempt found GPS data');
                                if (exifData2.gps.GPSLatitude && exifData2.gps.GPSLongitude) {
                                    coordinates = {
                                        latitude: exifData2.gps.GPSLatitude,
                                        longitude: exifData2.gps.GPSLongitude
                                    };
                                    console.log('Second attempt extracted coordinates:', coordinates);
                                }
                            }
                        }
                    }
                } catch (exifError) {
                    console.error('Error parsing EXIF data with ExifReader:', exifError);
                }
            }
        } catch (error) {
            console.error('Error in GPS extraction process:', error);
        }

        // If we still don't have coordinates, try hardcoding for testing
        if (!coordinates) {
            console.log('Failed to extract coordinates from image. Setting sample coordinates for testing.');
            // Uncomment the following lines to test with sample coordinates
            // coordinates = {
            //     latitude: 37.7749,
            //     longitude: -122.4194
            // };
        }

        // Process image with Sharp AFTER extracting EXIF data
        const processedImage = await sharp(imageBuffer)
            .resize(800, 800, {
                fit: 'inside',
                withoutEnlargement: true
            })
            .toBuffer();

        // Send response
        res.json({
            imageData: `data:image/jpeg;base64,${processedImage.toString('base64')}`,
            metadata: {
                width: metadata.width,
                height: metadata.height,
                format: metadata.format,
                coordinates: coordinates,
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