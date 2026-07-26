const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const verifierToken = require('../middlewares/auth'); // On importe le middleware

// verifierToken est placé AVANT createOrder
// Express les exécute dans l'ordre : vérifie le token → si ok → crée la commande
router.post('/create', verifierToken, orderController.createOrder);

// Voir son historique de commandes
router.get('/historique', verifierToken, orderController.getHistorique);

// Récupère les créneaux de livraison disponibles pour une date donnée
// Ex: GET /api/orders/creneaux?date=2026-08-02
router.get('/creneaux', verifierToken, orderController.getCreneaux);

// Annuler une commande — token requis
// :id est un paramètre dynamique dans l'URL (ex: /api/orders/5/annuler)
router.put('/:id/annuler', verifierToken, orderController.annulerCommande);

// Récupère le statut d'une commande spécifique
router.get('/:id/statut', verifierToken, orderController.getStatut);

module.exports = router;