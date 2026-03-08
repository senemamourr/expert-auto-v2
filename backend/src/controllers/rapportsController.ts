import { Request, Response } from 'express';

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
        v.type as vehicule_type,
        v.immatriculation as vehicule_immatriculation,
        a.nom as assure_nom,
        a.prenom as assure_prenom
      FROM rapports r
      LEFT JOIN bureaux b ON r.bureau_id = b.id
      LEFT JOIN vehicules v ON v.rapport_id = r.id
      LEFT JOIN assures a ON a.rapport_id = r.id
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
      dateSinistre: row.date_sinistre,
      statut: row.statut,
      bureauId: row.bureau_id,
      bureauCode: row.bureau_code || 'N/A',
      bureauNom: row.bureau_nom || 'N/A',
      vehiculeMarque: row.vehicule_marque || '',
      vehiculeType: row.vehicule_type || '',
      vehiculeImmatriculation: row.vehicule_immatriculation || '',
      assureNom: row.assure_nom || '',
      assurePrenom: row.assure_prenom || '',
      montantTotal: parseFloat(row.montant_total) || 0,
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
        a.nom as assure_nom,
        a.prenom as assure_prenom,
        a.telephone as assure_telephone,
        a.adresse as assure_adresse,
        h.montant_base as honoraires_base,
        h.frais_deplacement as honoraires_deplacement,
        h.montant_total as honoraires_total
      FROM rapports r
      LEFT JOIN bureaux b ON r.bureau_id = b.id
      LEFT JOIN vehicules v ON v.rapport_id = r.id
      LEFT JOIN assures a ON a.rapport_id = r.id
      LEFT JOIN honoraires h ON h.rapport_id = r.id
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
      dateSinistre: row.date_sinistre,
      statut: row.statut,
      
      bureauId: row.bureau_id,
      bureauCode: row.bureau_code || 'N/A',
      bureauNom: row.bureau_nom || 'N/A',
      
      vehiculeGenre: row.genre || '',
      vehiculeMarque: row.marque || '',
      vehiculeType: row.type || '',
      vehiculeImmatriculation: row.immatriculation || '',
      vehiculeChassis: row.numero_chassis || '',
      vehiculeDateMec: row.date_mise_circulation || '',
      vehiculeKilometrage: row.kilometrage || 0,
      
      assureNom: row.assure_nom || '',
      assurePrenom: row.assure_prenom || '',
      assureTelephone: row.assure_telephone || '',
      assureAdresse: row.assure_adresse || '',
      
      montantPieces: 0, // Calculé depuis chocs
      montantMainOeuvre: 0, // Calculé depuis chocs
      montantPeinture: 0, // Calculé depuis chocs
      montantFournitures: 0, // Calculé depuis fournitures
      montantTotal: parseFloat(row.montant_total) || 0,
      
      honorairesBase: parseFloat(row.honoraires_base) || 0,
      honorairesDeplacement: parseFloat(row.honoraires_deplacement) || 0,
      honorairesTotal: parseFloat(row.honoraires_total) || 0,
      
      observations: '',
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
      statut = 'brouillon'
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

    // Récupérer user_id depuis le token ou utiliser un défaut
    const userId = (req as any).user?.id || '00000000-0000-0000-0000-000000000000';

    // 1. Créer le rapport D'ABORD
    const rapportQuery = `
      INSERT INTO rapports (
        type_rapport, numero_ordre_service, bureau_id, numero_sinistre,
        date_sinistre, date_visite, statut, montant_total, user_id,
        created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4,
        $5, $6, $7, $8, $9,
        NOW(), NOW()
      ) RETURNING *
    `;

    const rapportResult = await sequelize.query(rapportQuery, {
      bind: [
        typeRapport,
        numeroOrdreService,
        bureauId,
        numeroSinistre,
        dateSinistre,
        dateSinistre, // date_visite = date_sinistre par défaut
        statut,
        0, // montant_total
        userId
      ],
      transaction
    });

    const rapportId = rapportResult[0][0].id;

    // 2. Créer le véhicule avec rapport_id
    if (vehiculeData.marque || data.vehiculeMarque) {
      const vehiculeQuery = `
        INSERT INTO vehicules (
          rapport_id, marque, type, genre, immatriculation, numero_chassis,
          kilometrage, date_mise_circulation, couleur, source_energie,
          puissance_fiscale, valeur_neuve, taux_horaire, taux_vetuste,
          created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6,
          $7, $8, $9, $10,
          $11, $12, $13, $14,
          NOW(), NOW()
        )
      `;

      await sequelize.query(vehiculeQuery, {
        bind: [
          rapportId,
          vehiculeData.marque || data.vehiculeMarque || 'Non spécifié',
          vehiculeData.type || data.vehiculeType || 'Non spécifié',
          vehiculeData.genre || data.vehiculeGenre || 'VP',
          vehiculeData.immatriculation || data.vehiculeImmatriculation || 'XXXXXX',
          vehiculeData.numeroSerie || data.vehiculeChassis || 'XXXXXX',
          vehiculeData.kilometrage || data.vehiculeKilometrage || 0,
          vehiculeData.dateMiseEnCirculation || data.vehiculeDateMec || dateSinistre,
          vehiculeData.couleur || 'Non spécifiée',
          vehiculeData.sourceEnergie || 'essence',
          vehiculeData.puissanceFiscale || 0,
          vehiculeData.valeurNeuve || 0,
          0, // taux_horaire
          0  // taux_vetuste
        ],
        transaction
      });
    }

    // 3. Créer l'assuré avec rapport_id
    if (assureData.nom || data.assureNom) {
      const assureQuery = `
        INSERT INTO assures (
          rapport_id, nom, prenom, telephone, adresse,
          created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5,
          NOW(), NOW()
        )
      `;

      await sequelize.query(assureQuery, {
        bind: [
          rapportId,
          assureData.nom || data.assureNom || 'Non spécifié',
          assureData.prenom || data.assurePrenom || '',
          assureData.telephone || data.assureTelephone || '0000000000',
          assureData.adresse || data.assureAdresse || 'Non spécifiée'
        ],
        transaction
      });
    }

    // 4. Créer les honoraires avec rapport_id
    const honorairesBase = honoraire.montantBase || data.honorairesBase || 0;
    const honorairesDeplacement = honoraire.fraisDeplacement || data.honorairesDeplacement || 0;
    const honorairesTotal = parseFloat(honorairesBase) + parseFloat(honorairesDeplacement);

    const honorairesQuery = `
      INSERT INTO honoraires (
        rapport_id, montant_base, avec_vetuste, frais_deplacement,
        kilometres, montant_total,
        created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4,
        $5, $6,
        NOW(), NOW()
      )
    `;

    await sequelize.query(honorairesQuery, {
      bind: [
        rapportId,
        honorairesBase,
        false,
        honorairesDeplacement,
        0,
        honorairesTotal
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
      statut
    } = data;

    // Mettre à jour le rapport
    const updateRapportQuery = `
      UPDATE rapports SET
        numero_ordre_service = COALESCE($1, numero_ordre_service),
        numero_sinistre = COALESCE($2, numero_sinistre),
        type_rapport = COALESCE($3, type_rapport),
        date_sinistre = COALESCE($4, date_sinistre),
        date_visite = COALESCE($5, date_visite),
        bureau_id = COALESCE($6, bureau_id),
        statut = COALESCE($7, statut),
        updated_at = NOW()
      WHERE id = $8
      RETURNING *
    `;

    const result = await sequelize.query(updateRapportQuery, {
      bind: [
        numeroOrdreService,
        numeroSinistre,
        typeRapport,
        dateSinistre,
        dateSinistre,
        bureauId,
        statut,
        id
      ],
      transaction
    });

    if (!result[0][0]) {
      await transaction.rollback();
      res.status(404).json({
        success: false,
        error: 'Rapport non trouvé'
      });
      return;
    }

    // Mettre à jour le véhicule
    if (vehiculeData.marque || data.vehiculeMarque) {
      const updateVehiculeQuery = `
        UPDATE vehicules SET
          marque = COALESCE($1, marque),
          type = COALESCE($2, type),
          genre = COALESCE($3, genre),
          immatriculation = COALESCE($4, immatriculation),
          numero_chassis = COALESCE($5, numero_chassis),
          kilometrage = COALESCE($6, kilometrage),
          date_mise_circulation = COALESCE($7, date_mise_circulation),
          updated_at = NOW()
        WHERE rapport_id = $8
      `;

      await sequelize.query(updateVehiculeQuery, {
        bind: [
          vehiculeData.marque || data.vehiculeMarque,
          vehiculeData.type || data.vehiculeType,
          vehiculeData.genre || data.vehiculeGenre,
          vehiculeData.immatriculation || data.vehiculeImmatriculation,
          vehiculeData.numeroSerie || data.vehiculeChassis,
          vehiculeData.kilometrage || data.vehiculeKilometrage,
          vehiculeData.dateMiseEnCirculation || data.vehiculeDateMec,
          id
        ],
        transaction
      });
    }

    // Mettre à jour l'assuré
    if (assureData.nom || data.assureNom) {
      const updateAssureQuery = `
        UPDATE assures SET
          nom = COALESCE($1, nom),
          prenom = COALESCE($2, prenom),
          telephone = COALESCE($3, telephone),
          adresse = COALESCE($4, adresse),
          updated_at = NOW()
        WHERE rapport_id = $5
      `;

      await sequelize.query(updateAssureQuery, {
        bind: [
          assureData.nom || data.assureNom,
          assureData.prenom || data.assurePrenom,
          assureData.telephone || data.assureTelephone,
          assureData.adresse || data.assureAdresse,
          id
        ],
        transaction
      });
    }

    // Mettre à jour les honoraires
    const honorairesBase = honoraire.montantBase || data.honorairesBase;
    const honorairesDeplacement = honoraire.fraisDeplacement || data.honorairesDeplacement;

    if (honorairesBase !== undefined || honorairesDeplacement !== undefined) {
      const updateHonorairesQuery = `
        UPDATE honoraires SET
          montant_base = COALESCE($1, montant_base),
          frais_deplacement = COALESCE($2, frais_deplacement),
          montant_total = COALESCE($1, montant_base) + COALESCE($2, frais_deplacement),
          updated_at = NOW()
        WHERE rapport_id = $3
      `;

      await sequelize.query(updateHonorairesQuery, {
        bind: [
          honorairesBase,
          honorairesDeplacement,
          id
        ],
        transaction
      });
    }

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
