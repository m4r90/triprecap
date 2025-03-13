import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Default Mapbox token
const MAPBOX_TOKEN = 'pk.eyJ1IjoibTRyOTAiLCJhIjoiY204N2wyMDM0MGQwajJscXh3M2hqZmVhNSJ9.bQJw1q3vGwSjztroLDj2sQ';
mapboxgl.accessToken = MAPBOX_TOKEN;

const SketchbookMap = ({ canvases = [] }) => {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const markersRef = useRef([]);

    useEffect(() => {
        console.log('SketchbookMap received canvases:', canvases.length);
        
        if (!mapContainer.current) return;

        // Initialize map if not already created
        if (!map.current) {
            console.log('Creating new map');
            map.current = new mapboxgl.Map({
                container: mapContainer.current,
                style: 'mapbox://styles/mapbox/streets-v11',
                center: [0, 0],
                zoom: 1
            });

            map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

            map.current.on('load', () => {
                console.log('Map loaded, adding markers');
                addMarkers();
            });
        } else {
            // Clear existing markers
            markersRef.current.forEach(marker => marker.remove());
            markersRef.current = [];
            
            // Add markers
            addMarkers();
        }

        return () => {
            markersRef.current.forEach(marker => marker.remove());
        };
    }, [canvases]);

    const addMarkers = () => {
        // Clean up existing markers
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];
        
        console.log('Adding markers for', canvases.length, 'canvases');
        
        // Hardcoded coordinates - ALWAYS ADD THIS as a test marker
        const hardcodedCoords = [7.231969444444444, 43.68097777777778]; // The coordinates we know
        
        // Add the exact coordinates with a red pin
        addRedMarker(hardcodedCoords, "Exact Location");
        
        // Find coordinates from canvases
        let foundValidCoordinates = false;
        
        if (canvases && canvases.length > 0) {
            canvases.forEach(canvas => {
                if (!canvas) return;
                
                // Look for coordinates in multiple places
                let coordinates = null;
                let title = canvas.title || 'Untitled Canvas';
                
                // Check direct location property
                if (canvas.location && canvas.location.latitude && canvas.location.longitude) {
                    coordinates = [canvas.location.longitude, canvas.location.latitude];
                    console.log(`Found coordinates in canvas.location for "${title}":`, coordinates);
                    addMarker(coordinates, title);
                    foundValidCoordinates = true;
                } 
                // Check elements
                else if (canvas.elements && Array.isArray(canvas.elements)) {
                    canvas.elements.forEach(element => {
                        if (element.type === 'image' && 
                            element.metadata && 
                            element.metadata.coordinates && 
                            element.metadata.coordinates.latitude && 
                            element.metadata.coordinates.longitude) {
                            
                            coordinates = [
                                element.metadata.coordinates.longitude,
                                element.metadata.coordinates.latitude
                            ];
                            
                            console.log(`Found coordinates in element for "${title}":`, coordinates);
                            addMarker(coordinates, title);
                            foundValidCoordinates = true;
                        }
                    });
                }
            });
        }
        
        // If no valid coordinates found in canvases, center on hardcoded marker
        if (!foundValidCoordinates) {
            console.log('No valid coordinates found in canvases, centering on hardcoded marker');
            map.current.flyTo({
                center: hardcodedCoords,
                zoom: 14,  // Increased zoom for better visibility
                essential: true
            });
        }
    };
    
    const addMarker = (coordinates, title) => {
        if (!map.current) return;
        
        // Create a DOM element for the marker
        const el = document.createElement('div');
        el.className = 'large-fixed-marker';
        
        // Create the popup
        const popup = new mapboxgl.Popup({ offset: 25 })
            .setHTML(`
                <h3>${title}</h3>
                <p>Location: ${coordinates[1].toFixed(6)}, ${coordinates[0].toFixed(6)}</p>
            `);
        
        // Create and add the marker
        const marker = new mapboxgl.Marker({
            element: el,
            anchor: 'center'
        })
            .setLngLat(coordinates)
            .setPopup(popup)
            .addTo(map.current);
        
        // Store reference to marker for cleanup
        markersRef.current.push(marker);
        
        return marker;
    };
    
    // New function specifically for the red marker
    const addRedMarker = (coordinates, title) => {
        if (!map.current) return;
        
        // Create a DOM element for the red pin
        const el = document.createElement('div');
        el.className = 'red-pin-marker';
        
        // Add inner HTML for custom pin appearance
        el.innerHTML = `
            <div class="pin-head"></div>
            <div class="pin-tail"></div>
        `;
        
        // Create the popup with more detailed information
        const popup = new mapboxgl.Popup({ offset: 25 })
            .setHTML(`
                <h3>${title}</h3>
                <p><strong>Precise Coordinates:</strong></p>
                <p>Latitude: ${coordinates[1].toFixed(6)}</p>
                <p>Longitude: ${coordinates[0].toFixed(6)}</p>
                <p class="location-note">Nice, France</p>
            `);
        
        // Create and add the marker
        const marker = new mapboxgl.Marker({
            element: el,
            anchor: 'bottom',  // Anchor at bottom of the pin
            color: '#FF0000'   // Red color
        })
            .setLngLat(coordinates)
            .setPopup(popup)
            .addTo(map.current);
        
        // Store reference for cleanup
        markersRef.current.push(marker);
        
        return marker;
    };

    return (
        <div>
            <div 
                ref={mapContainer} 
                style={{ width: '100%', height: '400px', marginBottom: '20px' }}
            />
            <div style={{ textAlign: 'center', fontSize: '0.9rem', color: '#666' }}>
                Map showing exact location (red pin) and canvas locations
            </div>
            
            {/* Add CSS for the red pin marker */}
            <style jsx="true">{`
                .red-pin-marker {
                    width: 30px;
                    height: 40px;
                    position: relative;
                }
                
                .pin-head {
                    width: 20px;
                    height: 20px;
                    border-radius: 50% 50% 50% 0;
                    background: #FF0000;
                    position: absolute;
                    transform: rotate(-45deg);
                    left: 50%;
                    top: 50%;
                    margin: -20px 0 0 -10px;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.5);
                }
                
                .pin-head:after {
                    content: '';
                    width: 10px;
                    height: 10px;
                    margin: 5px 0 0 5px;
                    background: white;
                    position: absolute;
                    border-radius: 50%;
                }
                
                .pin-tail {
                    width: 0;
                    height: 0;
                    border-style: solid;
                    border-width: 10px 5px 0;
                    border-color: #FF0000 transparent transparent;
                    position: absolute;
                    left: 50%;
                    top: 50%;
                    margin: 0 0 0 -5px;
                    filter: drop-shadow(0 2px 2px rgba(0,0,0,0.3));
                }
            `}</style>
        </div>
    );
};

export default SketchbookMap; 