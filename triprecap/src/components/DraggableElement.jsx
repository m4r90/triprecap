import React, { useState, useEffect } from "react";

const DraggableElement = ({ element, onUpdate, onDelete, onSelect, isSelected }) => {
    const [position, setPosition] = useState(element.position);
    const [size, setSize] = useState(element.style); // Gérer la taille de l'élément
    const [isResizing, setIsResizing] = useState(false);

    useEffect(() => {
        // Synchroniser la taille avec l'élément si elle change dans le parent
        setSize(element.style);
    }, [element.style]);

    const handleDragStart = (e) => {
        e.preventDefault();
        const offsetX = e.clientX - position.x;
        const offsetY = e.clientY - position.y;

        const handleMouseMove = (e) => {
            const newPosition = {
                x: e.clientX - offsetX,
                y: e.clientY - offsetY,
            };
            setPosition(newPosition);
            onUpdate({ ...element, position: newPosition });
        };

        const handleMouseUp = () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        };

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
    };

    const handleResizeStart = (e) => {
        e.preventDefault();
        setIsResizing(true);

        const initialWidth = size.width;
        const initialHeight = size.height;
        const initialX = e.clientX;
        const initialY = e.clientY;

        const handleMouseMove = (e) => {
            if (isResizing) {
                const newWidth = initialWidth + (e.clientX - initialX);
                const newHeight = initialHeight + (e.clientY - initialY);

                setSize({ width: newWidth, height: newHeight });
                onUpdate({ ...element, style: { width: newWidth + "px", height: newHeight + "px" } });
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

    return (
        <div
            className={`draggable-element ${isSelected ? "selected" : ""}`}
            onClick={onSelect}
            onMouseDown={handleDragStart}
            style={{
                position: "absolute",
                left: position.x,
                top: position.y,
                cursor: "move",
                zIndex: isSelected ? 10 : 1,
                width: size.width,
                height: size.height,
            }}
        >
            {element.type === "text" && (
                <div style={{ ...element.style, width: size.width, height: size.height }}>
                    {element.content}
                </div>
            )}
            {element.type === "image" && (
                <img src={element.content} alt="Uploaded" style={{ width: size.width, height: size.height }} />
            )}

            <button onClick={onDelete} style={{ position: "absolute", top: 0, right: 0 }}>
                Delete
            </button>

            {isSelected && (
                <div
                    onMouseDown={handleResizeStart}
                    style={{
                        position: "absolute",
                        bottom: 0,
                        right: 0,
                        width: "16px",
                        height: "16px",
                        backgroundColor: "rgba(0,0,0,0.5)",
                        cursor: "se-resize",  // Indicateur de redimensionnement
                    }}
                />
            )}
        </div>
    );
};

export default DraggableElement;
