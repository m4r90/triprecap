import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import "../styles/SketchbookPage.css";

const SketchbookPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [sketchbook, setSketchbook] = useState(null);
    const [error, setError] = useState(null);
    const [deleteCanvasId, setDeleteCanvasId] = useState(null);

    useEffect(() => {
        fetchSketchbook();
    }, [id]);
    

    const fetchSketchbook = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/sketchbooks/${id}`);
            if (!response.ok) throw new Error("Failed to fetch sketchbook");
            const data = await response.json();
            setSketchbook(data);
        } catch (err) {
            setError(err.message);
        }
    };

    const createNewCanvas = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/sketchbooks/${id}/canvases`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title: 'New Canvas' }),
            });
            if (!response.ok) throw new Error("Failed to create canvas");
            const newCanvas = await response.json();
            navigate(`/canvas/${newCanvas._id}`);
        } catch (err) {
            setError(err.message);
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleDeleteCanvas = async (canvasId) => {
        try {
            console.log('Attempting to delete canvas:', canvasId, 'from sketchbook:', id);
            const response = await fetch(`http://localhost:5000/api/sketchbooks/${id}/canvases/${canvasId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            const contentType = response.headers.get("content-type");
            if (!response.ok) {
                if (contentType && contentType.indexOf("application/json") !== -1) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to delete canvas');
                } else {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
            }

            // Update local state after successful deletion
            setSketchbook(prevSketchbook => ({
                ...prevSketchbook,
                canvases: prevSketchbook.canvases.filter(canvas => canvas._id !== canvasId)
            }));
            setDeleteCanvasId(null);
        } catch (err) {
            console.error('Delete error:', err);
            alert('Error deleting canvas: ' + err.message);
        }
    };

    return (
        <div className="sketchbook-page">
            <div className="header">
                <Link to="/" className="back-button">Back to Home</Link>
                <div className="sketchbook-info">
                    <h1>{sketchbook?.title || 'Loading...'}</h1>
                    {sketchbook && (
                        <div className="timestamps">
                            <p>Created: {formatDate(sketchbook.createdAt)}</p>
                            <p>Last modified: {formatDate(sketchbook.lastModified)}</p>
                        </div>
                    )}
                </div>
                <button onClick={createNewCanvas} className="new-canvas-button">
                    New Canvas
                </button>
            </div>

            {error && <p className="error">{error}</p>}

            <div className="canvas-grid">
                {sketchbook?.canvases.map(canvas => (
                    <div key={canvas._id} className="canvas-card">
                        <h3>{canvas.title}</h3>
                        <p>Created: {formatDate(canvas.createdAt)}</p>
                        <p>Last edited: {formatDate(canvas.lastModified)}</p>
                        <div className="canvas-actions">
                            <Link to={`/canvas/${canvas._id}`} className="edit-button">
                                Edit Canvas
                            </Link>
                            <button 
                                className="delete-button"
                                onClick={() => setDeleteCanvasId(canvas._id)}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {deleteCanvasId && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2>Confirm Delete</h2>
                        <p>Are you sure you want to delete this canvas? This action cannot be undone.</p>
                        <div className="modal-buttons">
                            <button 
                                className="cancel-button"
                                onClick={() => setDeleteCanvasId(null)}
                            >
                                Cancel
                            </button>
                            <button 
                                className="delete-confirm-button"
                                onClick={() => handleDeleteCanvas(deleteCanvasId)}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SketchbookPage; 