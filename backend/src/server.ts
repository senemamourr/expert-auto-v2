import bureauxRoutes from './routes/bureaux';
app.use('/api/bureaux', bureauxRoutes);
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDatabase } from './config/database';
import { initializeDatabase } from './config/initDb';
import authRoutes from './routes/auth';
import bureauxRoutes from './routes/bureaux';
import rapportsRoutes from './routes/rapports';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/bureaux', bureauxRoutes);
app.use('/api/rapports', rapportsRoutes);

connectDatabase().then(async () => {
  // Initialiser la DB (créer admin si nécessaire)
  await initializeDatabase();
  
  app.listen(PORT, () => {
    console.log('Server running on port ' + PORT);
  });
});
