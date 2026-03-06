// Contrôleur pour les statistiques

const pool = require('../config/database');

// GET /api/stats/kpis - Récupère les KPIs principaux
exports.getKPIs = async (req, res) => {
  try {
    // Total rapports
    const totalRapports = await pool.query(
      'SELECT COUNT(*) as count FROM rapports'
    );

    // Rapports ce mois
    const rapportsMois = await pool.query(
      `SELECT COUNT(*) as count FROM rapports 
       WHERE EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM CURRENT_DATE)
       AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE)`
    );

    // Rapports cette semaine
    const rapportsSemaine = await pool.query(
      `SELECT COUNT(*) as count FROM rapports 
       WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'`
    );

    // Répartition par statut
    const statuts = await pool.query(
      `SELECT statut, COUNT(*) as count FROM rapports 
       GROUP BY statut`
    );

    const statutsObj = {
      brouillon: 0,
      en_cours: 0,
      termine: 0,
      archive: 0
    };
    
    statuts.rows.forEach(row => {
      statutsObj[row.statut] = parseInt(row.count);
    });

    // Honoraires totaux (uniquement rapports terminés)
    const honoraires = await pool.query(
      `SELECT COALESCE(SUM(honoraires_total), 0) as total 
       FROM rapports 
       WHERE statut = 'termine'`
    );

    // Montant total (uniquement rapports terminés)
    const montantTotal = await pool.query(
      `SELECT COALESCE(SUM(montant_total), 0) as total 
       FROM rapports 
       WHERE statut = 'termine'`
    );

    res.json({
      success: true,
      kpis: {
        totalRapports: parseInt(totalRapports.rows[0].count),
        rapportsMois: parseInt(rapportsMois.rows[0].count),
        rapportsSemaine: parseInt(rapportsSemaine.rows[0].count),
        statuts: statutsObj,
        honorairesTotal: parseFloat(honoraires.rows[0].total) || 0,
        montantTotal: parseFloat(montantTotal.rows[0].total) || 0
      }
    });
  } catch (error) {
    console.error('Erreur getKPIs:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des KPIs'
    });
  }
};

// GET /api/stats/revenus - Récupère les revenus mensuels
exports.getRevenus = async (req, res) => {
  try {
    const { annee } = req.query;
    const year = annee || new Date().getFullYear();

    // Revenus par mois (uniquement rapports terminés)
    const revenus = await pool.query(
      `SELECT 
        EXTRACT(MONTH FROM created_at) as mois,
        COUNT(*) as nombre_rapports,
        COALESCE(SUM(honoraires_total), 0) as total
       FROM rapports
       WHERE EXTRACT(YEAR FROM created_at) = $1
       AND statut = 'termine'
       GROUP BY EXTRACT(MONTH FROM created_at)
       ORDER BY mois`,
      [year]
    );

    // Créer un tableau pour les 12 mois
    const moisNoms = [
      'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin',
      'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'
    ];

    const revenusParMois = Array.from({ length: 12 }, (_, i) => ({
      mois: i + 1,
      nom: moisNoms[i],
      nombreRapports: 0,
      total: 0
    }));

    // Remplir avec les données réelles
    revenus.rows.forEach(row => {
      const index = parseInt(row.mois) - 1;
      revenusParMois[index].nombreRapports = parseInt(row.nombre_rapports);
      revenusParMois[index].total = parseFloat(row.total);
    });

    // Calculer le total annuel
    const totalAnnuel = revenusParMois.reduce((sum, mois) => sum + mois.total, 0);

    res.json({
      success: true,
      revenus: {
        annee: parseInt(year),
        revenus: revenusParMois,
        totalAnnuel
      }
    });
  } catch (error) {
    console.error('Erreur getRevenus:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des revenus'
    });
  }
};

// GET /api/stats/recap-honoraires - Récapitulatif des honoraires
exports.getRecapHonoraires = async (req, res) => {
  try {
    const { annee, mois } = req.query;
    const year = annee || new Date().getFullYear();

    let query = `
      SELECT 
        COUNT(*) as nombre_rapports,
        COALESCE(SUM(honoraires_base), 0) as total_base,
        COALESCE(SUM(honoraires_deplacement), 0) as total_deplacement,
        COALESCE(SUM(honoraires_total), 0) as total_honoraires
      FROM rapports
      WHERE EXTRACT(YEAR FROM created_at) = $1
      AND statut = 'termine'
    `;

    const params = [year];

    if (mois) {
      query += ' AND EXTRACT(MONTH FROM created_at) = $2';
      params.push(mois);
    }

    const result = await pool.query(query, params);
    const row = result.rows[0];

    res.json({
      success: true,
      recap: {
        annee: parseInt(year),
        mois: mois ? parseInt(mois) : null,
        nombreRapports: parseInt(row.nombre_rapports),
        totalBase: parseFloat(row.total_base) || 0,
        totalDeplacement: parseFloat(row.total_deplacement) || 0,
        totalHonoraires: parseFloat(row.total_honoraires) || 0
      }
    });
  } catch (error) {
    console.error('Erreur getRecapHonoraires:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération du récapitulatif'
    });
  }
};

// GET /api/stats/bureaux - Statistiques par bureau
exports.getStatsBureaux = async (req, res) => {
  try {
    const stats = await pool.query(
      `SELECT 
        b.id,
        b.code,
        b.nom_agence,
        COUNT(r.id) as nombre_rapports,
        COALESCE(SUM(CASE WHEN r.statut = 'termine' THEN r.honoraires_total ELSE 0 END), 0) as revenus
       FROM bureaux b
       LEFT JOIN rapports r ON r.bureau_id = b.id
       GROUP BY b.id, b.code, b.nom_agence
       ORDER BY revenus DESC`
    );

    res.json({
      success: true,
      bureaux: stats.rows.map(row => ({
        bureauId: row.id,
        code: row.code,
        nomAgence: row.nom_agence,
        nombreRapports: parseInt(row.nombre_rapports),
        revenus: parseFloat(row.revenus) || 0
      }))
    });
  } catch (error) {
    console.error('Erreur getStatsBureaux:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des stats bureaux'
    });
  }
};

// GET /api/stats/types - Statistiques par type de rapport
exports.getStatsTypes = async (req, res) => {
  try {
    const stats = await pool.query(
      `SELECT 
        type_rapport,
        COUNT(*) as nombre,
        COALESCE(SUM(CASE WHEN statut = 'termine' THEN honoraires_total ELSE 0 END), 0) as revenus
       FROM rapports
       GROUP BY type_rapport
       ORDER BY nombre DESC`
    );

    res.json({
      success: true,
      types: stats.rows.map(row => ({
        type: row.type_rapport,
        nombre: parseInt(row.nombre),
        revenus: parseFloat(row.revenus) || 0
      }))
    });
  } catch (error) {
    console.error('Erreur getStatsTypes:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des stats types'
    });
  }
};

// GET /api/stats/evolution - Évolution des rapports
exports.getEvolution = async (req, res) => {
  try {
    const { periode = 'mois' } = req.query;

    let interval, format;
    if (periode === 'semaine') {
      interval = '7 days';
      format = 'DD/MM';
    } else {
      interval = '12 months';
      format = 'MM/YYYY';
    }

    const evolution = await pool.query(
      `SELECT 
        DATE_TRUNC('${periode === 'semaine' ? 'day' : 'month'}', created_at) as periode,
        COUNT(*) as nombre
       FROM rapports
       WHERE created_at >= CURRENT_DATE - INTERVAL '${interval}'
       GROUP BY periode
       ORDER BY periode`
    );

    res.json({
      success: true,
      evolution: evolution.rows.map(row => ({
        periode: row.periode,
        nombre: parseInt(row.nombre)
      }))
    });
  } catch (error) {
    console.error('Erreur getEvolution:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération de l\'évolution'
    });
  }
};

// GET /api/stats/vehicules - Statistiques véhicules
exports.getStatsVehicules = async (req, res) => {
  try {
    // Stats par genre
    const genres = await pool.query(
      `SELECT 
        vehicule_genre as genre,
        COUNT(*) as nombre
       FROM rapports
       GROUP BY vehicule_genre
       ORDER BY nombre DESC`
    );

    // Top marques
    const marques = await pool.query(
      `SELECT 
        vehicule_marque as marque,
        COUNT(*) as nombre
       FROM rapports
       GROUP BY vehicule_marque
       ORDER BY nombre DESC
       LIMIT 10`
    );

    res.json({
      success: true,
      vehicules: {
        parGenre: genres.rows.map(row => ({
          genre: row.genre,
          nombre: parseInt(row.nombre)
        })),
        topMarques: marques.rows.map(row => ({
          marque: row.marque,
          nombre: parseInt(row.nombre)
        }))
      }
    });
  } catch (error) {
    console.error('Erreur getStatsVehicules:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des stats véhicules'
    });
  }
};
