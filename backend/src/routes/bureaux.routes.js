// Routes API pour les bureaux d'assurances

const express = require('express');
const router = express.Router();
const bureauxController = require('../controllers/bureaux.controller');
const { authenticateToken } = require('../middleware/auth');

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);

// GET /api/bureaux - Liste tous les bureaux
router.get('/', bureauxController.getAllBureaux);

// GET /api/bureaux/:id - Récupère un bureau par ID
router.get('/:id', bureauxController.getBureauById);

// POST /api/bureaux - Créer un nouveau bureau
router.post('/', bureauxController.createBureau);

// PUT /api/bureaux/:id - Modifier un bureau
router.put('/:id', bureauxController.updateBureau);

// DELETE /api/bureaux/:id - Supprimer un bureau
router.delete('/:id', bureauxController.deleteBureau);

module.exports = router;
