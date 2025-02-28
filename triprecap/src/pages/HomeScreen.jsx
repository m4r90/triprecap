import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/HomeScreen.css";

const HomeScreen = () => {
    const [sketchbooks, setSketchbooks] = useState([]);
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null); // Pour stocker l'utilisateur
    const navigate = useNavigate();

    useEffect(() => {
        fetchUser();
        fetchSketchbooks();
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
            if (!response.ok) throw new Error("Failed to fetch data");
            const data = await response.json();
            setSketchbooks(data);
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

            <h1 className="title">My Sketchbooks</h1>
            {error ? (
                <p className="error">Error: {error}</p>
            ) : (
                <div className="sketchbook-list">
                    {sketchbooks.map((item) => (
                        <div key={item._id} className="sketchbook-item">
                            <h2 className="sketchbook-title">{item.title}</h2>
                            <p className="date">Created: {new Date(item.createdAt).toLocaleDateString()}</p>
                        </div>
                    ))}
                </div>
            )}
            <Link to="/canvas" className="new-button">Create New Sketchbook</Link>
        </div>
    );
};

export default HomeScreen;
