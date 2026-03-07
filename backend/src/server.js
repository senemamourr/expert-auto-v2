// Server principal - Expert Auto Backend

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// ============================================
// ROUTE TEMPORAIRE POUR SETUP DATABASE
// ============================================
app.get('/admin/setup-db', async (req, res) => {
  const pool = require('./config/database');
  const client = await pool.connect();
  
  try {
    let log = [];
    log.push('🚀 Début du setup...\n');

    // Créer bureaux
    await client.query(`
      INSERT INTO bureaux (code, nom_agence, responsable_sinistres, telephone, email, adresse)
      VALUES 
        ('DKR001', 'AXA Dakar Centre', 'Fatou NDIAYE', '+221 77 123 45 67', 'dakar@axa.sn', 'Avenue Senghor, Dakar'),
        ('DKR002', 'NSIA Assurances Plateau', 'Moussa DIOP', '+221 77 234 56 78', 'plateau@nsia.sn', 'Rue de la République, Dakar'),
        ('THI001', 'Allianz Thiès', 'Ibrahima SARR', '+221 77 345 67 89', 'thies@allianz.sn', 'Avenue Lamine Guèye, Thiès')
      ON CONFLICT (code) DO NOTHING
    `);
    log.push('✅ Bureaux créés\n');

    // Récupérer les IDs bureaux
    const bureaux = await client.query('SELECT id, code FROM bureaux');
    const bureau1 = bureaux.rows.find(b => b.code === 'DKR001')?.id;
    const bureau2 = bureaux.rows.find(b => b.code === 'DKR002')?.id;
    const bureau3 = bureaux.rows.find(b => b.code === 'THI001')?.id;

    if (bureau1 && bureau2 && bureau3) {
      // Créer rapports
      await client.query(`
        INSERT INTO rapports (
          numero_ordre_service, numero_sinistre, type_rapport, date_visite,
          bureau_id, statut, vehicule_genre, vehicule_marque, vehicule_modele,
          vehicule_immatriculation, assure_nom, assure_prenom,
          montant_pieces, montant_main_oeuvre, montant_peinture, montant_fournitures, montant_total,
          honoraires_base, honoraires_deplacement, honoraires_total, observations
        ) VALUES 
          (
            'OS-2024-001', 'SIN-2024-12345', 'estimatif_reparation', CURRENT_DATE,
            $1, 'brouillon', 'VP', 'Toyota', 'Corolla', 'DK-1234-AB',
            'DIOP', 'Moussa', 85000, 45000, 20000, 5000, 155000,
            25000, 0, 25000, 'Choc avant gauche'
          ),
          (
            'OS-2024-002', 'SIN-2024-12346', 'valeur_venale', CURRENT_DATE - INTERVAL '2 days',
            $2, 'termine', 'VP', 'Peugeot', '208', 'DK-5678-CD',
            'NDIAYE', 'Fatou', 120000, 80000, 35000, 8000, 243000,
            30000, 5000, 35000, 'Expertise complète'
          ),
          (
            'OS-2024-003', 'SIN-2024-12347', 'estimatif_reparation', CURRENT_DATE - INTERVAL '5 days',
            $3, 'en_cours', 'VU', 'Renault', 'Kangoo', 'DK-9012-EF',
            'SARR', 'Ibrahima', 95000, 55000, 25000, 6000, 181000,
            27000, 3000, 30000, 'Choc latéral droit'
          )
        ON CONFLICT DO NOTHING
      `, [bureau1, bureau2, bureau3]);
      log.push('✅ Rapports créés\n');
    }

    // Vérification
    const counts = await client.query(`
      SELECT 'bureaux' as table_name, COUNT(*) as count FROM bureaux
      UNION ALL SELECT 'rapports', COUNT(*) FROM rapports
    `);
    
    log.push('\n📊 Comptage:\n');
    counts.rows.forEach(row => {
      log.push(`  - ${row.table_name}: ${row.count}\n`);
    });

    log.push('\n✅ SETUP TERMINÉ AVEC SUCCÈS ! 🎉\n');

    client.release();
    res.send('<pre>' + log.join('') + '</pre>');
    
  } catch (error) {
    client.release();
    res.status(500).send('<pre>❌ Erreur: ' + error.message + '</pre>');
  }
});
// ============================================

// Import routes
const authRoutes = require('./routes/auth.routes');
const bureauxRoutes = require('./routes/bureaux.routes');
const rapportsRoutes = require('./routes/rapports.routes');
const statsRoutes = require('./routes/stats.routes');

// Register routes
app.use('/api/auth', authRoutes);
app.use('/api/bureaux', bureauxRoutes);
app.use('/api/rapports', rapportsRoutes);
app.use('/api/stats', statsRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route non trouvée',
    path: req.path
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Erreur:', err);
  res.status(500).json({
    success: false,
    error: 'Erreur serveur',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
