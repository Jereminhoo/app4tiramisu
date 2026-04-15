const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Route pour s'inscrire
router.post('/register', userController.register);

// Route pour se connecter
router.post('/login', userController.login);

module.exports = router;