import express from 'express';
import Bareme from '../models/Bareme';

const router = express.Router();

/**
 * ROUTE TEMPORAIRE - À SUPPRIMER APRÈS LE SEED
 * POST /api/seed/baremes
 */
router.post('/baremes', async (req, res) => {
  try {
    console.log('🌱 Démarrage du seed des barèmes...');
    
    // Vérifier si des barèmes existent déjà
    const existingBaremes = await Bareme.count();
    
    if (existingBaremes > 0) {
      console.log('⚠️  Des barèmes existent déjà. Suppression...');
      await Bareme.destroy({ where: {}, truncate: true });
    }
    
    // Données des barèmes (valeurs corrigées pour DECIMAL(10,2))
    const baremesData = [
      // TAUX HORAIRES
      { type: 'taux_horaire' as const, genreVehicule: 'VP', valeur: 15000, unite: 'FCFA/heure', actif: true },
      { type: 'taux_horaire' as const, genreVehicule: 'VU', valeur: 18000, unite: 'FCFA/heure', actif: true },
      { type: 'taux_horaire' as const, genreVehicule: 'camion', valeur: 22000, unite: 'FCFA/heure', actif: true },
      { type: 'taux_horaire' as const, genreVehicule: 'moto', valeur: 12000, unite: 'FCFA/heure', actif: true },
      
      // VÉTUSTÉ
      { type: 'vetuste' as const, ageVehiculeMin: 0, ageVehiculeMax: 1, valeur: 10, unite: '%', actif: true },
      { type: 'vetuste' as const, ageVehiculeMin: 1, ageVehiculeMax: 3, valeur: 20, unite: '%', actif: true },
      { type: 'vetuste' as const, ageVehiculeMin: 3, ageVehiculeMax: 5, valeur: 30, unite: '%', actif: true },
      { type: 'vetuste' as const, ageVehiculeMin: 5, ageVehiculeMax: 8, valeur: 40, unite: '%', actif: true },
      { type: 'vetuste' as const, ageVehiculeMin: 8, ageVehiculeMax: 12, valeur: 50, unite: '%', actif: true },
      { type: 'vetuste' as const, ageVehiculeMin: 12, ageVehiculeMax: 100, valeur: 60, unite: '%', actif: true },
      
      // FRAIS DÉPLACEMENT (kmMax corrigé)
      { type: 'deplacement' as const, kmMin: 0, kmMax: 10, valeur: 5000, unite: 'FCFA', actif: true },
      { type: 'deplacement' as const, kmMin: 10, kmMax: 30, valeur: 10000, unite: 'FCFA', actif: true },
      { type: 'deplacement' as const, kmMin: 30, kmMax: 50, valeur: 15000, unite: 'FCFA', actif: true },
      { type: 'deplacement' as const, kmMin: 50, kmMax: 100, valeur: 25000, unite: 'FCFA', actif: true },
      { type: 'deplacement' as const, kmMin: 100, kmMax: 10000, valeur: 500, unite: 'FCFA/km', actif: true },
      
      // HONORAIRES (montantMax corrigé pour DECIMAL(10,2) = max 99999999.99)
      { type: 'honoraire' as const, montantMin: 0, montantMax: 500000, valeur: 25000, unite: 'FCFA', actif: true },
      { type: 'honoraire' as const, montantMin: 500000, montantMax: 1000000, valeur: 40000, unite: 'FCFA', actif: true },
      { type: 'honoraire' as const, montantMin: 1000000, montantMax: 2000000, valeur: 60000, unite: 'FCFA', actif: true },
      { type: 'honoraire' as const, montantMin: 2000000, montantMax: 5000000, valeur: 100000, unite: 'FCFA', actif: true },
      { type: 'honoraire' as const, montantMin: 5000000, montantMax: 50000000, valeur: 150000, unite: 'FCFA', actif: true },
    ];
    
    // Créer les barèmes
    for (const bareme of baremesData) {
      await Bareme.create(bareme);
    }
    
    console.log(`✅ ${baremesData.length} barèmes créés avec succès !`);
    
    res.json({
      success: true,
      message: `${baremesData.length} barèmes créés avec succès`,
      details: {
        taux_horaire: 4,
        vetuste: 6,
        deplacement: 5,
        honoraire: 5,
        total: baremesData.length
      }
    });
  } catch (error: any) {
    console.error('❌ Erreur lors du seed des barèmes:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erreur lors du seed des barèmes',
      details: error.message 
    });
  }
});

export default router;
