import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDatabase } from './config/database';
import { initializeDatabase } from './config/initDb';
import authRoutes from './routes/auth';
import bureauxRoutes from './routes/bureaux';
import rapportsRoutes from './routes/rapports';
import baremesRoutes from './routes/baremes';
import seedRoute from './routes/seedRoute';
import './models/relations';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/bureaux', bureauxRoutes);
app.use('/api/rapports', rapportsRoutes);
app.use('/api/baremes', baremesRoutes);
app.use('/api/seed', seedRoute);

connectDatabase().then(async () => {
  await initializeDatabase();
  
  app.listen(PORT, () => {
    console.log('Server running on port ' + PORT);
  });
});
