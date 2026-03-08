import { Router } from 'express';
import { getSchema } from '../controllers/debugController';

const router = Router();

// GET /debug/schema - Voir la structure des tables
router.get('/schema', getSchema);

export default router;
