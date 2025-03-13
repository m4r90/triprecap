import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/HomeScreen.css";

const HomeScreen = () => {
    const [sketchbooks, setSketchbooks] = useState([]);
    const [recentCanvases, setRecentCanvases] = useState([]);
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null); // Pour stocker l'utilisateur
    const navigate = useNavigate();
    const [deleteSketchbookId, setDeleteSketchbookId] = useState(null);

    useEffect(() => {
        fetchUser();
        fetchSketchbooks();
        fetchRecentCanvases();
    }, []);

    const fetchUser = () => {
        // Récupérer les informations de l'utilisateur depuis localStorage
        const loggedInUser = JSON.parse(localStorage.getItem("user")); // Récupère l'utilisateur
        if (loggedInUser) {
            setUser(loggedInUser);
        } else {
            navigate("/login"); // Si pas d'utilisateur, rediriger vers la page de login
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
            const response = await fetch("http://localhost:5000/api/canvases/recent");
            if (!response.ok) throw new Error("Failed to fetch recent canvases");
            const data = await response.json();
            setRecentCanvases(data);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleLogout = () => {
        // Supprimer le token et l'utilisateur du localStorage
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        navigate("/login"); // Rediriger vers la page de login après déconnexion
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
        return new Date(date).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
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

            // Remove the deleted sketchbook from state
            setSketchbooks(prevSketchbooks => 
                prevSketchbooks.filter(book => book._id !== id)
            );
            setDeleteSketchbookId(null);
        } catch (err) {
            console.error('Delete error:', err);
            alert('Error deleting sketchbook: ' + err.message);
        }
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
                                <button 
                                    className="delete-button"
                                    onClick={() => setDeleteSketchbookId(sketchbook._id)}
                                >
                                    Delete
                                </button>
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
                                <h3>{canvas.title}</h3>
                                <p>Created: {formatDate(canvas.createdAt)}</p>
                                <p>Last edited: {formatDate(canvas.lastModified)}</p>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {deleteSketchbookId && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2>Confirm Delete</h2>
                        <p>Are you sure you want to delete this sketchbook? This action cannot be undone.</p>
                        <div className="modal-buttons">
                            <button 
                                className="cancel-button"
                                onClick={() => setDeleteSketchbookId(null)}
                            >
                                Cancel
                            </button>
                            <button 
                                className="delete-confirm-button"
                                onClick={() => handleDeleteSketchbook(deleteSketchbookId)}
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

export default HomeScreen;
