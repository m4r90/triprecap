import React, { useState, useRef, useEffect } from "react";
import DraggableElement from "../components/DraggableElement";
import ElementEditor from "../components/ElementEditor";
import "../styles/CanvasScreen.css";
import { Link } from "react-router-dom";

// Canvas dimensions
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

const CanvasScreen = () => {
    const [elements, setElements] = useState([]);
    const [selectedElement, setSelectedElement] = useState(null);
    const [editingElement, setEditingElement] = useState(null);
    const [previewElement, setPreviewElement] = useState(null);
    const [newText, setNewText] = useState("");
    const canvasRef = useRef(null);
    const [canvasOffset, setCanvasOffset] = useState({ left: 0, top: 0 });

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
    const addImage = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const imageUrl = reader.result;
                const newElement = {
                    id: Date.now().toString(),
                    type: "image",
                    content: imageUrl,
                    // Place in center of canvas
                    position: { 
                        x: CANVAS_WIDTH / 2 - 50,
                        y: CANVAS_HEIGHT / 2 - 50
                    },
                    style: { width: "100px", height: "100px" },
                };
                setElements((prev) => [...prev, newElement]);
            };
            reader.readAsDataURL(file);
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

    return (
        <div style={{ display: 'flex', height: '100vh', width: '100%' }}>
            {/* Left sidebar */}
            <div style={{ 
                width: '380px',
                backgroundColor: '#f5f5f5',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                borderRight: '1px solid #ddd',
                overflowY: 'auto'
            }}>
                {/* Back button */}
                <div style={{ marginBottom: '20px' }}>
                    <Link to="/" style={{
                        display: 'inline-block',
                        padding: '8px 15px',
                        backgroundColor: '#4285F4',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '4px'
                    }}>Back</Link>
                </div>

                {/* Tool controls */}
                <div style={{ marginBottom: '20px' }}>
                    <h3>Add Elements</h3>
                    
                    <div style={{ marginBottom: '15px' }}>
                        <input
                            type="text"
                            value={newText}
                            onChange={(e) => setNewText(e.target.value)}
                            placeholder="Enter text"
                            style={inputStyle}
                        />
                        <button onClick={addText} style={buttonStyle}>
                            Add Text
                        </button>
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <label htmlFor="image-upload" style={buttonStyle}>
                            Add Image
                        </label>
                        <input
                            id="image-upload"
                            type="file"
                            accept="image/*"
                            onChange={addImage}
                            style={{ display: "none" }}
                        />
                    </div>
                </div>

                {/* Element editor */}
                {editingElement && (
                    <div>
                        <ElementEditor 
                            element={editingElement} 
                            onUpdate={updateElement}
                            onPreview={previewChanges}
                            onClose={cancelEdit}
                        />
                    </div>
                )}
            </div>

            {/* Canvas container with centering */}
            <div style={{ 
                flex: 1,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#e9e9e9',
                padding: '20px',
                overflow: 'auto'
            }}>
                {/* Actual canvas with fixed dimensions */}
                <div 
                    ref={canvasRef}
                    style={{ 
                        width: `${CANVAS_WIDTH}px`,
                        height: `${CANVAS_HEIGHT}px`,
                        backgroundColor: 'white',
                        position: 'relative',
                        boxShadow: '0 0 10px rgba(0,0,0,0.1)',
                        border: '1px solid #ddd',
                        overflow: 'hidden' // Prevent elements from visually overflowing
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
    );
};

export default CanvasScreen;
