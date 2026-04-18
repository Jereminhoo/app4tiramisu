const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const verifierToken = require('../middlewares/auth');

// Route pour s'inscrire
router.post('/register', userController.register);

// Route pour se connecter
router.post('/login', userController.login);

// Route protégée — renvoie le profil de l'utilisateur connecté
router.get('/profil', verifierToken, userController.getProfil);

module.exports = router;