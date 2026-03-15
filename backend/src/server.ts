import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDatabase } from './config/database';
import { initializeDatabase } from './config/initDb';
import { Sequelize, QueryTypes } from 'sequelize';
import authRoutes from './routes/auth';
import bureauxRoutes from './routes/bureaux';
import rapportsRoutes from './routes/rapports';
import baremesRoutes from './routes/baremes';
import statistiquesRoutes from './routes/statistiques';
import seedRoute from './routes/seedRoute';
import debugRoutes from './routes/debug.routes';
import './models/relations';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/bureaux', bureauxRoutes);
app.use('/api/rapports', rapportsRoutes);
app.use('/api/baremes', baremesRoutes);
app.use('/api/stats', statistiquesRoutes);
app.use('/api/seed', seedRoute);
app.use('/api/debug', debugRoutes);

// Migration pour ajouter la colonne numero_police
async function addNumeroPoliceColumn(sequelize: Sequelize): Promise<void> {
  try {
    console.log('🔍 Migration: Vérification colonne numero_police...');
    
    const [results] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'assures' 
      AND column_name = 'numero_police'
    `, { type: QueryTypes.SELECT });
    
    if (results && (results as any).column_name) {
      console.log('✅ Migration: Colonne numero_police existe déjà');
    } else {
      console.log('➕ Migration: Ajout de la colonne numero_police...');
      
      await sequelize.query(`
        ALTER TABLE assures 
        ADD COLUMN numero_police VARCHAR(100)
      `);
      
      console.log('✅ Migration: Colonne numero_police ajoutée avec succès');
    }
  } catch (error: any) {
    console.error('❌ Migration numero_police: Erreur:', error.message);
  }
}

// Migration pour augmenter la taille des VARCHAR trop courts
async function fixVarcharLimits(sequelize: Sequelize): Promise<void> {
  try {
    console.log('🔍 Migration: Correction des limites VARCHAR...');
    
    // Augmenter telephone à VARCHAR(50)
    await sequelize.query(`
      ALTER TABLE assures 
      ALTER COLUMN telephone TYPE VARCHAR(50)
    `).catch(() => {});
    
    // Augmenter immatriculation à VARCHAR(50)
    await sequelize.query(`
      ALTER TABLE vehicules 
      ALTER COLUMN immatriculation TYPE VARCHAR(50)
    `).catch(() => {});
    
    // NOTE: numero_chassis reste VARCHAR(17) - norme VIN internationale
    
    console.log('✅ Migration: Limites VARCHAR corrigées');
  } catch (error: any) {
    console.error('❌ Migration VARCHAR: Erreur:', error.message);
  }
}

// Démarrage du serveur
connectDatabase().then(async () => {
  const db = require('./config/database');
  await addNumeroPoliceColumn(db.sequelize);
  await fixVarcharLimits(db.sequelize);
  await initializeDatabase();
  
  app.listen(PORT, () => {
    console.log('Server running on port ' + PORT);
  });
}).catch((error) => {
  console.error('❌ Database connection error:', error);
  process.exit(1);
});
