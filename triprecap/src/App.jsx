import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import HomeScreen from "./pages/HomeScreen";
import CanvasScreen from "./pages/CanvasScreen";
import LoginPage from "./pages/LoginPage";  // Page de connexion
import RegisterPage from "./pages/RegisterPage";  // Page d'inscription
import SketchbookPage from "./pages/SketchbookPage";
import './styles/common.css';

const App = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Vérifier si un token d'authentification existe dans localStorage
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            setIsAuthenticated(true);
        }
    }, []);

    // Fonction de gestion de la déconnexion
    const handleLogout = () => {
        localStorage.removeItem('authToken');
        setIsAuthenticated(false);
    };

    return (
        <Router>
            <Routes>
                {/* Page d'accueil redirigeant vers la page de login si non connecté */}
                <Route path="/" element={isAuthenticated ? <Navigate to="/home" /> : <Navigate to="/login" />} />

                {/* Page d'accueil */}
                <Route path="/home" element={isAuthenticated ? <HomeScreen onLogout={handleLogout} /> : <Navigate to="/login" />} />

                {/* Page de canvas, accessible après login */}
                <Route path="/canvas/:canvasId?" element={isAuthenticated ? <CanvasScreen /> : <Navigate to="/login" />} />

                {/* Page de connexion */}
                <Route path="/login" element={<LoginPage onLogin={() => setIsAuthenticated(true)} />} />

                {/* Page d'inscription */}
                <Route path="/register" element={<RegisterPage />} />

                {/* Page de sketchbook, accessible après login */}
                <Route path="/sketchbook/:id" element={isAuthenticated ? <SketchbookPage /> : <Navigate to="/login" />} />
            </Routes>
        </Router>

    );
};

export default App;
