import { Request, Response } from 'express';

// Import du pool avec debug
const getPool = () => {
  try {
    const db = require('../config/database');
    console.log('🔍 Database module:', Object.keys(db));
    console.log('🔍 db.pool:', typeof db.pool);
    console.log('🔍 db.default:', typeof db.default);
    
    if (db.pool) {
      console.log('✅ Utilisation de db.pool');
      return db.pool;
    }
    if (db.default) {
      console.log('✅ Utilisation de db.default');
      return db.default;
    }
    console.log('✅ Utilisation de db direct');
    return db;
  } catch (err) {
    console.error('❌ Erreur chargement pool:', err);
    throw new Error('Impossible de charger le pool de connexion');
  }
};

const pool = getPool();
console.log('🔍 Pool final:', typeof pool, pool ? 'OK' : 'UNDEFINED');

// Liste des rapports avec pagination et filtres
export const getRapports = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!pool || !pool.query) {
      throw new Error('Pool de connexion non initialisé');
    }
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
        b.nom_agence as bureau_nom
      FROM rapports r
      LEFT JOIN bureaux b ON r.bureau_id = b.id
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

    const rapportsResult = await pool.query(query, queryParams);
    const countResult = await pool.query(countQuery, queryParams.slice(0, -2));

    const rapports = rapportsResult.rows.map((row: any) => ({
      id: row.id,
      numeroOrdreService: row.numero_ordre_service,
      numeroSinistre: row.numero_sinistre,
      typeRapport: row.type_rapport,
      dateVisite: row.date_visite,
      dateSinistre: row.date_visite,
      statut: row.statut,
      bureauId: row.bureau_id,
      bureauCode: row.bureau_code,
      bureauNom: row.bureau_nom,
      vehiculeMarque: row.vehicule_marque,
      vehiculeModele: row.vehicule_modele,
      vehiculeImmatriculation: row.vehicule_immatriculation,
      assureNom: row.assure_nom,
      assurePrenom: row.assure_prenom,
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
        total: parseInt(countResult.rows[0].total),
        pages: Math.ceil(countResult.rows[0].total / parseInt(limit as string))
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
        b.nom_agence as bureau_nom
      FROM rapports r
      LEFT JOIN bureaux b ON r.bureau_id = b.id
      WHERE r.id = $1
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Rapport non trouvé'
      });
      return;
    }

    const row = result.rows[0];
    const rapport = {
      id: row.id,
      numeroOrdreService: row.numero_ordre_service,
      numeroSinistre: row.numero_sinistre,
      typeRapport: row.type_rapport,
      dateVisite: row.date_visite,
      dateSinistre: row.date_visite,
      statut: row.statut,
      
      bureauId: row.bureau_id,
      bureauCode: row.bureau_code,
      bureauNom: row.bureau_nom,
      
      vehiculeGenre: row.vehicule_genre,
      vehiculeMarque: row.vehicule_marque,
      vehiculeModele: row.vehicule_modele,
      vehiculeImmatriculation: row.vehicule_immatriculation,
      vehiculeChassis: row.vehicule_chassis,
      vehiculeDateMec: row.vehicule_date_mec,
      vehiculeKilometrage: row.vehicule_kilometrage,
      
      assureNom: row.assure_nom,
      assurePrenom: row.assure_prenom,
      assureTelephone: row.assure_telephone,
      assureAdresse: row.assure_adresse,
      
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
  try {
    const data = req.body;
    
    const vehicule = data.vehicule || {};
    const assure = data.assure || {};
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

    const query = `
      INSERT INTO rapports (
        numero_ordre_service, numero_sinistre, type_rapport, date_visite, bureau_id, statut,
        vehicule_genre, vehicule_marque, vehicule_modele, vehicule_immatriculation,
        vehicule_chassis, vehicule_date_mec, vehicule_kilometrage,
        assure_nom, assure_prenom, assure_telephone, assure_adresse,
        montant_pieces, montant_main_oeuvre, montant_peinture, montant_fournitures, montant_total,
        honoraires_base, honoraires_deplacement, honoraires_total,
        observations
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9, $10,
        $11, $12, $13,
        $14, $15, $16, $17,
        $18, $19, $20, $21, $22,
        $23, $24, $25,
        $26
      ) RETURNING *
    `;

    const values = [
      numeroOrdreService,
      numeroSinistre,
      typeRapport,
      dateSinistre,
      bureauId,
      statut,
      vehicule.genre || data.vehiculeGenre || null,
      vehicule.marque || data.vehiculeMarque || null,
      vehicule.modele || data.vehiculeModele || null,
      vehicule.immatriculation || data.vehiculeImmatriculation || null,
      vehicule.numeroSerie || data.vehiculeChassis || null,
      vehicule.dateMiseEnCirculation || data.vehiculeDateMec || null,
      vehicule.kilometrage || data.vehiculeKilometrage || null,
      assure.nom || data.assureNom || null,
      assure.prenom || data.assurePrenom || null,
      assure.telephone || data.assureTelephone || null,
      assure.adresse || data.assureAdresse || null,
      montantPieces,
      montantMainOeuvre,
      montantPeinture,
      montantFournitures,
      montantTotal,
      honorairesBase,
      honorairesDeplacement,
      honorairesTotal,
      observations
    ];

    const result = await pool.query(query, values);

    res.status(201).json({
      success: true,
      rapport: result.rows[0]
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
    
    const vehicule = data.vehicule || {};
    const assure = data.assure || {};
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

    const query = `
      UPDATE rapports SET
        numero_ordre_service = $1,
        numero_sinistre = $2,
        type_rapport = $3,
        date_visite = $4,
        bureau_id = $5,
        statut = $6,
        vehicule_genre = $7,
        vehicule_marque = $8,
        vehicule_modele = $9,
        vehicule_immatriculation = $10,
        vehicule_chassis = $11,
        vehicule_date_mec = $12,
        vehicule_kilometrage = $13,
        assure_nom = $14,
        assure_prenom = $15,
        assure_telephone = $16,
        assure_adresse = $17,
        montant_pieces = $18,
        montant_main_oeuvre = $19,
        montant_peinture = $20,
        montant_fournitures = $21,
        montant_total = $22,
        honoraires_base = $23,
        honoraires_deplacement = $24,
        honoraires_total = $25,
        observations = $26,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $27
      RETURNING *
    `;

    const values = [
      numeroOrdreService,
      numeroSinistre,
      typeRapport,
      dateSinistre,
      bureauId,
      statut,
      vehicule.genre || data.vehiculeGenre || null,
      vehicule.marque || data.vehiculeMarque || null,
      vehicule.modele || data.vehiculeModele || null,
      vehicule.immatriculation || data.vehiculeImmatriculation || null,
      vehicule.numeroSerie || data.vehiculeChassis || null,
      vehicule.dateMiseEnCirculation || data.vehiculeDateMec || null,
      vehicule.kilometrage || data.vehiculeKilometrage || null,
      assure.nom || data.assureNom || null,
      assure.prenom || data.assurePrenom || null,
      assure.telephone || data.assureTelephone || null,
      assure.adresse || data.assureAdresse || null,
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
    ];

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Rapport non trouvé'
      });
      return;
    }

    res.json({
      success: true,
      rapport: result.rows[0]
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

    const result = await pool.query(
      'DELETE FROM rapports WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
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
