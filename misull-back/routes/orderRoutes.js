const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// Quand un client fait un POST sur /api/orders/create, on lance la fonction createOrder
router.post('/create', orderController.createOrder);

module.exports = router;