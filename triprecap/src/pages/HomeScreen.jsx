import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/HomeScreen.css";
import SketchbookMap from "../components/SketchbookMap";

const HomeScreen = () => {
    const [sketchbooks, setSketchbooks] = useState([]);
    const [canvases, setCanvases] = useState([]);
    const [recentCanvases, setRecentCanvases] = useState([]);
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    const [deleteSketchbookId, setDeleteSketchbookId] = useState(null);
    const [showMap, setShowMap] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUser();
        fetchSketchbooks();
        fetchCanvases();
        fetchRecentCanvases();
    }, []);

    const fetchUser = () => {
        const loggedInUser = JSON.parse(localStorage.getItem("user"));
        if (loggedInUser) {
            setUser(loggedInUser);
        } else {
            navigate("/login");
        }
    };

    const fetchSketchbooks = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/sketchbooks");
            if (!response.ok) throw new Error("Failed to fetch sketchbooks");
            const data = await response.json();
            setSketchbooks(data);
        } catch (err) {
            setError(err.message);
        }
    };

    const fetchRecentCanvases = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/sketchbooks/canvases/recent?limit=4");
            if (!response.ok) throw new Error("Failed to fetch recent canvases");
            const data = await response.json();
            setRecentCanvases(data);
        } catch (err) {
            console.error('Error fetching recent canvases:', err);
        }
    };

    const fetchCanvases = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:5000/api/sketchbooks');
            
            if (!response.ok) {
                throw new Error('Failed to fetch canvases');
            }
            
            const sketchbooks = await response.json();
            
            let allCanvases = [];
            sketchbooks.forEach(sketchbook => {
                if (sketchbook.canvases && sketchbook.canvases.length > 0) {
                    sketchbook.canvases.forEach(canvas => {
                        allCanvases.push({
                            ...canvas,
                            sketchbookId: sketchbook._id
                        });
                    });
                }
            });
            
            setCanvases(allCanvases);
            
            if (recentCanvases.length === 0) {
                const sortedCanvases = [...allCanvases].sort((a, b) => {
                    const dateA = a.lastModified ? new Date(a.lastModified) : new Date(a.createdAt || 0);
                    const dateB = b.lastModified ? new Date(b.lastModified) : new Date(b.createdAt || 0);
                    return dateB - dateA;
                });
                
                setRecentCanvases(sortedCanvases.slice(0, 4));
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching canvases:', error);
            setError(error.message);
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        navigate("/login");
    };

    const createNewSketchbook = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/sketchbooks", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title: 'New Sketchbook' }),
            });
            if (!response.ok) throw new Error("Failed to create sketchbook");
            const newSketchbook = await response.json();
            navigate(`/sketchbook/${newSketchbook._id}`);
        } catch (err) {
            setError(err.message);
        }
    };

    const formatDate = (date) => {
        if (!date) return 'Unknown date';
        const formattedDate = new Date(date).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        return formattedDate;
    };

    const handleDeleteSketchbook = async (id) => {
        try {
            console.log('Attempting to delete sketchbook:', id);
            const response = await fetch(`http://localhost:5000/api/sketchbooks/${id}`, {
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
                    throw new Error(errorData.error || 'Failed to delete sketchbook');
                } else {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
            }

            setSketchbooks(prevSketchbooks => 
                prevSketchbooks.filter(book => book._id !== id)
            );
            setDeleteSketchbookId(null);
        } catch (err) {
            console.error('Delete error:', err);
            alert('Error deleting sketchbook: ' + err.message);
        }
    };

    const handleShowMap = (sketchbook) => {
        setShowMap(sketchbook);
    };

    return (
        <div className="container">
            <div className="user-info">
                {user && (
                    <>
                        <div className="user-avatar">
                            <img src={user.avatar || "https://via.placeholder.com/40"} alt="User Avatar" />
                        </div>
                        <span className="user-name">{user.username}</span>
                        <button onClick={handleLogout} className="logout-button">Logout</button>
                    </>
                )}
            </div>

            <div className="content-section">
                <div className="sketchbooks-section">
                    <div className="section-header">
                        <h2>My Sketchbooks</h2>
                        <button onClick={createNewSketchbook} className="new-button">
                            New Sketchbook
                        </button>
                    </div>
                    <div className="sketchbook-grid">
                        {sketchbooks.map((sketchbook) => (
                            <div key={sketchbook._id} className="sketchbook-card">
                                <Link 
                                    to={`/sketchbook/${sketchbook._id}`}
                                    className="sketchbook-content"
                                >
                                    <h3>{sketchbook.title}</h3>
                                    <p>{sketchbook.canvases.length} canvases</p>
                                    <p>Created: {formatDate(sketchbook.createdAt)}</p>
                                    <p>Last modified: {formatDate(sketchbook.lastModified)}</p>
                                </Link>

                                <div className="sketchbook-actions">
                                    <button 
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleShowMap(sketchbook);
                                        }} 
                                        className="map-button"
                                    >
                                        View Map
                                    </button>
                                    <button 
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setDeleteSketchbookId(sketchbook._id);
                                        }}
                                        className="delete-button"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="recent-canvases-section">
                    <h2>Recent Canvases</h2>
                    <div className="canvas-grid">
                        {recentCanvases.map((canvas) => (
                            <Link 
                                to={`/canvas/${canvas._id}`} 
                                key={canvas._id} 
                                className="canvas-card"
                            >
                                <h3>{canvas.title || "Untitled Canvas"}</h3>
                                <div className="canvas-preview">
                                    {canvas.elements && canvas.elements.length > 0 && (
                                        <div className="preview-content">
                                            {canvas.elements.some(el => el.type === 'image') ? (
                                                <div className="has-image">
                                                    <i className="icon-image">🖼️</i>
                                                </div>
                                            ) : (
                                                <div className="no-image">
                                                    <i className="icon-text">📝</i>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className="canvas-meta">
                                    <span className="elements-count">
                                        <i className="icon-elements">📋</i>
                                        {canvas.elements ? canvas.elements.length : 0} elements
                                    </span>
                                </div>
                                <time className="canvas-date">
                                    Edited: {formatDate(canvas.lastModified || canvas.createdAt)}
                                </time>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {showMap && (
                <div className="modal-overlay">
                    <div className="modal map-modal">
                        <h2>{showMap.title} - Photo Locations</h2>
                        <SketchbookMap canvases={showMap.canvases} />
                        <div className="modal-buttons">
                            <button 
                                className="close-button"
                                onClick={() => setShowMap(null)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {deleteSketchbookId && (
                <div className="modal-overlay">
                    <div className="modal delete-modal">
                        <h2>Confirm Deletion</h2>
                        <p>Are you sure you want to delete this sketchbook? This action cannot be undone.</p>
                        <div className="modal-buttons">
                            <button 
                                className="delete-confirm-button"
                                onClick={() => handleDeleteSketchbook(deleteSketchbookId)}
                            >
                                Delete
                            </button>
                            <button 
                                className="cancel-button"
                                onClick={() => setDeleteSketchbookId(null)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HomeScreen;
