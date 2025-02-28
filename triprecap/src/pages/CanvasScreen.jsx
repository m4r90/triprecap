import React, { useState } from "react";
import DraggableElement from "../components/DraggableElement";
import ElementEditor from "../components/ElementEditor";
import "../styles/CanvasScreen.css";
import { Link } from "react-router-dom";

const CanvasScreen = () => {
    const [elements, setElements] = useState([]);
    const [selectedElement, setSelectedElement] = useState(null);
    const [newText, setNewText] = useState("");
    const [imageUrl, setImageUrl] = useState("");  // Ajouter un état pour l'URL de l'image

    // Fonction pour ajouter du texte
    const addText = () => {
        if (newText.trim()) {
            const newElement = {
                id: Date.now().toString(),
                type: "text",
                content: newText,
                position: { x: 100, y: 100 },
                style: { fontSize: "16px", color: "black", fontWeight: "normal" },
            };
            setElements((prev) => [...prev, newElement]);
            setNewText("");
        }
    };

    // Fonction pour ajouter une image
    const addImage = (e) => {
        const file = e.target.files[0];  // Récupérer le fichier sélectionné
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const imageUrl = reader.result;  // Obtenir l'URL de l'image
                const newElement = {
                    id: Date.now().toString(),
                    type: "image",
                    content: imageUrl,  // Utiliser l'URL de l'image
                    position: { x: 100, y: 100 },
                    style: { width: "100px", height: "100px" },  // Taille par défaut
                };
                setElements((prev) => [...prev, newElement]);
            };
            reader.readAsDataURL(file);  // Lire le fichier comme une URL de données
        }
    };

    // Fonction pour mettre à jour un élément
    const updateElement = (updatedElement) => {
        setElements((prev) =>
            prev.map((el) => (el.id === updatedElement.id ? updatedElement : el))
        );
    };

    // Fonction pour supprimer un élément
    const deleteElement = (id) => {
        setElements((prev) => prev.filter((el) => el.id !== id));
        if (selectedElement?.id === id) setSelectedElement(null);
    };

    return (
        <div className="canvas-container">
            <div className="header">
                <Link to="/" className="back-button">Back</Link>
            </div>

            <div className="sketchbook">
                {elements.map((element) => (
                    <DraggableElement
                        key={element.id}
                        element={element}
                        onUpdate={updateElement}
                        onDelete={() => deleteElement(element.id)}
                        onSelect={() => setSelectedElement(element)}
                        isSelected={selectedElement?.id === element.id}
                    />
                ))}
            </div>

            <div className="toolbar">
                <button onClick={addText}>Add Text</button>
                <label htmlFor="image-upload" className="image-upload-label">
                    Add Image
                </label>
                <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={addImage}  // Appeler la fonction addImage quand un fichier est sélectionné
                    style={{ display: "none" }}  // Cacher l'input de type file
                />
            </div>

            {selectedElement && (
                <ElementEditor element={selectedElement} onUpdate={updateElement} onClose={() => setSelectedElement(null)} />
            )}

            <div className="text-input">
                <input
                    type="text"
                    value={newText}
                    onChange={(e) => setNewText(e.target.value)}
                    placeholder="Enter text"
                />
                <button onClick={addText}>Add Text</button>
            </div>
        </div>
    );
};

export default CanvasScreen;
