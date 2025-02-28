const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Route pour l'inscription
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const user = new User({ username, email, password });
    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({ token });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Route pour la connexion (GET)
router.get('/login', async (req, res) => {
  const { email, password } = req.query;  // Récupérer email et password via les query params

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Comparaison du mot de passe en clair
    if (user.password !== password) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Ici, on renvoie les informations utilisateur (en excluant le mot de passe)
    const { password: _, ...userInfo } = user.toObject(); // Exclure le mot de passe
    res.status(200).json({ success: true, user: userInfo }); // Envoyer les infos utilisateur

  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;
