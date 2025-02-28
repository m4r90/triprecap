import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import '../styles/LoginPage.css';  // Import du fichier CSS

const LoginPage = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const response = await axios.get('http://localhost:5000/api/users/login', {
                params: { email, password },
            });

            if (response.data.success) {
                const user = response.data.user; // Supposons que les données utilisateur sont dans response.data.user
                localStorage.setItem('authToken', response.data.token); // Sauvegarde le token
                localStorage.setItem('user', JSON.stringify(user)); // Sauvegarde l'utilisateur dans localStorage
                onLogin();
                navigate('/home');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError(err.response ? err.response.data.message : 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    required
                />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    required
                />
                {error && <p className="error">{error}</p>}
                <button type="submit" disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </form>
            <p>Don't have an account? <Link to="/register">Register here</Link></p>
        </div>
    );
};

export default LoginPage;
