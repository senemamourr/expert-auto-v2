import { Router } from 'express';
import {
  getRapports,
  getRapportById,
  createRapport,
  updateRapport,
  deleteRapport
} from '../controllers/rapportsController';

const router = Router();

// Routes CRUD rapports
router.get('/', getRapports);
router.get('/:id', getRapportById);
router.post('/', createRapport);
router.put('/:id', updateRapport);
router.delete('/:id', deleteRapport);

export default router;
