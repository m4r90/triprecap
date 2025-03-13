const ExifReader = require('exif-reader');

const extractExifData = async (imageBuffer) => {
    try {
        const exif = ExifReader(imageBuffer);
        
        if (!exif || !exif.gps) {
            return null;
        }

        return {
            coordinates: {
                latitude: exif.gps.GPSLatitude,
                longitude: exif.gps.GPSLongitude
            },
            timestamp: exif.exif?.DateTimeOriginal || null
        };
    } catch (error) {
        console.error('Error extracting EXIF data:', error);
        return null;
    }
};

module.exports = { extractExifData }; 