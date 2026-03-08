import { Request, Response } from 'express';

// Import de sequelize pour les transactions et queries
const getSequelize = () => {
  const db = require('../config/database');
  return db.sequelize;
};

const sequelize = getSequelize();
const { QueryTypes } = require('sequelize');

// Liste des rapports avec pagination et filtres
export const getRapports = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = '1', limit = '10', statut, typeRapport, bureauId, numeroSinistre } = req.query;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    const whereConditions: string[] = [];
    const queryParams: any[] = [];
    let paramIndex = 1;

    if (statut && statut !== '') {
      whereConditions.push(`r.statut = $${paramIndex}`);
      queryParams.push(statut);
      paramIndex++;
    }

    if (typeRapport && typeRapport !== '') {
      whereConditions.push(`r.type_rapport = $${paramIndex}`);
      queryParams.push(typeRapport);
      paramIndex++;
    }

    if (bureauId && bureauId !== '') {
      whereConditions.push(`r.bureau_id = $${paramIndex}`);
      queryParams.push(bureauId);
      paramIndex++;
    }

    if (numeroSinistre && numeroSinistre !== '') {
      whereConditions.push(`r.numero_sinistre ILIKE $${paramIndex}`);
      queryParams.push(`%${numeroSinistre}%`);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 
      ? 'WHERE ' + whereConditions.join(' AND ')
      : '';

    const query = `
      SELECT 
        r.*,
        b.code as bureau_code,
        b.nom_agence as bureau_nom,
        v.marque as vehicule_marque,
        v.modele as vehicule_modele,
        v.immatriculation as vehicule_immatriculation,
        a.nom as assure_nom,
        a.prenom as assure_prenom
      FROM rapports r
      LEFT JOIN bureaux b ON r.bureau_id = b.id
      LEFT JOIN vehicules v ON r.vehicule_id = v.id
      LEFT JOIN assures a ON r.assure_id = a.id
      ${whereClause}
      ORDER BY r.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    queryParams.push(parseInt(limit as string), offset);

    const countQuery = `
      SELECT COUNT(*) as total
      FROM rapports r
      ${whereClause}
    `;

    const rapportsResult = await sequelize.query(query, {
      bind: queryParams,
      type: QueryTypes.SELECT
    });
    
    const countResult = await sequelize.query(countQuery, {
      bind: queryParams.slice(0, -2),
      type: QueryTypes.SELECT
    });

    const rapports = rapportsResult.map((row: any) => ({
      id: row.id,
      numeroOrdreService: row.numero_ordre_service,
      numeroSinistre: row.numero_sinistre,
      typeRapport: row.type_rapport,
      dateVisite: row.date_visite,
      dateSinistre: row.date_visite,
      statut: row.statut,
      bureauId: row.bureau_id,
      bureauCode: row.bureau_code || 'N/A',
      bureauNom: row.bureau_nom || 'N/A',
      vehiculeMarque: row.vehicule_marque || '',
      vehiculeModele: row.vehicule_modele || '',
      vehiculeImmatriculation: row.vehicule_immatriculation || '',
      assureNom: row.assure_nom || '',
      assurePrenom: row.assure_prenom || '',
      montantTotal: parseFloat(row.montant_total) || 0,
      honorairesTotal: parseFloat(row.honoraires_total) || 0,
      createdAt: row.created_at
    }));

    res.json({
      success: true,
      rapports,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: parseInt(countResult[0].total),
        pages: Math.ceil(countResult[0].total / parseInt(limit as string))
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

    const query = `
      SELECT 
        r.*,
        b.code as bureau_code,
        b.nom_agence as bureau_nom,
        v.*,
        a.*
      FROM rapports r
      LEFT JOIN bureaux b ON r.bureau_id = b.id
      LEFT JOIN vehicules v ON r.vehicule_id = v.id
      LEFT JOIN assures a ON r.assure_id = a.id
      WHERE r.id = $1
    `;

    const result = await sequelize.query(query, {
      bind: [id],
      type: QueryTypes.SELECT
    });

    if (result.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Rapport non trouvé'
      });
      return;
    }

    const row: any = result[0];
    const rapport = {
      id: row.id,
      numeroOrdreService: row.numero_ordre_service,
      numeroSinistre: row.numero_sinistre,
      typeRapport: row.type_rapport,
      dateVisite: row.date_visite,
      dateSinistre: row.date_visite,
      statut: row.statut,
      
      bureauId: row.bureau_id,
      bureauCode: row.bureau_code || 'N/A',
      bureauNom: row.bureau_nom || 'N/A',
      
      vehiculeGenre: row.genre || '',
      vehiculeMarque: row.marque || '',
      vehiculeModele: row.modele || '',
      vehiculeImmatriculation: row.immatriculation || '',
      vehiculeChassis: row.numero_chassis || row.numero_serie || '',
      vehiculeDateMec: row.date_mise_en_circulation || '',
      vehiculeKilometrage: row.kilometrage || 0,
      
      assureNom: row.nom || '',
      assurePrenom: row.prenom || '',
      assureTelephone: row.telephone || '',
      assureAdresse: row.adresse || '',
      
      montantPieces: parseFloat(row.montant_pieces) || 0,
      montantMainOeuvre: parseFloat(row.montant_main_oeuvre) || 0,
      montantPeinture: parseFloat(row.montant_peinture) || 0,
      montantFournitures: parseFloat(row.montant_fournitures) || 0,
      montantTotal: parseFloat(row.montant_total) || 0,
      
      honorairesBase: parseFloat(row.honoraires_base) || 0,
      honorairesDeplacement: parseFloat(row.honoraires_deplacement) || 0,
      honorairesTotal: parseFloat(row.honoraires_total) || 0,
      
      observations: row.observations,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };

    res.json({
      success: true,
      rapport
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
  const transaction = await sequelize.transaction();
  
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
      await transaction.rollback();
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

    // 1. Créer le véhicule si données fournies
    let vehiculeId = null;
    if (vehiculeData.marque || data.vehiculeMarque) {
      const vehiculeQuery = `
        INSERT INTO vehicules (
          genre, marque, modele, immatriculation, numero_chassis, numero_serie,
          date_mise_en_circulation, kilometrage,
          type, couleur, source_energie, puissance_fiscale, valeur_neuve,
          created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6,
          $7, $8,
          $9, $10, $11, $12, $13,
          NOW(), NOW()
        ) RETURNING id
      `;

      const vehiculeResult = await sequelize.query(vehiculeQuery, {
        bind: [
          vehiculeData.genre || data.vehiculeGenre || null,
          vehiculeData.marque || data.vehiculeMarque,
          vehiculeData.modele || data.vehiculeModele || null,
          vehiculeData.immatriculation || data.vehiculeImmatriculation || null,
          vehiculeData.numeroSerie || data.vehiculeChassis || null,
          vehiculeData.numeroSerie || data.vehiculeChassis || null,
          vehiculeData.dateMiseEnCirculation || data.vehiculeDateMec || null,
          vehiculeData.kilometrage || data.vehiculeKilometrage || null,
          // Champs requis avec valeurs par défaut
          'Non spécifié',
          'Non spécifiée',
          'Non spécifié',
          0,
          0
        ],
        transaction
      });

      vehiculeId = vehiculeResult[0][0].id;
    }

    // 2. Créer l'assuré si données fournies
    let assureId = null;
    if (assureData.nom || data.assureNom) {
      const assureQuery = `
        INSERT INTO assures (
          nom, prenom, telephone, adresse,
          created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4,
          NOW(), NOW()
        ) RETURNING id
      `;

      const assureResult = await sequelize.query(assureQuery, {
        bind: [
          assureData.nom || data.assureNom,
          assureData.prenom || data.assurePrenom || null,
          assureData.telephone || data.assureTelephone || null,
          assureData.adresse || data.assureAdresse || null
        ],
        transaction
      });

      assureId = assureResult[0][0].id;
    }

    // 3. Créer le rapport
    const rapportQuery = `
      INSERT INTO rapports (
        numero_ordre_service, numero_sinistre, type_rapport, date_visite, bureau_id, statut,
        vehicule_id, assure_id,
        montant_pieces, montant_main_oeuvre, montant_peinture, montant_fournitures, montant_total,
        honoraires_base, honoraires_deplacement, honoraires_total,
        observations,
        created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8,
        $9, $10, $11, $12, $13,
        $14, $15, $16,
        $17,
        NOW(), NOW()
      ) RETURNING *
    `;

    const rapportResult = await sequelize.query(rapportQuery, {
      bind: [
        numeroOrdreService,
        numeroSinistre,
        typeRapport,
        dateSinistre,
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
      ],
      transaction
    });

    await transaction.commit();

    res.status(201).json({
      success: true,
      rapport: rapportResult[0][0]
    });
  } catch (error: any) {
    await transaction.rollback();
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
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
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
      statut,
      
      montantPieces,
      montantMainOeuvre,
      montantPeinture,
      montantFournitures,
      
      observations
    } = data;

    // Récupérer le rapport actuel
    const getRapportQuery = `
      SELECT * FROM rapports WHERE id = $1
    `;
    const currentRapport = await sequelize.query(getRapportQuery, {
      bind: [id],
      type: QueryTypes.SELECT,
      transaction
    });

    if (currentRapport.length === 0) {
      await transaction.rollback();
      res.status(404).json({
        success: false,
        error: 'Rapport non trouvé'
      });
      return;
    }

    const rapport: any = currentRapport[0];

    // Mettre à jour le véhicule si existe
    if (rapport.vehicule_id && (vehiculeData.marque || data.vehiculeMarque)) {
      const updateVehiculeQuery = `
        UPDATE vehicules SET
          genre = COALESCE($1, genre),
          marque = COALESCE($2, marque),
          modele = COALESCE($3, modele),
          immatriculation = COALESCE($4, immatriculation),
          numero_chassis = COALESCE($5, numero_chassis),
          date_mise_en_circulation = COALESCE($6, date_mise_en_circulation),
          kilometrage = COALESCE($7, kilometrage),
          updated_at = NOW()
        WHERE id = $8
      `;

      await sequelize.query(updateVehiculeQuery, {
        bind: [
          vehiculeData.genre || data.vehiculeGenre,
          vehiculeData.marque || data.vehiculeMarque,
          vehiculeData.modele || data.vehiculeModele,
          vehiculeData.immatriculation || data.vehiculeImmatriculation,
          vehiculeData.numeroSerie || data.vehiculeChassis,
          vehiculeData.dateMiseEnCirculation || data.vehiculeDateMec,
          vehiculeData.kilometrage || data.vehiculeKilometrage,
          rapport.vehicule_id
        ],
        transaction
      });
    }

    // Mettre à jour l'assuré si existe
    if (rapport.assure_id && (assureData.nom || data.assureNom)) {
      const updateAssureQuery = `
        UPDATE assures SET
          nom = COALESCE($1, nom),
          prenom = COALESCE($2, prenom),
          telephone = COALESCE($3, telephone),
          adresse = COALESCE($4, adresse),
          updated_at = NOW()
        WHERE id = $5
      `;

      await sequelize.query(updateAssureQuery, {
        bind: [
          assureData.nom || data.assureNom,
          assureData.prenom || data.assurePrenom,
          assureData.telephone || data.assureTelephone,
          assureData.adresse || data.assureAdresse,
          rapport.assure_id
        ],
        transaction
      });
    }

    const montantTotal = parseFloat(montantPieces || 0) + parseFloat(montantMainOeuvre || 0) + 
                        parseFloat(montantPeinture || 0) + parseFloat(montantFournitures || 0);
    
    const honorairesBase = honoraire.montantBase || data.honorairesBase || 0;
    const honorairesDeplacement = honoraire.fraisDeplacement || data.honorairesDeplacement || 0;
    const honorairesTotal = parseFloat(honorairesBase) + parseFloat(honorairesDeplacement);

    // Mettre à jour le rapport
    const updateRapportQuery = `
      UPDATE rapports SET
        numero_ordre_service = $1,
        numero_sinistre = $2,
        type_rapport = $3,
        date_visite = $4,
        bureau_id = $5,
        statut = $6,
        montant_pieces = $7,
        montant_main_oeuvre = $8,
        montant_peinture = $9,
        montant_fournitures = $10,
        montant_total = $11,
        honoraires_base = $12,
        honoraires_deplacement = $13,
        honoraires_total = $14,
        observations = $15,
        updated_at = NOW()
      WHERE id = $16
      RETURNING *
    `;

    const result = await sequelize.query(updateRapportQuery, {
      bind: [
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
        montantTotal,
        honorairesBase,
        honorairesDeplacement,
        honorairesTotal,
        observations,
        id
      ],
      transaction
    });

    await transaction.commit();

    res.json({
      success: true,
      rapport: result[0][0]
    });
  } catch (error: any) {
    await transaction.rollback();
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

    const result = await sequelize.query(
      'DELETE FROM rapports WHERE id = $1 RETURNING *',
      { bind: [id] }
    );

    const deletedRapport = result[0][0];

    if (!deletedRapport) {
      res.status(404).json({
        success: false,
        error: 'Rapport non trouvé'
      });
      return;
    }

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
