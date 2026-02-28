import { Request, Response } from 'express';
import Bareme from '../models/Bareme';

/**
 * Controller pour la gestion des barèmes
 */

/**
 * Récupérer tous les barèmes
 */
export const getAllBaremes = async (req: Request, res: Response) => {
  try {
    const { type, actif } = req.query;

    const where: any = {};
    
    if (type) where.type = type;
    if (actif !== undefined) where.actif = actif === 'true';

    const baremes = await Bareme.findAll({
      where,
      order: [
        ['type', 'ASC'],
        ['genreVehicule', 'ASC'],
        ['ageVehiculeMin', 'ASC'],
        ['kmMin', 'ASC'],
        ['montantMin', 'ASC'],
      ],
    });

    // Grouper les barèmes par type
    const baremesGroupes = {
      taux_horaire: baremes.filter(b => b.type === 'taux_horaire'),
      vetuste: baremes.filter(b => b.type === 'vetuste'),
      deplacement: baremes.filter(b => b.type === 'deplacement'),
      honoraire: baremes.filter(b => b.type === 'honoraire'),
    };

    res.json({ 
      baremes: baremesGroupes,
      total: baremes.length 
    });
  } catch (error: any) {
    console.error('Erreur getAllBaremes:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la récupération des barèmes',
      details: error.message 
    });
  }
};

/**
 * Récupérer un barème par ID
 */
export const getBaremeById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const bareme = await Bareme.findByPk(id);

    if (!bareme) {
      return res.status(404).json({ error: 'Barème non trouvé' });
    }

    res.json({ bareme });
  } catch (error: any) {
    console.error('Erreur getBaremeById:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la récupération du barème',
      details: error.message 
    });
  }
};

/**
 * Créer un nouveau barème
 */
export const createBareme = async (req: Request, res: Response) => {
  try {
    const baremeData = req.body;

    // Validation des données requises
    if (!baremeData.type || !baremeData.valeur || !baremeData.unite) {
      return res.status(400).json({ 
        error: 'Données manquantes',
        required: ['type', 'valeur', 'unite']
      });
    }

    const bareme = await Bareme.create(baremeData);

    res.status(201).json({ 
      bareme,
      message: 'Barème créé avec succès'
    });
  } catch (error: any) {
    console.error('Erreur createBareme:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la création du barème',
      details: error.message 
    });
  }
};

/**
 * Mettre à jour un barème
 */
export const updateBareme = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const bareme = await Bareme.findByPk(id);

    if (!bareme) {
      return res.status(404).json({ error: 'Barème non trouvé' });
    }

    await bareme.update(updates);

    res.json({ 
      bareme,
      message: 'Barème mis à jour avec succès'
    });
  } catch (error: any) {
    console.error('Erreur updateBareme:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la mise à jour du barème',
      details: error.message 
    });
  }
};

/**
 * Supprimer un barème
 */
export const deleteBareme = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const bareme = await Bareme.findByPk(id);

    if (!bareme) {
      return res.status(404).json({ error: 'Barème non trouvé' });
    }

    await bareme.destroy();

    res.json({ message: 'Barème supprimé avec succès' });
  } catch (error: any) {
    console.error('Erreur deleteBareme:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la suppression du barème',
      details: error.message 
    });
  }
};

/**
 * Activer/désactiver un barème
 */
export const toggleBareme = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const bareme = await Bareme.findByPk(id);

    if (!bareme) {
      return res.status(404).json({ error: 'Barème non trouvé' });
    }

    await bareme.update({ actif: !bareme.actif });

    res.json({ 
      bareme,
      message: `Barème ${bareme.actif ? 'activé' : 'désactivé'} avec succès`
    });
  } catch (error: any) {
    console.error('Erreur toggleBareme:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la modification du barème',
      details: error.message 
    });
  }
};
