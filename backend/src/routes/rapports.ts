import { Router } from 'express';
const router = Router();
router.get('/', (req, res) => res.json({ rapports: [] }));
router.post('/', (req, res) => res.json({ rapport: req.body }));
export default router;
