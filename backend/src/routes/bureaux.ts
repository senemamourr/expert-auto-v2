import { Router } from 'express';
const router = Router();
router.get('/', (req, res) => res.json({ bureaux: [] }));
router.post('/', (req, res) => res.json({ bureau: req.body }));
export default router;
