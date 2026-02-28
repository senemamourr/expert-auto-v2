import express from 'express';
import {
  getAllBaremes,
  getBaremeById,
  createBareme,
  updateBareme,
  deleteBareme,
  toggleBareme,
} from '../controllers/baremesController';
import { authenticate } from '../middlewares/auth';

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authenticate);

/**
 * GET /api/baremes
 * Récupérer tous les barèmes groupés par type
 * Query params: type, actif
 */
router.get('/', getAllBaremes);

/**
 * GET /api/baremes/:id
 * Récupérer un barème par ID
 */
router.get('/:id', getBaremeById);

/**
 * POST /api/baremes
 * Créer un nouveau barème
 * Body: { type, genreVehicule?, ageVehiculeMin?, ageVehiculeMax?, kmMin?, kmMax?, montantMin?, montantMax?, valeur, unite, actif? }
 */
router.post('/', createBareme);

/**
 * PUT /api/baremes/:id
 * Mettre à jour un barème
 * Body: données à mettre à jour
 */
router.put('/:id', updateBareme);

/**
 * DELETE /api/baremes/:id
 * Supprimer un barème
 */
router.delete('/:id', deleteBareme);

/**
 * PATCH /api/baremes/:id/toggle
 * Activer/désactiver un barème
 */
router.patch('/:id/toggle', toggleBareme);

export default router;
