// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const verifierToken = require('../middlewares/auth');
const isAdmin = require('../middlewares/isAdmin');

// Les deux middlewares s'appliquent à TOUTES les routes admin :
// 1. verifierToken → est-ce que le token est valide ?
// 2. isAdmin → est-ce que le rôle est bien ADMIN ?
router.use(verifierToken, isAdmin);

// ── Commandes ──
router.get('/commandes', adminController.getToutesCommandes);
router.put('/commandes/:id/statut', adminController.changerStatut);

// ── Utilisateurs ──
router.get('/utilisateurs', adminController.getTousUtilisateurs);
router.put('/utilisateurs/:id/bannir', adminController.toggleBannissement);

// ── Catalogue ──
router.post('/tiramisus', adminController.ajouterTiramisu);
router.put('/tiramisus/:id', adminController.modifierTiramisu);
router.delete('/tiramisus/:id', adminController.supprimerTiramisu);

module.exports = router;