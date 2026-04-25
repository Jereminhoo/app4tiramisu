// routes/configRoutes.js
const express = require('express');
const router = express.Router();
const configController = require('../controllers/configController');
const auth = require('../middlewares/auth');
const isAdmin = require('../middlewares/isAdmin');

// GET /api/config — public, le frontend en a besoin
router.get('/', configController.getConfig);

// PUT /api/config — admin uniquement
router.put('/', auth, isAdmin, configController.updateConfig);

module.exports = router;