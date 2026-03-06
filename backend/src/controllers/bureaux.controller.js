// Contrôleur pour la gestion des bureaux d'assurances

const pool = require('../config/database');

// GET /api/bureaux - Liste tous les bureaux
exports.getAllBureaux = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, code, nom_agence, responsable_sinistres, telephone, email, adresse, created_at
       FROM bureaux
       ORDER BY created_at DESC`
    );

    res.json({
      success: true,
      bureaux: result.rows.map(row => ({
        id: row.id,
        code: row.code,
        nomAgence: row.nom_agence,
        responsableSinistres: row.responsable_sinistres,
        telephone: row.telephone,
        email: row.email,
        adresse: row.adresse,
        createdAt: row.created_at
      }))
    });
  } catch (error) {
    console.error('Erreur getAllBureaux:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des bureaux'
    });
  }
};

// GET /api/bureaux/:id - Récupère un bureau par ID
exports.getBureauById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT id, code, nom_agence, responsable_sinistres, telephone, email, adresse, created_at
       FROM bureaux
       WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Bureau non trouvé'
      });
    }

    const row = result.rows[0];
    res.json({
      success: true,
      bureau: {
        id: row.id,
        code: row.code,
        nomAgence: row.nom_agence,
        responsableSinistres: row.responsable_sinistres,
        telephone: row.telephone,
        email: row.email,
        adresse: row.adresse,
        createdAt: row.created_at
      }
    });
  } catch (error) {
    console.error('Erreur getBureauById:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération du bureau'
    });
  }
};

// POST /api/bureaux - Créer un nouveau bureau
exports.createBureau = async (req, res) => {
  try {
    const { code, nomAgence, responsableSinistres, telephone, email, adresse } = req.body;

    // Validation
    if (!code || !nomAgence || !responsableSinistres || !telephone || !email || !adresse) {
      return res.status(400).json({
        success: false,
        error: 'Tous les champs sont requis'
      });
    }

    // Vérifier si le code existe déjà
    const existingBureau = await pool.query(
      'SELECT id FROM bureaux WHERE code = $1',
      [code]
    );

    if (existingBureau.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Un bureau avec ce code existe déjà'
      });
    }

    // Créer le bureau
    const result = await pool.query(
      `INSERT INTO bureaux (code, nom_agence, responsable_sinistres, telephone, email, adresse)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, code, nom_agence, responsable_sinistres, telephone, email, adresse, created_at`,
      [code, nomAgence, responsableSinistres, telephone, email, adresse]
    );

    const row = result.rows[0];
    res.status(201).json({
      success: true,
      message: 'Bureau créé avec succès',
      bureau: {
        id: row.id,
        code: row.code,
        nomAgence: row.nom_agence,
        responsableSinistres: row.responsable_sinistres,
        telephone: row.telephone,
        email: row.email,
        adresse: row.adresse,
        createdAt: row.created_at
      }
    });
  } catch (error) {
    console.error('Erreur createBureau:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la création du bureau'
    });
  }
};

// PUT /api/bureaux/:id - Modifier un bureau
exports.updateBureau = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, nomAgence, responsableSinistres, telephone, email, adresse } = req.body;

    // Vérifier si le bureau existe
    const existing = await pool.query(
      'SELECT id FROM bureaux WHERE id = $1',
      [id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Bureau non trouvé'
      });
    }

    // Si le code est modifié, vérifier qu'il n'existe pas déjà
    if (code) {
      const codeExists = await pool.query(
        'SELECT id FROM bureaux WHERE code = $1 AND id != $2',
        [code, id]
      );

      if (codeExists.rows.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Un bureau avec ce code existe déjà'
        });
      }
    }

    // Construire la requête de mise à jour
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (code) {
      updates.push(`code = $${paramCount++}`);
      values.push(code);
    }
    if (nomAgence) {
      updates.push(`nom_agence = $${paramCount++}`);
      values.push(nomAgence);
    }
    if (responsableSinistres) {
      updates.push(`responsable_sinistres = $${paramCount++}`);
      values.push(responsableSinistres);
    }
    if (telephone) {
      updates.push(`telephone = $${paramCount++}`);
      values.push(telephone);
    }
    if (email) {
      updates.push(`email = $${paramCount++}`);
      values.push(email);
    }
    if (adresse) {
      updates.push(`adresse = $${paramCount++}`);
      values.push(adresse);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Aucune donnée à mettre à jour'
      });
    }

    values.push(id);

    const result = await pool.query(
      `UPDATE bureaux 
       SET ${updates.join(', ')}
       WHERE id = $${paramCount}
       RETURNING id, code, nom_agence, responsable_sinistres, telephone, email, adresse, created_at`,
      values
    );

    const row = result.rows[0];
    res.json({
      success: true,
      message: 'Bureau modifié avec succès',
      bureau: {
        id: row.id,
        code: row.code,
        nomAgence: row.nom_agence,
        responsableSinistres: row.responsable_sinistres,
        telephone: row.telephone,
        email: row.email,
        adresse: row.adresse,
        createdAt: row.created_at
      }
    });
  } catch (error) {
    console.error('Erreur updateBureau:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la modification du bureau'
    });
  }
};

// DELETE /api/bureaux/:id - Supprimer un bureau
exports.deleteBureau = async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier si le bureau existe
    const existing = await pool.query(
      'SELECT id FROM bureaux WHERE id = $1',
      [id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Bureau non trouvé'
      });
    }

    // Vérifier si des rapports sont associés
    const rapports = await pool.query(
      'SELECT COUNT(*) as count FROM rapports WHERE bureau_id = $1',
      [id]
    );

    if (parseInt(rapports.rows[0].count) > 0) {
      return res.status(400).json({
        success: false,
        error: 'Impossible de supprimer ce bureau car des rapports y sont associés'
      });
    }

    // Supprimer le bureau
    await pool.query('DELETE FROM bureaux WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'Bureau supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur deleteBureau:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la suppression du bureau'
    });
  }
};
