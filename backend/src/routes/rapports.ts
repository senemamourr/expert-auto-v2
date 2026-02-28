import express from 'express';
import {
  getAllRapports,
  getRapportById,
  createRapport,
  updateRapport,
  deleteRapport,
  getRapportsBySinistre,
  recalculateRapport,
} from '../controllers/rapportsController';
import { authenticate } from '../middlewares/auth';

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authenticate);

/**
 * GET /api/rapports
 * Récupérer tous les rapports avec pagination et filtres
 * Query params: page, limit, statut, typeRapport, bureauId, numeroSinistre
 */
router.get('/', getAllRapports);

/**
 * GET /api/rapports/sinistre/:numeroSinistre
 * Rechercher des rapports par numéro de sinistre
 */
router.get('/sinistre/:numeroSinistre', getRapportsBySinistre);

/**
 * GET /api/rapports/:id
 * Récupérer un rapport par ID avec toutes ses relations
 */
router.get('/:id', getRapportById);

/**
 * POST /api/rapports
 * Créer un nouveau rapport
 * Body: { typeRapport, numeroOrdreService, bureauId, numeroSinistre, dateSinistre, dateVisite, vehicule, assure, chocs, honoraire }
 */
router.post('/', createRapport);

/**
 * PUT /api/rapports/:id
 * Mettre à jour un rapport
 * Body: données à mettre à jour
 */
router.put('/:id', updateRapport);

/**
 * DELETE /api/rapports/:id
 * Supprimer un rapport (avec cascade)
 */
router.delete('/:id', deleteRapport);

/**
 * POST /api/rapports/:id/calculate
 * Recalculer les totaux d'un rapport
 */
router.post('/:id/calculate', recalculateRapport);

export default router;
