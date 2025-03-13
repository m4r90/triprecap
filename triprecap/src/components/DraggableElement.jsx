import React, { useState, useEffect } from "react";

const DraggableElement = ({ 
    element, 
    onUpdate, 
    onDelete, 
    onSelect, 
    isSelected, 
    onEdit, 
    isEditing,
    canvasBounds
}) => {
    const [position, setPosition] = useState(element.position);
    const [isResizing, setIsResizing] = useState(false);

    // Update position when element changes
    useEffect(() => {
        setPosition(element.position);
    }, [element.position]);

    // Constrain position to canvas boundaries
    const constrainPosition = (pos, width, height) => {
        return {
            x: Math.max(0, Math.min(pos.x, canvasBounds.width - width)),
            y: Math.max(0, Math.min(pos.y, canvasBounds.height - height))
        };
    };

    const handleDragStart = (e) => {
        if (isEditing) return; // Prevent dragging while editing
        
        e.preventDefault();
        onSelect(); // Select the element when starting to drag
        
        const offsetX = e.clientX - position.x;
        const offsetY = e.clientY - position.y;

        const handleMouseMove = (e) => {
            const width = parseInt(element.style.width) || 100;
            const height = parseInt(element.style.height) || 100;
            
            const rawPosition = {
                x: e.clientX - offsetX,
                y: e.clientY - offsetY,
            };
            
            // Constrain to canvas boundaries
            const constrainedPosition = constrainPosition(rawPosition, width, height);
            
            setPosition(constrainedPosition);
            onUpdate({ ...element, position: constrainedPosition });
        };

        const handleMouseUp = () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        };

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
    };

    const handleResizeStart = (e) => {
        if (isEditing) return; // Prevent resizing while editing
        
        e.preventDefault();
        e.stopPropagation();
        setIsResizing(true);

        const initialWidth = parseInt(element.style.width) || 100;
        const initialHeight = parseInt(element.style.height) || 100;
        const initialX = e.clientX;
        const initialY = e.clientY;

        const handleMouseMove = (e) => {
            if (isResizing) {
                const newWidth = Math.max(20, initialWidth + (e.clientX - initialX));
                const newHeight = Math.max(20, initialHeight + (e.clientY - initialY));
                
                // Ensure element stays within canvas when resizing
                const constrainedWidth = Math.min(newWidth, canvasBounds.width - position.x);
                const constrainedHeight = Math.min(newHeight, canvasBounds.height - position.y);

                // Make sure to preserve all existing style properties
                const updatedStyle = { 
                    ...element.style,
                    width: `${constrainedWidth}px`, 
                    height: `${constrainedHeight}px` 
                };
                
                onUpdate({ 
                    ...element, 
                    style: updatedStyle
                });
            }
        };

        const handleMouseUp = () => {
            setIsResizing(false);
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        };

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
    };

    // Get element content based on type
    const getElementContent = () => {
        if (element.type === "text") {
            return (
                <div
                    style={{
                        fontSize: element.style.fontSize,
                        color: element.style.color,
                        fontWeight: element.style.fontWeight,
                        fontStyle: element.style.fontStyle,
                        fontFamily: element.style.fontFamily,
                        textDecoration: element.style.textDecoration,
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        userSelect: "none",
                    }}
                >
                    {element.content}
                </div>
            );
        } else if (element.type === "image") {
            return (
                <img
                    src={element.content}
                    alt="User uploaded"
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        userSelect: "none",
                    }}
                />
            );
        }
        return null;
    };

    return (
        <div
            onMouseDown={handleDragStart}
            style={{
                position: "absolute",
                left: `${position.x}px`,
                top: `${position.y}px`,
                width: element.style.width || "100px",
                height: element.style.height || "100px",
                cursor: isEditing ? "default" : "move",
                border: isSelected ? (isEditing ? "2px solid #0066ff" : "2px solid #ff0000") : "none",
                zIndex: isSelected ? 10 : 1,
                boxSizing: "border-box",
                transform: element.style.transform || "none",
            }}
            onClick={() => onSelect && onSelect(element)}
        >
            {getElementContent()}

            {isSelected && !isEditing && (
                <>
                    {/* Delete Button (X) */}
                    <div 
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete && onDelete(element.id);
                        }} 
                        style={{ 
                            position: "absolute", 
                            top: "-10px", 
                            right: "-10px",
                            width: "20px",
                            height: "20px",
                            borderRadius: "50%",
                            backgroundColor: "red",
                            color: "white",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            cursor: "pointer",
                            fontSize: "14px"
                        }}
                    >
                        ✕
                    </div>

                    {/* Edit Button (Pen Icon) - For both text and image elements */}
                    <div 
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit && onEdit(element);
                        }} 
                        style={{ 
                            position: "absolute", 
                            top: "-10px", 
                            left: "-10px",
                            width: "20px",
                            height: "20px",
                            borderRadius: "50%",
                            backgroundColor: "#4285F4",
                            color: "white",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            cursor: "pointer",
                            fontSize: "12px"
                        }}
                    >
                        ✎
                    </div>
                </>
            )}

            {isSelected && !isEditing && (
                <div
                    onMouseDown={handleResizeStart}
                    style={{
                        position: "absolute",
                        bottom: 0,
                        right: 0,
                        width: "16px",
                        height: "16px",
                        backgroundColor: "rgba(0,0,0,0.5)",
                        cursor: "se-resize",
                    }}
                />
            )}
        </div>
    );
};

export default DraggableElement;
