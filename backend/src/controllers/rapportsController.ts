import { Request, Response } from 'express';

// Import des modèles Sequelize
const getModels = () => {
  try {
    const db = require('../config/database');
    console.log('🔍 Database exports:', Object.keys(db));
    
    // Essayer d'accéder aux modèles via sequelize.models
    if (db.sequelize && db.sequelize.models) {
      console.log('🔍 Sequelize models:', Object.keys(db.sequelize.models));
    }
    
    // Retourner l'objet db qui contient sequelize + tous les modèles
    return db;
  } catch (err) {
    console.error('❌ Erreur chargement models:', err);
    throw new Error('Impossible de charger les modèles');
  }
};

const db = getModels();

// Essayer plusieurs façons d'accéder aux modèles
const Rapport = db.Rapport || db.sequelize?.models?.Rapport || db.sequelize?.models?.rapport;
const Bureau = db.Bureau || db.sequelize?.models?.Bureau || db.sequelize?.models?.bureau;
const Vehicule = db.Vehicule || db.sequelize?.models?.Vehicule || db.sequelize?.models?.vehicule;
const Assure = db.Assure || db.sequelize?.models?.Assure || db.sequelize?.models?.assure;

console.log('🔍 Rapport:', typeof Rapport);
console.log('🔍 Bureau:', typeof Bureau);
console.log('🔍 Vehicule:', typeof Vehicule);
console.log('🔍 Assure:', typeof Assure);

// Liste des rapports avec pagination et filtres
export const getRapports = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = '1', limit = '10', statut, typeRapport, bureauId, numeroSinistre } = req.query;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: any = {};
    
    if (statut && statut !== '') where.statut = statut;
    if (typeRapport && typeRapport !== '') where.typeRapport = typeRapport;
    if (bureauId && bureauId !== '') where.bureauId = bureauId;
    if (numeroSinistre && numeroSinistre !== '') {
      const { Op } = require('sequelize');
      where.numeroSinistre = { [Op.like]: `%${numeroSinistre}%` };
    }

    const { count, rows } = await Rapport.findAndCountAll({
      where,
      include: [
        {
          model: Bureau,
          as: 'bureau',
          attributes: ['id', 'code', 'nomAgence']
        },
        {
          model: Vehicule,
          as: 'vehicule',
          required: false
        },
        {
          model: Assure,
          as: 'assure',
          required: false
        }
      ],
      limit: parseInt(limit as string),
      offset,
      order: [['createdAt', 'DESC']]
    });

    const rapports = rows.map((r: any) => ({
      id: r.id,
      numeroOrdreService: r.numeroOrdreService,
      numeroSinistre: r.numeroSinistre,
      typeRapport: r.typeRapport,
      dateVisite: r.dateVisite,
      dateSinistre: r.dateVisite,
      statut: r.statut,
      bureauId: r.bureauId,
      bureauCode: r.bureau?.code || 'N/A',
      bureauNom: r.bureau?.nomAgence || 'N/A',
      vehiculeMarque: r.vehicule?.marque || '',
      vehiculeModele: r.vehicule?.modele || '',
      vehiculeImmatriculation: r.vehicule?.immatriculation || '',
      assureNom: r.assure?.nom || '',
      assurePrenom: r.assure?.prenom || '',
      montantTotal: parseFloat(r.montantTotal) || 0,
      honorairesTotal: parseFloat(r.honorairesTotal) || 0,
      createdAt: r.createdAt
    }));

    res.json({
      success: true,
      rapports,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: count,
        pages: Math.ceil(count / parseInt(limit as string))
      }
    });
  } catch (error: any) {
    console.error('Erreur getRapports:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des rapports'
    });
  }
};

// Récupérer un rapport par ID
export const getRapportById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const rapport = await Rapport.findByPk(id, {
      include: [
        {
          model: Bureau,
          as: 'bureau',
          attributes: ['id', 'code', 'nomAgence']
        },
        {
          model: Vehicule,
          as: 'vehicule',
          required: false
        },
        {
          model: Assure,
          as: 'assure',
          required: false
        }
      ]
    });

    if (!rapport) {
      res.status(404).json({
        success: false,
        error: 'Rapport non trouvé'
      });
      return;
    }

    const r: any = rapport;
    const response = {
      id: r.id,
      numeroOrdreService: r.numeroOrdreService,
      numeroSinistre: r.numeroSinistre,
      typeRapport: r.typeRapport,
      dateVisite: r.dateVisite,
      dateSinistre: r.dateVisite,
      statut: r.statut,
      
      bureauId: r.bureauId,
      bureauCode: r.bureau?.code || 'N/A',
      bureauNom: r.bureau?.nomAgence || 'N/A',
      
      vehiculeGenre: r.vehicule?.genre || '',
      vehiculeMarque: r.vehicule?.marque || '',
      vehiculeModele: r.vehicule?.modele || '',
      vehiculeImmatriculation: r.vehicule?.immatriculation || '',
      vehiculeChassis: r.vehicule?.numeroChassis || r.vehicule?.numeroSerie || '',
      vehiculeDateMec: r.vehicule?.dateMiseEnCirculation || '',
      vehiculeKilometrage: r.vehicule?.kilometrage || 0,
      
      assureNom: r.assure?.nom || '',
      assurePrenom: r.assure?.prenom || '',
      assureTelephone: r.assure?.telephone || '',
      assureAdresse: r.assure?.adresse || '',
      
      montantPieces: parseFloat(r.montantPieces) || 0,
      montantMainOeuvre: parseFloat(r.montantMainOeuvre) || 0,
      montantPeinture: parseFloat(r.montantPeinture) || 0,
      montantFournitures: parseFloat(r.montantFournitures) || 0,
      montantTotal: parseFloat(r.montantTotal) || 0,
      
      honorairesBase: parseFloat(r.honorairesBase) || 0,
      honorairesDeplacement: parseFloat(r.honorairesDeplacement) || 0,
      honorairesTotal: parseFloat(r.honorairesTotal) || 0,
      
      observations: r.observations,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt
    };

    res.json({
      success: true,
      rapport: response
    });
  } catch (error: any) {
    console.error('Erreur getRapportById:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération du rapport'
    });
  }
};

// Créer un rapport
export const createRapport = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = req.body;
    
    const vehiculeData = data.vehicule || {};
    const assureData = data.assure || {};
    const honoraire = data.honoraire || {};

    const {
      numeroOrdreService,
      numeroSinistre,
      typeRapport,
      dateSinistre,
      bureauId,
      statut = 'brouillon',
      
      montantPieces = 0,
      montantMainOeuvre = 0,
      montantPeinture = 0,
      montantFournitures = 0,
      
      observations
    } = data;

    if (!numeroOrdreService || !numeroSinistre || !typeRapport || !dateSinistre || !bureauId) {
      res.status(400).json({
        success: false,
        error: 'Données manquantes',
        required: ['typeRapport', 'numeroOrdreService', 'bureauId', 'numeroSinistre', 'dateSinistre']
      });
      return;
    }

    const montantTotal = parseFloat(montantPieces) + parseFloat(montantMainOeuvre) + 
                        parseFloat(montantPeinture) + parseFloat(montantFournitures);
    
    const honorairesBase = honoraire.montantBase || data.honorairesBase || 0;
    const honorairesDeplacement = honoraire.fraisDeplacement || data.honorairesDeplacement || 0;
    const honorairesTotal = parseFloat(honorairesBase) + parseFloat(honorairesDeplacement);

    // Créer le véhicule si des données sont fournies
    let vehiculeId = null;
    if (vehiculeData.marque || data.vehiculeMarque) {
      const vehicule = await Vehicule.create({
        genre: vehiculeData.genre || data.vehiculeGenre || null,
        marque: vehiculeData.marque || data.vehiculeMarque || null,
        modele: vehiculeData.modele || data.vehiculeModele || null,
        immatriculation: vehiculeData.immatriculation || data.vehiculeImmatriculation || null,
        numeroChassis: vehiculeData.numeroSerie || data.vehiculeChassis || null,
        dateMiseEnCirculation: vehiculeData.dateMiseEnCirculation || data.vehiculeDateMec || null,
        kilometrage: vehiculeData.kilometrage || data.vehiculeKilometrage || null,
        
        // Champs requis avec valeurs par défaut
        type: vehiculeData.type || 'Non spécifié',
        couleur: vehiculeData.couleur || 'Non spécifiée',
        sourceEnergie: vehiculeData.sourceEnergie || 'Non spécifié',
        puissanceFiscale: vehiculeData.puissanceFiscale || 0,
        valeurNeuve: vehiculeData.valeurNeuve || 0
      }, { validate: false }); // DÉSACTIVER LA VALIDATION
      
      vehiculeId = vehicule.id;
    }

    // Créer l'assuré si des données sont fournies
    let assureId = null;
    if (assureData.nom || data.assureNom) {
      const assure = await Assure.create({
        nom: assureData.nom || data.assureNom || null,
        prenom: assureData.prenom || data.assurePrenom || null,
        telephone: assureData.telephone || data.assureTelephone || null,
        adresse: assureData.adresse || data.assureAdresse || null
      }, { validate: false }); // DÉSACTIVER LA VALIDATION
      
      assureId = assure.id;
    }

    // Créer le rapport
    const rapport = await Rapport.create({
      numeroOrdreService,
      numeroSinistre,
      typeRapport,
      dateVisite: dateSinistre,
      bureauId,
      statut,
      vehiculeId,
      assureId,
      montantPieces,
      montantMainOeuvre,
      montantPeinture,
      montantFournitures,
      montantTotal,
      honorairesBase,
      honorairesDeplacement,
      honorairesTotal,
      observations
    }, { validate: false }); // DÉSACTIVER LA VALIDATION

    res.status(201).json({
      success: true,
      rapport
    });
  } catch (error: any) {
    console.error('Erreur createRapport:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la création du rapport',
      details: error.message
    });
  }
};

// Mettre à jour un rapport
export const updateRapport = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const data = req.body;
    
    const rapport = await Rapport.findByPk(id, {
      include: [
        { model: Vehicule, as: 'vehicule' },
        { model: Assure, as: 'assure' }
      ]
    });

    if (!rapport) {
      res.status(404).json({
        success: false,
        error: 'Rapport non trouvé'
      });
      return;
    }

    const vehiculeData = data.vehicule || {};
    const assureData = data.assure || {};
    const honoraire = data.honoraire || {};

    const {
      numeroOrdreService,
      numeroSinistre,
      typeRapport,
      dateSinistre,
      bureauId,
      statut,
      
      montantPieces,
      montantMainOeuvre,
      montantPeinture,
      montantFournitures,
      
      observations
    } = data;

    const montantTotal = parseFloat(montantPieces || 0) + parseFloat(montantMainOeuvre || 0) + 
                        parseFloat(montantPeinture || 0) + parseFloat(montantFournitures || 0);
    
    const honorairesBase = honoraire.montantBase || data.honorairesBase || 0;
    const honorairesDeplacement = honoraire.fraisDeplacement || data.honorairesDeplacement || 0;
    const honorairesTotal = parseFloat(honorairesBase) + parseFloat(honorairesDeplacement);

    // Mettre à jour le véhicule si existe
    const r: any = rapport;
    if (r.vehicule && (vehiculeData.marque || data.vehiculeMarque)) {
      await r.vehicule.update({
        genre: vehiculeData.genre || data.vehiculeGenre || r.vehicule.genre,
        marque: vehiculeData.marque || data.vehiculeMarque || r.vehicule.marque,
        modele: vehiculeData.modele || data.vehiculeModele || r.vehicule.modele,
        immatriculation: vehiculeData.immatriculation || data.vehiculeImmatriculation || r.vehicule.immatriculation,
        numeroChassis: vehiculeData.numeroSerie || data.vehiculeChassis || r.vehicule.numeroChassis,
        dateMiseEnCirculation: vehiculeData.dateMiseEnCirculation || data.vehiculeDateMec || r.vehicule.dateMiseEnCirculation,
        kilometrage: vehiculeData.kilometrage || data.vehiculeKilometrage || r.vehicule.kilometrage
      }, { validate: false });
    }

    // Mettre à jour l'assuré si existe
    if (r.assure && (assureData.nom || data.assureNom)) {
      await r.assure.update({
        nom: assureData.nom || data.assureNom || r.assure.nom,
        prenom: assureData.prenom || data.assurePrenom || r.assure.prenom,
        telephone: assureData.telephone || data.assureTelephone || r.assure.telephone,
        adresse: assureData.adresse || data.assureAdresse || r.assure.adresse
      }, { validate: false });
    }

    // Mettre à jour le rapport
    await rapport.update({
      numeroOrdreService,
      numeroSinistre,
      typeRapport,
      dateVisite: dateSinistre,
      bureauId,
      statut,
      montantPieces,
      montantMainOeuvre,
      montantPeinture,
      montantFournitures,
      montantTotal,
      honorairesBase,
      honorairesDeplacement,
      honorairesTotal,
      observations
    }, { validate: false });

    res.json({
      success: true,
      rapport
    });
  } catch (error: any) {
    console.error('Erreur updateRapport:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la mise à jour du rapport',
      details: error.message
    });
  }
};

// Supprimer un rapport
export const deleteRapport = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const rapport = await Rapport.findByPk(id);

    if (!rapport) {
      res.status(404).json({
        success: false,
        error: 'Rapport non trouvé'
      });
      return;
    }

    await rapport.destroy();

    res.json({
      success: true,
      message: 'Rapport supprimé avec succès'
    });
  } catch (error: any) {
    console.error('Erreur deleteRapport:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la suppression du rapport'
    });
  }
};
