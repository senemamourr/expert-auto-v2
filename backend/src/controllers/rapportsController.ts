import { Request, Response } from 'express';
import Rapport from '../models/Rapport';
import Vehicule from '../models/Vehicule';
import Assure from '../models/Assure';
import Choc from '../models/Choc';
import Fourniture from '../models/Fourniture';
import Honoraire from '../models/Honoraire';
import Bureau from '../models/Bureau';
import User from '../models/User';
import { calculateTauxHoraire, calculateVetuste, calculateFraisDeplacement, calculateHonoraires } from '../services/calculService';

/**
 * Controller pour la gestion des rapports d'expertise
 */

/**
 * Récupérer tous les rapports avec pagination et filtres
 */
export const getAllRapports = async (req: Request, res: Response) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      statut, 
      typeRapport, 
      bureauId,
      numeroSinistre 
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);
    
    const where: any = {};
    
    if (statut) where.statut = statut;
    if (typeRapport) where.typeRapport = typeRapport;
    if (bureauId) where.bureauId = bureauId;
    if (numeroSinistre) where.numeroSinistre = numeroSinistre;

    const { count, rows: rapports } = await Rapport.findAndCountAll({
      where,
      limit: Number(limit),
      offset,
      include: [
        {
          model: Bureau,
          as: 'bureau',
          attributes: ['id', 'code', 'nomAgence'],
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'nom', 'prenom', 'email'],
        },
        {
          model: Vehicule,
          as: 'vehicule',
          attributes: ['marque', 'type', 'immatriculation'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json({
      rapports,
      pagination: {
        total: count,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(count / Number(limit)),
      },
    });
  } catch (error: any) {
    console.error('Erreur getAllRapports:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la récupération des rapports',
      details: error.message 
    });
  }
};

/**
 * Récupérer un rapport par ID avec toutes ses relations
 */
export const getRapportById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const rapport = await Rapport.findByPk(id, {
      include: [
        {
          model: Bureau,
          as: 'bureau',
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'nom', 'prenom', 'email'],
        },
        {
          model: Vehicule,
          as: 'vehicule',
        },
        {
          model: Assure,
          as: 'assure',
        },
        {
          model: Choc,
          as: 'chocs',
          include: [
            {
              model: Fourniture,
              as: 'fournitures',
            },
          ],
        },
        {
          model: Honoraire,
          as: 'honoraire',
        },
      ],
    });

    if (!rapport) {
      return res.status(404).json({ error: 'Rapport non trouvé' });
    }

    res.json({ rapport });
  } catch (error: any) {
    console.error('Erreur getRapportById:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la récupération du rapport',
      details: error.message 
    });
  }
};

/**
 * Créer un nouveau rapport
 */
export const createRapport = async (req: Request, res: Response) => {
  try {
    const {
      typeRapport,
      numeroOrdreService,
      bureauId,
      numeroSinistre,
      dateSinistre,
      dateVisite,
      vehicule,
      assure,
      chocs,
      honoraire,
    } = req.body;

    // Récupérer l'utilisateur connecté depuis le middleware auth
    const userId = (req as any).user.id;

    // Validation des données requises
    if (!typeRapport || !numeroOrdreService || !bureauId || !numeroSinistre || !dateSinistre) {
      return res.status(400).json({ 
        error: 'Données manquantes',
        required: ['typeRapport', 'numeroOrdreService', 'bureauId', 'numeroSinistre', 'dateSinistre']
      });
    }

    // Vérifier que le bureau existe
    const bureau = await Bureau.findByPk(bureauId);
    if (!bureau) {
      return res.status(404).json({ error: 'Bureau non trouvé' });
    }

    // Créer le rapport
    const rapport = await Rapport.create({
      typeRapport,
      numeroOrdreService,
      bureauId,
      numeroSinistre,
      dateSinistre: new Date(dateSinistre),
      dateVisite: dateVisite ? new Date(dateVisite) : new Date(),
      statut: 'brouillon',
      montantTotal: 0,
      userId,
    });

    // Créer le véhicule si fourni
    if (vehicule) {
      const tauxHoraire = await calculateTauxHoraire(vehicule.genre);
      const tauxVetuste = await calculateVetuste(new Date(vehicule.dateMiseCirculation));

      await Vehicule.create({
        ...vehicule,
        rapportId: rapport.id,
        dateMiseCirculation: new Date(vehicule.dateMiseCirculation),
        tauxHoraire,
        tauxVetuste,
      });
    }

    // Créer l'assuré si fourni
    if (assure) {
      await Assure.create({
        ...assure,
        rapportId: rapport.id,
      });
    }

    // Créer les chocs si fournis
    if (chocs && Array.isArray(chocs)) {
      for (let i = 0; i < chocs.length; i++) {
        const chocData = chocs[i];
        const choc = await Choc.create({
          ...chocData,
          rapportId: rapport.id,
          ordre: i + 1,
        });

        // Créer les fournitures du choc
        if (chocData.fournitures && Array.isArray(chocData.fournitures)) {
          for (const fourniture of chocData.fournitures) {
            await Fourniture.create({
              ...fourniture,
              chocId: choc.id,
            });
          }
        }
      }
    }

    // Créer les honoraires si fournis
    if (honoraire) {
      const fraisDeplacement = await calculateFraisDeplacement(honoraire.kilometres || 0);
      const montantHonoraire = await calculateHonoraires(honoraire.montantBase || 0);

      await Honoraire.create({
        ...honoraire,
        rapportId: rapport.id,
        fraisDeplacement,
        montantTotal: montantHonoraire + fraisDeplacement,
      });
    }

    // Récupérer le rapport complet
    const rapportComplet = await Rapport.findByPk(rapport.id, {
      include: [
        { model: Vehicule, as: 'vehicule' },
        { model: Assure, as: 'assure' },
        { 
          model: Choc, 
          as: 'chocs',
          include: [{ model: Fourniture, as: 'fournitures' }],
        },
        { model: Honoraire, as: 'honoraire' },
      ],
    });

    res.status(201).json({ 
      rapport: rapportComplet,
      message: 'Rapport créé avec succès'
    });
  } catch (error: any) {
    console.error('Erreur createRapport:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la création du rapport',
      details: error.message 
    });
  }
};

/**
 * Mettre à jour un rapport
 */
export const updateRapport = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const rapport = await Rapport.findByPk(id);
    
    if (!rapport) {
      return res.status(404).json({ error: 'Rapport non trouvé' });
    }

    // Mise à jour du rapport principal
    await rapport.update(updates);

    // Mise à jour du véhicule si fourni
    if (updates.vehicule) {
      const vehicule = await Vehicule.findOne({ where: { rapportId: id } });
      if (vehicule) {
        await vehicule.update(updates.vehicule);
      }
    }

    // Mise à jour de l'assuré si fourni
    if (updates.assure) {
      const assure = await Assure.findOne({ where: { rapportId: id } });
      if (assure) {
        await assure.update(updates.assure);
      }
    }

    // Récupérer le rapport mis à jour
    const rapportMisAJour = await Rapport.findByPk(id, {
      include: [
        { model: Vehicule, as: 'vehicule' },
        { model: Assure, as: 'assure' },
        { 
          model: Choc, 
          as: 'chocs',
          include: [{ model: Fourniture, as: 'fournitures' }],
        },
        { model: Honoraire, as: 'honoraire' },
      ],
    });

    res.json({ 
      rapport: rapportMisAJour,
      message: 'Rapport mis à jour avec succès'
    });
  } catch (error: any) {
    console.error('Erreur updateRapport:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la mise à jour du rapport',
      details: error.message 
    });
  }
};

/**
 * Supprimer un rapport
 */
export const deleteRapport = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const rapport = await Rapport.findByPk(id);
    
    if (!rapport) {
      return res.status(404).json({ error: 'Rapport non trouvé' });
    }

    // La suppression en cascade est gérée par Sequelize
    await rapport.destroy();

    res.json({ message: 'Rapport supprimé avec succès' });
  } catch (error: any) {
    console.error('Erreur deleteRapport:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la suppression du rapport',
      details: error.message 
    });
  }
};

/**
 * Rechercher des rapports par numéro de sinistre
 */
export const getRapportsBySinistre = async (req: Request, res: Response) => {
  try {
    const { numeroSinistre } = req.params;

    const rapports = await Rapport.findAll({
      where: { numeroSinistre },
      include: [
        {
          model: Bureau,
          as: 'bureau',
          attributes: ['id', 'code', 'nomAgence'],
        },
        {
          model: Vehicule,
          as: 'vehicule',
          attributes: ['marque', 'type', 'immatriculation'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json({ 
      rapports,
      count: rapports.length 
    });
  } catch (error: any) {
    console.error('Erreur getRapportsBySinistre:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la recherche des rapports',
      details: error.message 
    });
  }
};

/**
 * Recalculer les totaux d'un rapport
 */
export const recalculateRapport = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const rapport = await Rapport.findByPk(id, {
      include: [
        { model: Vehicule, as: 'vehicule' },
        { 
          model: Choc, 
          as: 'chocs',
          include: [{ model: Fourniture, as: 'fournitures' }],
        },
      ],
    });

    if (!rapport) {
      return res.status(404).json({ error: 'Rapport non trouvé' });
    }

    // Calculer le total
    let montantTotal = 0;

    // Somme des fournitures de tous les chocs
    if (rapport.chocs) {
      for (const choc of rapport.chocs) {
        if (choc.fournitures) {
          for (const fourniture of choc.fournitures) {
            montantTotal += parseFloat(fourniture.prixTotal.toString());
          }
        }
        // Ajouter le montant de la peinture
        montantTotal += parseFloat(choc.montantPeinture.toString());
      }
    }

    // Mettre à jour le montant total
    await rapport.update({ montantTotal });

    res.json({ 
      montantTotal,
      message: 'Montant recalculé avec succès'
    });
  } catch (error: any) {
    console.error('Erreur recalculateRapport:', error);
    res.status(500).json({ 
      error: 'Erreur lors du recalcul du rapport',
      details: error.message 
    });
  }
};
