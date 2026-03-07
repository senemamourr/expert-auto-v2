// Routes API pour les rapports d'expertise

const express = require('express');
const router = express.Router();
const rapportsController = require('../controllers/rapports.controller');
const { authenticateToken } = require('../middleware/auth');

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);

// GET /api/rapports - Liste tous les rapports (avec pagination et filtres)
router.get('/', rapportsController.getAllRapports);

// GET /api/rapports/:id - Récupère un rapport par ID
router.get('/:id', rapportsController.getRapportById);

// POST /api/rapports - Créer un nouveau rapport
router.post('/', rapportsController.createRapport);

// PUT /api/rapports/:id - Modifier un rapport
router.put('/:id', rapportsController.updateRapport);

// DELETE /api/rapports/:id - Supprimer un rapport
router.delete('/:id', rapportsController.deleteRapport);

module.exports = router;
