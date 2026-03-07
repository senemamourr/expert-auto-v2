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
// Ajouter temporairement dans server.js
app.get('/setup-db', async (req, res) => {
  try {
    const { execSync } = require('child_process');
    const output = execSync('node src/scripts/setup-database.js').toString();
    res.send('<pre>' + output + '</pre>');
  } catch (error) {
    res.status(500).send(error.message);
  }
});
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
