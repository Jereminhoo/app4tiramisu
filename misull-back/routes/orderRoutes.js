const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

const verifierToken = require('../middlewares/auth'); // On importe le middleware

// verifierToken est placé AVANT createOrder
// Express les exécute dans l'ordre : vérifie le token → si ok → crée la commande
router.post('/create', verifierToken, orderController.createOrder);

module.exports = router;