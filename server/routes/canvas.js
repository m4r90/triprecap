// Save canvas route
router.post('/', async (req, res) => {
    try {
        const { title, elements } = req.body;
        
        console.log('Saving canvas:', title);
        
        // Debug: Check if any elements have coordinates
        if (elements && elements.length > 0) {
            const imageElements = elements.filter(el => el.type === 'image');
            console.log(`Canvas has ${elements.length} elements, ${imageElements.length} images`);
            
            const elementsWithCoords = elements.filter(el => 
                el.type === 'image' && 
                el.metadata?.coordinates?.latitude && 
                el.metadata?.coordinates?.longitude
            );
            
            console.log(`Elements with coordinates: ${elementsWithCoords.length}`);
            
            if (elementsWithCoords.length > 0) {
                console.log('First element with coordinates:', {
                    id: elementsWithCoords[0].id,
                    coords: elementsWithCoords[0].metadata.coordinates
                });
            }
        }
        
        const canvas = new Canvas({
            title,
            elements
        });
        
        await canvas.save();
        
        // Debug: Check if location was saved
        console.log('Canvas saved with location:', canvas.location);
        
        res.status(201).json(canvas);
    } catch (error) {
        console.error('Error saving canvas:', error);
        res.status(500).json({ error: 'Failed to save canvas' });
    }
}); 