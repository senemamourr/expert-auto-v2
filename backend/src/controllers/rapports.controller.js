// Contrôleur pour la gestion des rapports d'expertise

const pool = require('../config/database');

// GET /api/rapports - Liste tous les rapports avec pagination et filtres
exports.getAllRapports = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10,
      statut,
      typeRapport,
      bureauId,
      numeroSinistre
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Construction de la requête avec filtres
    let whereConditions = [];
    let params = [];
    let paramCount = 1;

    if (statut) {
      whereConditions.push(`r.statut = $${paramCount}`);
      params.push(statut);
      paramCount++;
    }

    if (typeRapport) {
      whereConditions.push(`r.type_rapport = $${paramCount}`);
      params.push(typeRapport);
      paramCount++;
    }

    if (bureauId) {
      whereConditions.push(`r.bureau_id = $${paramCount}`);
      params.push(bureauId);
      paramCount++;
    }

    if (numeroSinistre) {
      whereConditions.push(`r.numero_sinistre ILIKE $${paramCount}`);
      params.push(`%${numeroSinistre}%`);
      paramCount++;
    }

    const whereClause = whereConditions.length > 0 
      ? 'WHERE ' + whereConditions.join(' AND ')
      : '';

    // Compter le total
    const countQuery = `
      SELECT COUNT(*) as total
      FROM rapports r
      ${whereClause}
    `;
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);

    // Récupérer les rapports
    params.push(parseInt(limit));
    params.push(offset);

    const query = `
      SELECT 
        r.id,
        r.numero_ordre_service,
        r.numero_sinistre,
        r.type_rapport,
        r.date_visite,
        r.statut,
        r.montant_total,
        r.created_at,
        b.code as bureau_code,
        b.nom_agence as bureau_nom
      FROM rapports r
      LEFT JOIN bureaux b ON r.bureau_id = b.id
      ${whereClause}
      ORDER BY r.created_at DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;

    const result = await pool.query(query, params);

    res.json({
      success: true,
      rapports: result.rows.map(row => ({
        id: row.id,
        numeroOrdreService: row.numero_ordre_service,
        numeroSinistre: row.numero_sinistre,
        typeRapport: row.type_rapport,
        dateVisite: row.date_visite,
        statut: row.statut,
        montantTotal: parseFloat(row.montant_total) || 0,
        bureauCode: row.bureau_code,
        bureauNom: row.bureau_nom,
        createdAt: row.created_at
      })),
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    console.error('Erreur getAllRapports:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des rapports'
    });
  }
};

// GET /api/rapports/:id - Récupère un rapport par ID
exports.getRapportById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT 
        r.*,
        b.code as bureau_code,
        b.nom_agence as bureau_nom,
        b.responsable_sinistres as bureau_responsable
       FROM rapports r
       LEFT JOIN bureaux b ON r.bureau_id = b.id
       WHERE r.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Rapport non trouvé'
      });
    }

    const row = result.rows[0];
    
    res.json({
      success: true,
      rapport: {
        id: row.id,
        numeroOrdreService: row.numero_ordre_service,
        numeroSinistre: row.numero_sinistre,
        typeRapport: row.type_rapport,
        dateVisite: row.date_visite,
        statut: row.statut,
        
        // Bureau
        bureauId: row.bureau_id,
        bureauCode: row.bureau_code,
        bureauNom: row.bureau_nom,
        bureauResponsable: row.bureau_responsable,
        
        // Véhicule
        vehiculeGenre: row.vehicule_genre,
        vehiculeMarque: row.vehicule_marque,
        vehiculeModele: row.vehicule_modele,
        vehiculeImmatriculation: row.vehicule_immatriculation,
        vehiculeChassis: row.vehicule_chassis,
        vehiculeDateMec: row.vehicule_date_mec,
        vehiculeKilometrage: row.vehicule_kilometrage,
        
        // Assuré
        assureNom: row.assure_nom,
        assurePrenom: row.assure_prenom,
        assureTelephone: row.assure_telephone,
        assureAdresse: row.assure_adresse,
        
        // Montants
        montantPieces: parseFloat(row.montant_pieces) || 0,
        montantMainOeuvre: parseFloat(row.montant_main_oeuvre) || 0,
        montantPeinture: parseFloat(row.montant_peinture) || 0,
        montantFournitures: parseFloat(row.montant_fournitures) || 0,
        montantTotal: parseFloat(row.montant_total) || 0,
        
        // Honoraires
        honorairesBase: parseFloat(row.honoraires_base) || 0,
        honorairesDeplacement: parseFloat(row.honoraires_deplacement) || 0,
        honorairesTotal: parseFloat(row.honoraires_total) || 0,
        
        // Observations
        observations: row.observations,
        
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }
    });
  } catch (error) {
    console.error('Erreur getRapportById:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération du rapport'
    });
  }
};

// POST /api/rapports - Créer un nouveau rapport
exports.createRapport = async (req, res) => {
  try {
    const {
      numeroOrdreService,
      numeroSinistre,
      typeRapport,
      dateVisite,
      bureauId,
      
      // Véhicule
      vehiculeGenre,
      vehiculeMarque,
      vehiculeModele,
      vehiculeImmatriculation,
      vehiculeChassis,
      vehiculeDateMec,
      vehiculeKilometrage,
      
      // Assuré
      assureNom,
      assurePrenom,
      assureTelephone,
      assureAdresse,
      
      // Montants
      montantPieces = 0,
      montantMainOeuvre = 0,
      montantPeinture = 0,
      montantFournitures = 0,
      
      // Honoraires
      honorairesBase = 0,
      honorairesDeplacement = 0,
      
      observations,
      statut = 'brouillon'
    } = req.body;

    // Validation
    if (!numeroOrdreService || !numeroSinistre || !typeRapport || !dateVisite || !bureauId) {
      return res.status(400).json({
        success: false,
        error: 'Champs obligatoires manquants'
      });
    }

    // Calculs automatiques
    const montantTotal = parseFloat(montantPieces) + parseFloat(montantMainOeuvre) + 
                        parseFloat(montantPeinture) + parseFloat(montantFournitures);
    const honorairesTotal = parseFloat(honorairesBase) + parseFloat(honorairesDeplacement);

    const result = await pool.query(
      `INSERT INTO rapports (
        numero_ordre_service, numero_sinistre, type_rapport, date_visite, 
        bureau_id, statut,
        vehicule_genre, vehicule_marque, vehicule_modele, vehicule_immatriculation,
        vehicule_chassis, vehicule_date_mec, vehicule_kilometrage,
        assure_nom, assure_prenom, assure_telephone, assure_adresse,
        montant_pieces, montant_main_oeuvre, montant_peinture, montant_fournitures, montant_total,
        honoraires_base, honoraires_deplacement, honoraires_total,
        observations
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17,
        $18, $19, $20, $21, $22, $23, $24, $25, $26
      ) RETURNING id, created_at`,
      [
        numeroOrdreService, numeroSinistre, typeRapport, dateVisite, 
        bureauId, statut,
        vehiculeGenre, vehiculeMarque, vehiculeModele, vehiculeImmatriculation,
        vehiculeChassis, vehiculeDateMec, vehiculeKilometrage,
        assureNom, assurePrenom, assureTelephone, assureAdresse,
        montantPieces, montantMainOeuvre, montantPeinture, montantFournitures, montantTotal,
        honorairesBase, honorairesDeplacement, honorairesTotal,
        observations
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Rapport créé avec succès',
      rapport: {
        id: result.rows[0].id,
        createdAt: result.rows[0].created_at
      }
    });
  } catch (error) {
    console.error('Erreur createRapport:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la création du rapport'
    });
  }
};

// PUT /api/rapports/:id - Modifier un rapport
exports.updateRapport = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Vérifier si le rapport existe
    const existing = await pool.query('SELECT id FROM rapports WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Rapport non trouvé'
      });
    }

    // Recalculer les totaux si nécessaire
    if (updates.montantPieces !== undefined || updates.montantMainOeuvre !== undefined ||
        updates.montantPeinture !== undefined || updates.montantFournitures !== undefined) {
      
      const current = await pool.query(
        'SELECT montant_pieces, montant_main_oeuvre, montant_peinture, montant_fournitures FROM rapports WHERE id = $1',
        [id]
      );
      
      const montantPieces = updates.montantPieces ?? current.rows[0].montant_pieces;
      const montantMainOeuvre = updates.montantMainOeuvre ?? current.rows[0].montant_main_oeuvre;
      const montantPeinture = updates.montantPeinture ?? current.rows[0].montant_peinture;
      const montantFournitures = updates.montantFournitures ?? current.rows[0].montant_fournitures;
      
      updates.montantTotal = parseFloat(montantPieces) + parseFloat(montantMainOeuvre) + 
                            parseFloat(montantPeinture) + parseFloat(montantFournitures);
    }

    if (updates.honorairesBase !== undefined || updates.honorairesDeplacement !== undefined) {
      const current = await pool.query(
        'SELECT honoraires_base, honoraires_deplacement FROM rapports WHERE id = $1',
        [id]
      );
      
      const honorairesBase = updates.honorairesBase ?? current.rows[0].honoraires_base;
      const honorairesDeplacement = updates.honorairesDeplacement ?? current.rows[0].honoraires_deplacement;
      
      updates.honorairesTotal = parseFloat(honorairesBase) + parseFloat(honorairesDeplacement);
    }

    // Construire la requête dynamique
    const fields = [];
    const values = [];
    let paramCount = 1;

    const fieldMapping = {
      numeroOrdreService: 'numero_ordre_service',
      numeroSinistre: 'numero_sinistre',
      typeRapport: 'type_rapport',
      dateVisite: 'date_visite',
      bureauId: 'bureau_id',
      statut: 'statut',
      vehiculeGenre: 'vehicule_genre',
      vehiculeMarque: 'vehicule_marque',
      vehiculeModele: 'vehicule_modele',
      vehiculeImmatriculation: 'vehicule_immatriculation',
      vehiculeChassis: 'vehicule_chassis',
      vehiculeDateMec: 'vehicule_date_mec',
      vehiculeKilometrage: 'vehicule_kilometrage',
      assureNom: 'assure_nom',
      assurePrenom: 'assure_prenom',
      assureTelephone: 'assure_telephone',
      assureAdresse: 'assure_adresse',
      montantPieces: 'montant_pieces',
      montantMainOeuvre: 'montant_main_oeuvre',
      montantPeinture: 'montant_peinture',
      montantFournitures: 'montant_fournitures',
      montantTotal: 'montant_total',
      honorairesBase: 'honoraires_base',
      honorairesDeplacement: 'honoraires_deplacement',
      honorairesTotal: 'honoraires_total',
      observations: 'observations'
    };

    for (const [key, dbField] of Object.entries(fieldMapping)) {
      if (updates[key] !== undefined) {
        fields.push(`${dbField} = $${paramCount}`);
        values.push(updates[key]);
        paramCount++;
      }
    }

    if (fields.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Aucune donnée à mettre à jour'
      });
    }

    values.push(id);

    await pool.query(
      `UPDATE rapports 
       SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramCount}`,
      values
    );

    res.json({
      success: true,
      message: 'Rapport modifié avec succès'
    });
  } catch (error) {
    console.error('Erreur updateRapport:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la modification du rapport'
    });
  }
};

// DELETE /api/rapports/:id - Supprimer un rapport
exports.deleteRapport = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await pool.query('SELECT id FROM rapports WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Rapport non trouvé'
      });
    }

    await pool.query('DELETE FROM rapports WHERE id = $1', [id]);

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
