import express from 'express';
import {
  getKPIs,
  getRevenusMensuels,
  getRecapHonoraires,
  getStatsByBureau,
  getStatsByType,
  getEvolutionRapports,
  getStatsVehicules
} from '../controllers/statistiquesController';
import { authenticate } from '../middlewares/auth';

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authenticate);

/**
 * GET /api/stats/kpis
 * Indicateurs clés pour le dashboard
 */
router.get('/kpis', getKPIs);

/**
 * GET /api/stats/revenus?annee=2026
 * Revenus mensuels par année
 */
router.get('/revenus', getRevenusMensuels);

/**
 * GET /api/stats/honoraires?type=quinzaine&periode=2026-03
 * Récapitulatif honoraires (quinzaine, mensuel, annuel)
 */
router.get('/honoraires', getRecapHonoraires);

/**
 * GET /api/stats/bureaux
 * Statistiques par bureau/compagnie
 */
router.get('/bureaux', getStatsByBureau);

/**
 * GET /api/stats/types
 * Statistiques par type de rapport
 */
router.get('/types', getStatsByType);

/**
 * GET /api/stats/evolution?periode=mois&nombre=12
 * Évolution des rapports dans le temps
 */
router.get('/evolution', getEvolutionRapports);

/**
 * GET /api/stats/vehicules
 * Top marques et genres de véhicules
 */
router.get('/vehicules', getStatsVehicules);

export default router;
