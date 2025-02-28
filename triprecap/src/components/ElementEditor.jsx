import React, { useState } from "react";

const ElementEditor = ({ element, onUpdate, onClose }) => {
    if (!element) return null;

    const [newWidth, setNewWidth] = useState(parseFloat(element.style.width));
    const [newHeight, setNewHeight] = useState(parseFloat(element.style.height));

    // Fonction pour valider la largeur et la hauteur
    const validateSize = (value) => {
        const parsedValue = parseFloat(value);
        return !isNaN(parsedValue) && parsedValue > 0 ? parsedValue : 100; // Valeur par défaut si invalidité
    };

    // Mise à jour du style de l'élément
    const updateStyle = (updates) => {
        onUpdate({
            ...element,
            style: { ...element.style, ...updates },
        });
    };

    // Agrandir ou réduire l'image
    const resizeImage = (factor) => {
        const updatedWidth = validateSize(newWidth * factor);
        const updatedHeight = validateSize(newHeight * factor);
        setNewWidth(updatedWidth);
        setNewHeight(updatedHeight);
        updateStyle({ width: updatedWidth, height: updatedHeight });
    };

    // Changement manuel des tailles via input
    const handleWidthChange = (e) => {
        const width = validateSize(e.target.value);
        setNewWidth(width);
        updateStyle({ width });
    };

    const handleHeightChange = (e) => {
        const height = validateSize(e.target.value);
        setNewHeight(height);
        updateStyle({ height });
    };

    return (
        <div style={{ position: "absolute", bottom: 0, background: "white", padding: "10px", width: "100%" }}>
            <button onClick={onClose}>Fermer</button>

            {element.type === "text" && (
                <>
                    <p>Couleur :</p>
                    {["black", "red", "blue", "green", "purple"].map((color) => (
                        <button
                            key={color}
                            style={{ backgroundColor: color }}
                            onClick={() => updateStyle({ color })}
                        >
                            {color}
                        </button>
                    ))}
                    <button onClick={() => updateStyle({ fontWeight: element.style.fontWeight === "bold" ? "normal" : "bold" })}>
                        Gras
                    </button>
                </>
            )}

            {element.type === "image" && (
                <>
                    <div>
                        <p>Taille de l'image :</p>
                        <label>
                            Largeur:
                            <input
                                type="number"
                                value={newWidth}
                                onChange={handleWidthChange}
                                min="1"
                            />
                        </label>
                        <label>
                            Hauteur:
                            <input
                                type="number"
                                value={newHeight}
                                onChange={handleHeightChange}
                                min="1"
                            />
                        </label>
                    </div>
                    <button onClick={() => resizeImage(1.2)}>Agrandir</button>
                    <button onClick={() => resizeImage(0.8)}>Réduire</button>


                </>
            )}
        </div>
    );
};

export default ElementEditor;
