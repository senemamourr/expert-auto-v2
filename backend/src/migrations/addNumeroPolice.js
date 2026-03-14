// backend/src/migrations/addNumeroPolice.js
const { Sequelize } = require('sequelize');

async function addNumeroPoliceColumn(sequelize) {
  try {
    console.log('🔍 Migration: Vérification colonne numero_police...');
    
    // Vérifier si la colonne existe déjà
    const [results] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'assures' 
      AND column_name = 'numero_police'
    `);
    
    if (results.length > 0) {
      console.log('✅ Migration: Colonne numero_police existe déjà');
      return;
    }
    
    console.log('➕ Migration: Ajout de la colonne numero_police...');
    
    // Ajouter la colonne
    await sequelize.query(`
      ALTER TABLE assures 
      ADD COLUMN numero_police VARCHAR(100)
    `);
    
    console.log('✅ Migration: Colonne numero_police ajoutée avec succès');
  } catch (error) {
    console.error('❌ Migration: Erreur lors de l\'ajout de numero_police:', error.message);
    // Ne pas planter le serveur si la migration échoue
  }
}

module.exports = { addNumeroPoliceColumn };
