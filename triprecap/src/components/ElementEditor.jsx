import React, { useState, useEffect } from "react";

const ElementEditor = ({ element, onUpdate, onPreview, onCancel }) => {
    // Local state to track all changes before saving
    const [localElement, setLocalElement] = useState({...element});

    // Reset local state when element prop changes
    useEffect(() => {
        setLocalElement({...element});
    }, [element]);

    // Update local element and send for preview
    const updateLocalElement = (changes) => {
        const updatedElement = {...localElement, ...changes};
        setLocalElement(updatedElement);
        onPreview(updatedElement);
    };

    const updateLocalStyle = (styleChanges) => {
        const updatedElement = {
            ...localElement, 
            style: {...localElement.style, ...styleChanges}
        };
        setLocalElement(updatedElement);
        onPreview(updatedElement);
    };

    const updateText = (newText) => {
        updateLocalElement({content: newText});
    };

    const handleFontSizeChange = (e) => {
        const size = e.target.value;
        updateLocalStyle({ fontSize: `${size}px` });
    };

    const handleFontFamilyChange = (e) => {
        const family = e.target.value;
        updateLocalStyle({ fontFamily: family });
    };

    const handleWidthChange = (e) => {
        const width = parseInt(e.target.value);
        updateLocalStyle({ width: `${width}px` });
    };

    const handleHeightChange = (e) => {
        const height = parseInt(e.target.value);
        updateLocalStyle({ height: `${height}px` });
    };

    const handleRotationChange = (e) => {
        const rotation = parseInt(e.target.value);
        updateLocalStyle({ transform: `rotate(${rotation}deg)` });
    };

    const resizeImage = (factor) => {
        const currentWidth = parseInt(localElement.style.width) || 100;
        const currentHeight = parseInt(localElement.style.height) || 100;
        const width = Math.round(currentWidth * factor);
        const height = Math.round(currentHeight * factor);
        updateLocalStyle({ 
            width: `${width}px`, 
            height: `${height}px` 
        });
    };

    const saveChanges = () => {
        if (typeof onUpdate === 'function') {
            onUpdate(localElement);
        } else {
            console.error('Error: onUpdate is not a function', onUpdate);
        }
        
        // Use onCancel instead of onClose
        if (typeof onCancel === 'function') {
            onCancel();
        } else {
            console.error('Error: onCancel is not a function', onCancel);
        }
    };

    // Get current rotation value from transform property
    const getCurrentRotation = () => {
        const transform = localElement.style.transform || '';
        const match = transform.match(/rotate\((-?\d+)deg\)/);
        return match ? parseInt(match[1]) : 0;
    };

    // Extract font size as a number
    const getFontSize = () => {
        const fontSize = localElement.style.fontSize || '16px';
        return parseInt(fontSize);
    };

    // Get current width and height as numbers
    const getWidth = () => parseInt(localElement.style.width) || 100;
    const getHeight = () => parseInt(localElement.style.height) || 100;

    return (
        <div style={{ padding: "15px 0" }}>
            <h3>Edit {localElement.type === "text" ? "Text" : "Image"}</h3>

            {/* Common properties for both text and image elements */}
            <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px" }}>Rotation:</label>
                <input
                    type="range"
                    min="-180"
                    max="180"
                    value={getCurrentRotation()}
                    onChange={handleRotationChange}
                    style={{ width: "100%" }}
                />
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>-180°</span>
                    <span>{getCurrentRotation()}°</span>
                    <span>180°</span>
                </div>
            </div>

            {/* Text-specific properties */}
            {localElement.type === "text" && (
                <>
                    <div style={{ marginBottom: "15px" }}>
                        <label style={{ display: "block", marginBottom: "5px" }}>Text:</label>
                        <textarea
                            value={localElement.content}
                            onChange={(e) => updateText(e.target.value)}
                            style={{
                                width: "100%",
                                height: "80px",
                                padding: "8px",
                                borderRadius: "4px",
                                border: "1px solid #ddd",
                                resize: "vertical"
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: "15px" }}>
                        <label style={{ display: "block", marginBottom: "5px" }}>Font Size:</label>
                        <input
                            type="range"
                            min="10"
                            max="72"
                            value={getFontSize()}
                            onChange={handleFontSizeChange}
                            style={{ width: "100%" }}
                        />
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span>10px</span>
                            <span>{getFontSize()}px</span>
                            <span>72px</span>
                        </div>
                    </div>

                    <div style={{ marginBottom: "15px" }}>
                        <label style={{ display: "block", marginBottom: "5px" }}>Font Family:</label>
                        <select
                            value={localElement.style.fontFamily || "Arial, sans-serif"}
                            onChange={handleFontFamilyChange}
                            style={{
                                width: "100%",
                                padding: "8px",
                                borderRadius: "4px",
                                border: "1px solid #ddd"
                            }}
                        >
                            <option value="Arial, sans-serif">Arial</option>
                            <option value="'Times New Roman', serif">Times New Roman</option>
                            <option value="'Courier New', monospace">Courier New</option>
                            <option value="Georgia, serif">Georgia</option>
                            <option value="Verdana, sans-serif">Verdana</option>
                            <option value="'Comic Sans MS', cursive">Comic Sans</option>
                        </select>
                    </div>

                    <div style={{ marginBottom: "15px" }}>
                        <label style={{ display: "block", marginBottom: "5px" }}>Text Color:</label>
                        <input
                            type="color"
                            value={localElement.style.color || "#000000"}
                            onChange={(e) => updateLocalStyle({ color: e.target.value })}
                            style={{ width: "100%", height: "40px" }}
                        />
                    </div>

                    <div style={{ marginBottom: "15px" }}>
                        <label style={{ display: "block", marginBottom: "5px" }}>Text Style:</label>
                        <div style={{ display: "flex", gap: "10px" }}>
                            <button
                                onClick={() => updateLocalStyle({ 
                                    fontWeight: localElement.style.fontWeight === "bold" ? "normal" : "bold" 
                                })}
                                style={{
                                    padding: "5px 10px",
                                    backgroundColor: localElement.style.fontWeight === "bold" ? "#4285F4" : "#f1f1f1",
                                    color: localElement.style.fontWeight === "bold" ? "white" : "black",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                    fontWeight: "bold"
                                }}
                            >
                                B
                            </button>
                            <button
                                onClick={() => updateLocalStyle({ 
                                    fontStyle: localElement.style.fontStyle === "italic" ? "normal" : "italic" 
                                })}
                                style={{
                                    padding: "5px 10px",
                                    backgroundColor: localElement.style.fontStyle === "italic" ? "#4285F4" : "#f1f1f1",
                                    color: localElement.style.fontStyle === "italic" ? "white" : "black",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                    fontStyle: "italic"
                                }}
                            >
                                I
                            </button>
                            <button
                                onClick={() => updateLocalStyle({ 
                                    textDecoration: localElement.style.textDecoration === "underline" ? "none" : "underline" 
                                })}
                                style={{
                                    padding: "5px 10px",
                                    backgroundColor: localElement.style.textDecoration === "underline" ? "#4285F4" : "#f1f1f1",
                                    color: localElement.style.textDecoration === "underline" ? "white" : "black",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                    textDecoration: "underline"
                                }}
                            >
                                U
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* Image-specific properties */}
            {localElement.type === "image" && (
                <>
                    <div style={{ marginBottom: "15px" }}>
                        <label style={{ display: "block", marginBottom: "5px" }}>Width:</label>
                        <input
                            type="range"
                            min="20"
                            max="800"
                            value={getWidth()}
                            onChange={handleWidthChange}
                            style={{ width: "100%" }}
                        />
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span>20px</span>
                            <span>{getWidth()}px</span>
                            <span>800px</span>
                        </div>
                    </div>

                    <div style={{ marginBottom: "15px" }}>
                        <label style={{ display: "block", marginBottom: "5px" }}>Height:</label>
                        <input
                            type="range"
                            min="20"
                            max="600"
                            value={getHeight()}
                            onChange={handleHeightChange}
                            style={{ width: "100%" }}
                        />
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span>20px</span>
                            <span>{getHeight()}px</span>
                            <span>600px</span>
                        </div>
                    </div>

                    <div style={{ marginBottom: "15px" }}>
                        <label style={{ display: "block", marginBottom: "5px" }}>Quick Resize:</label>
                        <div style={{ display: "flex", gap: "10px" }}>
                            <button 
                                onClick={() => resizeImage(1.2)}
                                style={{
                                    padding: "8px 15px",
                                    backgroundColor: "#4285F4",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: "pointer"
                                }}
                            >
                                Enlarge (20%)
                            </button>
                            <button 
                                onClick={() => resizeImage(0.8)}
                                style={{
                                    padding: "8px 15px",
                                    backgroundColor: "#4285F4",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: "pointer"
                                }}
                            >
                                Reduce (20%)
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* Action buttons */}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "20px" }}>
                <button 
                    onClick={onCancel}
                    style={{
                        padding: "8px 15px",
                        backgroundColor: "#f1f1f1",
                        color: "black",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer"
                    }}
                >
                    Cancel
                </button>
                <button 
                    onClick={saveChanges}
                    style={{
                        padding: "8px 15px",
                        backgroundColor: "#4CAF50",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer"
                    }}
                >
                    Save Changes
                </button>
            </div>
        </div>
    );
};

export default ElementEditor;
