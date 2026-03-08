// Contrôleur pour les rapports d'expertise
const pool = require('../config/database');

// Liste des rapports avec pagination et filtres
exports.getRapports = async (req, res) => {
  try {
    const { page = 1, limit = 10, statut, typeRapport, bureauId, numeroSinistre } = req.query;
    const offset = (page - 1) * limit;

    let whereConditions = [];
    let queryParams = [];
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

    // Requête avec JOIN pour récupérer les infos du bureau
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

    queryParams.push(limit, offset);

    const countQuery = `
      SELECT COUNT(*) as total
      FROM rapports r
      ${whereClause}
    `;

    const rapportsResult = await pool.query(query, queryParams);
    const countResult = await pool.query(countQuery, queryParams.slice(0, -2));

    const rapports = rapportsResult.rows.map(row => ({
      id: row.id,
      numeroOrdreService: row.numero_ordre_service,
      numeroSinistre: row.numero_sinistre,
      typeRapport: row.type_rapport,
      dateVisite: row.date_visite,
      dateSinistre: row.date_visite, // Alias pour compatibilité
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
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].total),
        pages: Math.ceil(countResult.rows[0].total / limit)
      }
    });
  } catch (error) {
    console.error('Erreur getRapports:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des rapports'
    });
  }
};

// Récupérer un rapport par ID
exports.getRapportById = async (req, res) => {
  try {
    const { id } = req.params;

    // Requête avec JOIN pour récupérer les infos du bureau
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
      return res.status(404).json({
        success: false,
        error: 'Rapport non trouvé'
      });
    }

    const row = result.rows[0];
    const rapport = {
      id: row.id,
      numeroOrdreService: row.numero_ordre_service,
      numeroSinistre: row.numero_sinistre,
      typeRapport: row.type_rapport,
      dateVisite: row.date_visite,
      dateSinistre: row.date_visite, // Alias
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
  } catch (error) {
    console.error('Erreur getRapportById:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération du rapport'
    });
  }
};

// Créer un rapport
exports.createRapport = async (req, res) => {
  try {
    const {
      numeroOrdreService,
      numeroSinistre,
      typeRapport,
      dateSinistre,
      bureauId,
      statut = 'brouillon',
      
      vehiculeGenre,
      vehiculeMarque,
      vehiculeModele,
      vehiculeImmatriculation,
      vehiculeChassis,
      vehiculeDateMec,
      vehiculeKilometrage,
      
      assureNom,
      assurePrenom,
      assureTelephone,
      assureAdresse,
      
      montantPieces = 0,
      montantMainOeuvre = 0,
      montantPeinture = 0,
      montantFournitures = 0,
      
      honorairesBase = 0,
      honorairesDeplacement = 0,
      
      observations
    } = req.body;

    // Validation
    if (!numeroOrdreService || !numeroSinistre || !typeRapport || !dateSinistre || !bureauId) {
      return res.status(400).json({
        success: false,
        error: 'Données manquantes',
        required: ['typeRapport', 'numeroOrdreService', 'bureauId', 'numeroSinistre', 'dateSinistre']
      });
    }

    // Calculer les totaux
    const montantTotal = parseFloat(montantPieces) + parseFloat(montantMainOeuvre) + 
                        parseFloat(montantPeinture) + parseFloat(montantFournitures);
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
      numeroOrdreService, numeroSinistre, typeRapport, dateSinistre, bureauId, statut,
      vehiculeGenre, vehiculeMarque, vehiculeModele, vehiculeImmatriculation,
      vehiculeChassis, vehiculeDateMec, vehiculeKilometrage,
      assureNom, assurePrenom, assureTelephone, assureAdresse,
      montantPieces, montantMainOeuvre, montantPeinture, montantFournitures, montantTotal,
      honorairesBase, honorairesDeplacement, honorairesTotal,
      observations
    ];

    const result = await pool.query(query, values);

    res.status(201).json({
      success: true,
      rapport: result.rows[0]
    });
  } catch (error) {
    console.error('Erreur createRapport:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la création du rapport'
    });
  }
};

// Mettre à jour un rapport
exports.updateRapport = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      numeroOrdreService,
      numeroSinistre,
      typeRapport,
      dateSinistre,
      bureauId,
      statut,
      
      vehiculeGenre,
      vehiculeMarque,
      vehiculeModele,
      vehiculeImmatriculation,
      vehiculeChassis,
      vehiculeDateMec,
      vehiculeKilometrage,
      
      assureNom,
      assurePrenom,
      assureTelephone,
      assureAdresse,
      
      montantPieces,
      montantMainOeuvre,
      montantPeinture,
      montantFournitures,
      
      honorairesBase,
      honorairesDeplacement,
      
      observations
    } = req.body;

    // Calculer les totaux
    const montantTotal = parseFloat(montantPieces || 0) + parseFloat(montantMainOeuvre || 0) + 
                        parseFloat(montantPeinture || 0) + parseFloat(montantFournitures || 0);
    const honorairesTotal = parseFloat(honorairesBase || 0) + parseFloat(honorairesDeplacement || 0);

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
      numeroOrdreService, numeroSinistre, typeRapport, dateSinistre, bureauId, statut,
      vehiculeGenre, vehiculeMarque, vehiculeModele, vehiculeImmatriculation,
      vehiculeChassis, vehiculeDateMec, vehiculeKilometrage,
      assureNom, assurePrenom, assureTelephone, assureAdresse,
      montantPieces, montantMainOeuvre, montantPeinture, montantFournitures, montantTotal,
      honorairesBase, honorairesDeplacement, honorairesTotal,
      observations,
      id
    ];

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Rapport non trouvé'
      });
    }

    res.json({
      success: true,
      rapport: result.rows[0]
    });
  } catch (error) {
    console.error('Erreur updateRapport:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la mise à jour du rapport'
    });
  }
};

// Supprimer un rapport
exports.deleteRapport = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM rapports WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Rapport non trouvé'
      });
    }

    res.json({
      success: true,
      message: 'Rapport supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur deleteRapport:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la suppression du rapport'
    });
  }
};
