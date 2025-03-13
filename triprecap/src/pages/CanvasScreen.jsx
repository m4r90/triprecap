import React, { useState, useRef, useEffect } from "react";
import DraggableElement from "../components/DraggableElement";
import ElementEditor from "../components/ElementEditor";
import "../styles/CanvasScreen.css";
import { Link, useNavigate, useParams } from "react-router-dom";
import * as exifr from 'exifr';

// Canvas dimensions
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

const CanvasScreen = () => {
    const { canvasId } = useParams();
    const navigate = useNavigate();
    const [elements, setElements] = useState([]);
    const [selectedElement, setSelectedElement] = useState(null);
    const [editingElement, setEditingElement] = useState(null);
    const [previewElement, setPreviewElement] = useState(null);
    const [newText, setNewText] = useState("");
    const canvasRef = useRef(null);
    const [canvasOffset, setCanvasOffset] = useState({ left: 0, top: 0 });
    const [canvasTitle, setCanvasTitle] = useState("");
    const [isSaved, setIsSaved] = useState(false);

    // Update canvas offset when component mounts or window resizes
    useEffect(() => {
        const updateCanvasOffset = () => {
            if (canvasRef.current) {
                const rect = canvasRef.current.getBoundingClientRect();
                setCanvasOffset({ left: rect.left, top: rect.top });
            }
        };

        updateCanvasOffset();
        window.addEventListener('resize', updateCanvasOffset);
        return () => window.removeEventListener('resize', updateCanvasOffset);
    }, []);

    useEffect(() => {
        if (canvasId) {
            fetchCanvas();
        }
    }, [canvasId]);

    const fetchCanvas = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/sketchbooks/canvas/${canvasId}`);
            if (!response.ok) throw new Error("Failed to fetch canvas");
            const canvas = await response.json();
            setElements(canvas.elements || []);
            setCanvasTitle(canvas.title || "Untitled Canvas");
        } catch (error) {
            console.error('Error fetching canvas:', error);
        }
    };

    // Common button style for consistency
    const buttonStyle = {
        width: '100%',
        padding: '8px 15px',
        backgroundColor: '#4285F4',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        textAlign: 'center'
    };

    // Common input field style
    const inputStyle = {
        width: '100%', 
        padding: '8px',
        marginBottom: '10px',
        borderRadius: '4px',
        border: '1px solid #ddd'
    };

    // Function to add text
    const addText = () => {
        if (newText.trim()) {
            const newElement = {
                id: Date.now().toString(),
                type: "text",
                content: newText,
                // Place in center of canvas
                position: { 
                    x: CANVAS_WIDTH / 2 - 50,
                    y: CANVAS_HEIGHT / 2 - 10
                },
                style: { 
                    fontSize: "16px", 
                    color: "black", 
                    fontWeight: "normal",
                    fontStyle: "normal",
                    fontFamily: "Arial, sans-serif",
                    textDecoration: "none",
                    transform: ""
                },
            };
            setElements((prev) => [...prev, newElement]);
            setNewText("");
        }
    };

    // Function to add image
    const handleImageUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        console.log('Starting image upload...');
        
        // Extract GPS data client-side before uploading
        let coordinates = null;
        try {
            console.log('Attempting to extract EXIF data client-side...');
            // Use exifr to extract GPS data
            const gps = await exifr.gps(file);
            console.log('Client-side GPS extraction result:', gps);
            
            if (gps && gps.latitude && gps.longitude) {
                coordinates = {
                    latitude: gps.latitude,
                    longitude: gps.longitude
                };
                console.log('Successfully extracted coordinates:', coordinates);
            } else {
                console.log('No GPS data found in image');
            }
        } catch (error) {
            console.error('Error extracting EXIF data client-side:', error);
        }

        const formData = new FormData();
        formData.append('image', file);
        
        // If we extracted coordinates, send them along with the image
        if (coordinates) {
            formData.append('coordinates', JSON.stringify(coordinates));
        }

        try {
            const response = await fetch('http://localhost:5000/api/upload/image', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            console.log('Upload response:', data);
            
            // Make sure we use the client-extracted coordinates if available
            const metadata = {
                ...data.metadata,
                coordinates: coordinates || data.metadata.coordinates
            };
            
            console.log('Final metadata with coordinates:', metadata);

            const newElement = {
                id: Date.now().toString(),
                type: 'image',
                content: data.imageData,
                position: { x: 50, y: 50 },
                metadata: metadata,
                style: {
                    width: '200px',
                    height: '200px',
                    transform: 'rotate(0deg)',
                }
            };

            console.log('New element created:', newElement);
            setElements(prev => [...prev, newElement]);
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Failed to upload image');
        }
    };

    // Constrain element position to canvas boundaries
    const constrainToCanvas = (element, newPosition) => {
        const width = parseInt(element.style.width) || 100;
        const height = parseInt(element.style.height) || 100;
        
        return {
            x: Math.max(0, Math.min(newPosition.x, CANVAS_WIDTH - width)),
            y: Math.max(0, Math.min(newPosition.y, CANVAS_HEIGHT - height))
        };
    };

    // Update element with boundary constraints
    const updateElement = (updatedElement) => {
        const constrained = {
            ...updatedElement,
            position: constrainToCanvas(updatedElement, updatedElement.position)
        };
        
        setElements(prev => 
            prev.map(el => el.id === constrained.id ? constrained : el)
        );
        
        if (previewElement && previewElement.id === constrained.id) {
            setPreviewElement(null);
        }
    };
    
    // Preview changes without saving
    const previewChanges = (changedElement) => {
        setPreviewElement(changedElement);
    };

    // Cancel editing and clear preview
    const cancelEdit = () => {
        setPreviewElement(null);
        setEditingElement(null);
    };

    // Delete element
    const deleteElement = (id) => {
        setElements(prev => prev.filter(el => el.id !== id));
        if (selectedElement && selectedElement.id === id) {
            setSelectedElement(null);
        }
        if (editingElement && editingElement.id === id) {
            setEditingElement(null);
            setPreviewElement(null);
        }
    };

    // Function to handle editing
    const handleEdit = (element) => {
        setSelectedElement(element);
        setEditingElement(element);
        setPreviewElement(null);
    };

    const handleSave = async () => {
        try {
            const canvasData = {
                elements: elements.map(el => ({
                    id: el.id,
                    type: el.type,
                    content: el.content,
                    position: el.position,
                    style: el.style
                }))
            };

            const url = canvasId 
                ? `http://localhost:5000/api/sketchbooks/canvas/${canvasId}`
                : `http://localhost:5000/api/sketchbooks/canvas`;

            const response = await fetch(url, {
                method: canvasId ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(canvasData)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Server responded with ${response.status}: ${errorText}`);
            }

            const data = await response.json();
            navigate(-1); // Go back to previous page
        } catch (error) {
            console.error('Error saving canvas:', error);
            alert('Error saving canvas: ' + error.message);
        }
    };

    // Add this function to format coordinates for display
    const formatCoordinates = (coordinates) => {
        if (!coordinates || !coordinates.latitude || !coordinates.longitude) {
            return 'No location data';
        }
        
        const { latitude, longitude } = coordinates;
        // Format to 6 decimal places
        return `Lat: ${latitude.toFixed(6)}, Long: ${longitude.toFixed(6)}`;
    };

    // Function to save the canvas
    const saveCanvas = async () => {
        try {
            // Create a deep copy of elements
            const elementsCopy = JSON.parse(JSON.stringify(elements));
            
            // Find any image with coordinates
            const imageWithCoords = elementsCopy.find(el => 
                el.type === 'image' && 
                el.metadata?.coordinates?.latitude && 
                el.metadata?.coordinates?.longitude
            );
            
            // Save canvas first
            const response = await fetch('http://localhost:5000/api/canvas', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: canvasTitle,
                    elements: elementsCopy
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to save canvas');
            }

            const savedCanvas = await response.json();
            console.log('Canvas saved successfully:', savedCanvas);
            setCanvasId(savedCanvas._id);
            setIsSaved(true);
            
            // Now save coordinates separately if we have them
            if (imageWithCoords && imageWithCoords.metadata?.coordinates) {
                const { latitude, longitude } = imageWithCoords.metadata.coordinates;
                
                console.log(`Saving coordinates separately: ${latitude}, ${longitude}`);
                
                const coordResponse = await fetch('http://localhost:5000/api/coordinates', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        canvasId: savedCanvas._id,
                        latitude,
                        longitude
                    }),
                });
                
                if (coordResponse.ok) {
                    console.log('Coordinates saved separately');
                } else {
                    console.error('Failed to save coordinates separately');
                }
            }
            
        } catch (error) {
            console.error('Error saving canvas:', error);
            alert('Failed to save canvas: ' + error.message);
        }
    };

    return (
        <div className="canvas-screen">
            <div className="top-bar">
                <Link to="/" style={buttonStyle}>Back</Link>
                <button onClick={handleSave} style={buttonStyle}>Save</button>
            </div>

            <div className="main-content">
                <div className="sidebar">
                    <div className="tools-section">
                        <h3>Add Text</h3>
                        <input
                            type="text"
                            value={newText}
                            onChange={(e) => setNewText(e.target.value)}
                            placeholder="Enter text"
                            style={inputStyle}
                        />
                        <button onClick={addText} style={buttonStyle}>Add Text</button>

                        <h3>Add Image</h3>
                        <label htmlFor="image-upload" style={buttonStyle}>
                            Upload Image
                        </label>
                        <input
                            id="image-upload"
                            type="file"
                            onChange={handleImageUpload}
                            accept="image/*,.heic,.heif"
                            style={{ display: "none" }}
                        />
                        <small style={{ color: '#666', marginTop: '5px' }}>
                            Supported formats: JPG, PNG, HEIC, and other image formats
                        </small>
                    </div>

                    {editingElement && (
                        <ElementEditor
                            element={editingElement}
                            onUpdate={updateElement}
                            onPreview={previewChanges}
                            onCancel={cancelEdit}
                        />
                    )}
                </div>

                <div className="canvas-container">
                    <div className="canvas-info">
                        {elements.map(element => 
                            element.type === 'image' && element.metadata?.coordinates && (
                                <div key={element.id} style={{
                                    padding: '10px',
                                    margin: '5px',
                                    backgroundColor: '#f0f0f0',
                                    borderRadius: '4px'
                                }}>
                                    <p>Image Location:</p>
                                    <p>{formatCoordinates(element.metadata.coordinates)}</p>
                                </div>
                            )
                        )}
                    </div>
                    <div
                        ref={canvasRef}
                        style={{
                            width: `${CANVAS_WIDTH}px`,
                            height: `${CANVAS_HEIGHT}px`,
                            position: 'relative',
                            backgroundColor: 'white',
                            boxShadow: '0 0 10px rgba(0,0,0,0.1)',
                            border: '1px solid #ddd'
                        }}
                    >
                        {elements.map((element) => {
                            // If this element is being previewed, show the preview version instead
                            const displayElement = 
                                (previewElement && previewElement.id === element.id) 
                                    ? previewElement 
                                    : element;
                                    
                            return (
                                <DraggableElement
                                    key={element.id}
                                    element={displayElement}
                                    onUpdate={updateElement}
                                    onDelete={() => deleteElement(element.id)}
                                    onSelect={() => setSelectedElement(element)}
                                    onEdit={handleEdit}
                                    isSelected={selectedElement?.id === element.id}
                                    isEditing={editingElement?.id === element.id}
                                    canvasBounds={{
                                        width: CANVAS_WIDTH,
                                        height: CANVAS_HEIGHT
                                    }}
                                />
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CanvasScreen;
