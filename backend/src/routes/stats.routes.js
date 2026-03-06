// Routes API pour les statistiques

const express = require('express');
const router = express.Router();
const statsController = require('../controllers/stats.controller');
const { authenticateToken } = require('../middleware/auth');

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);

// GET /api/stats/kpis - KPIs principaux
router.get('/kpis', statsController.getKPIs);

// GET /api/stats/revenus - Revenus mensuels
router.get('/revenus', statsController.getRevenus);

// GET /api/stats/recap-honoraires - Récapitulatif honoraires
router.get('/recap-honoraires', statsController.getRecapHonoraires);

// GET /api/stats/bureaux - Stats par bureau
router.get('/bureaux', statsController.getStatsBureaux);

// GET /api/stats/types - Stats par type
router.get('/types', statsController.getStatsTypes);

// GET /api/stats/evolution - Évolution rapports
router.get('/evolution', statsController.getEvolution);

// GET /api/stats/vehicules - Stats véhicules
router.get('/vehicules', statsController.getStatsVehicules);

module.exports = router;
