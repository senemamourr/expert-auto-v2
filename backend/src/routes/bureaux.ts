import { Router } from 'express';
import { bureauxController } from '../controllers/bureauxController';
import { authenticate } from '../middlewares/auth';

const router = Router();

// Toutes les routes nécessitent l'authentification
router.use(authenticate);

// Routes CRUD
router.get('/', bureauxController.getAll);
router.get('/:id', bureauxController.getById);
router.post('/', bureauxController.create);
router.put('/:id', bureauxController.update);
router.delete('/:id', bureauxController.delete);

// Route spéciale pour recherche par code (pour l'autocomplétion)
router.get('/code/:code', bureauxController.getByCode);

export default router;
