import { Request, Response } from 'express';
import { Op, fn, col, literal } from 'sequelize';
import Rapport from '../models/Rapport';
import Honoraire from '../models/Honoraire';
import { Bureau } from '../models/Bureau';
import Vehicule from '../models/Vehicule';

/**
 * Controller pour les statistiques et rapports récapitulatifs
 */

/**
 * KPIs Dashboard - Indicateurs clés
 * GET /api/stats/kpis
 */
export const getKPIs = async (req: Request, res: Response) => {
  try {
    // Nombre total de rapports
    const totalRapports = await Rapport.count();

    // Rapports par statut
    const rapportsParStatut = await Rapport.findAll({
      attributes: [
        'statut',
        [fn('COUNT', col('id')), 'count']
      ],
      group: ['statut'],
      raw: true
    });

    // Montant total tous rapports (utiliser Sequelize, pas SQL brut)
    const montantTotal = await Rapport.sum('montantTotal') || 0;

    // Montant total honoraires
    const honorairesTotal = await Honoraire.sum('montantTotal') || 0;

    // Rapports ce mois-ci
    const debutMois = new Date();
    debutMois.setDate(1);
    debutMois.setHours(0, 0, 0, 0);

    const rapportsMois = await Rapport.count({
      where: {
        createdAt: {
          [Op.gte]: debutMois
        }
      }
    });

    // Rapports cette semaine
    const debutSemaine = new Date();
    debutSemaine.setDate(debutSemaine.getDate() - debutSemaine.getDay());
    debutSemaine.setHours(0, 0, 0, 0);

    const rapportsSemaine = await Rapport.count({
      where: {
        createdAt: {
          [Op.gte]: debutSemaine
        }
      }
    });

    // Formater les statuts
    const statutsFormates: any = {
      brouillon: 0,
      en_cours: 0,
      termine: 0,
      archive: 0
    };

    rapportsParStatut.forEach((item: any) => {
      statutsFormates[item.statut] = parseInt(item.count);
    });

    res.json({
      kpis: {
        totalRapports,
        montantTotal: parseFloat(montantTotal.toString()),
        honorairesTotal: parseFloat(honorairesTotal.toString()),
        rapportsMois,
        rapportsSemaine,
        statuts: statutsFormates
      }
    });
  } catch (error: any) {
    console.error('Erreur getKPIs:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la récupération des KPIs',
      details: error.message 
    });
  }
};

/**
 * Revenus mensuels
 * GET /api/stats/revenus?annee=2026
 */
export const getRevenusMensuels = async (req: Request, res: Response) => {
  try {
    const { annee = new Date().getFullYear() } = req.query;

    const debutAnnee = new Date(`${annee}-01-01`);
    const finAnnee = new Date(`${annee}-12-31 23:59:59`);

    // Honoraires par mois - UTILISER snake_case pour TOUTES les colonnes
    const honoraires = await Honoraire.findAll({
      attributes: [
        [fn('EXTRACT', literal('MONTH FROM "Honoraire"."created_at"')), 'mois'],
        [fn('SUM', col('Honoraire.montant_total')), 'total'],
        [fn('COUNT', col('Honoraire.id')), 'nombreRapports']
      ],
      include: [{
        model: Rapport,
        as: 'rapport',
        attributes: [],
        where: {
          createdAt: {
            [Op.between]: [debutAnnee, finAnnee]
          }
        }
      }],
      group: [fn('EXTRACT', literal('MONTH FROM "Honoraire"."created_at"'))],
      order: [[fn('EXTRACT', literal('MONTH FROM "Honoraire"."created_at"')), 'ASC']],
      raw: true
    });

    // Créer un tableau de 12 mois avec données
    const moisData = Array.from({ length: 12 }, (_, i) => ({
      mois: i + 1,
      nom: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'][i],
      total: 0,
      nombreRapports: 0
    }));

    // Remplir avec les données réelles
    honoraires.forEach((item: any) => {
      const moisIndex = parseInt(item.mois) - 1;
      if (moisIndex >= 0 && moisIndex < 12) {
        moisData[moisIndex].total = parseFloat(item.total) || 0;
        moisData[moisIndex].nombreRapports = parseInt(item.nombreRapports) || 0;
      }
    });

    const totalAnnuel = moisData.reduce((sum, m) => sum + m.total, 0);

    res.json({
      annee: parseInt(annee.toString()),
      revenus: moisData,
      totalAnnuel
    });
  } catch (error: any) {
    console.error('Erreur getRevenusMensuels:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la récupération des revenus',
      details: error.message 
    });
  }
};

/**
 * Récapitulatif honoraires
 * GET /api/stats/honoraires?type=quinzaine&periode=2026-03
 */
export const getRecapHonoraires = async (req: Request, res: Response) => {
  try {
    const { type = 'mensuel', periode } = req.query;

    let dateDebut: Date;
    let dateFin: Date;
    let groupeLabel: string;

    const now = new Date();

    if (type === 'quinzaine') {
      const jour = now.getDate();
      if (jour <= 15) {
        dateDebut = new Date(now.getFullYear(), now.getMonth(), 1);
        dateFin = new Date(now.getFullYear(), now.getMonth(), 15, 23, 59, 59);
        groupeLabel = 'Première quinzaine';
      } else {
        dateDebut = new Date(now.getFullYear(), now.getMonth(), 16);
        dateFin = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        groupeLabel = 'Seconde quinzaine';
      }
    } else if (type === 'mensuel') {
      const [annee, mois] = periode ? periode.toString().split('-') : [now.getFullYear(), now.getMonth() + 1];
      dateDebut = new Date(parseInt(annee.toString()), parseInt(mois.toString()) - 1, 1);
      dateFin = new Date(parseInt(annee.toString()), parseInt(mois.toString()), 0, 23, 59, 59);
      groupeLabel = `${['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'][parseInt(mois.toString()) - 1]} ${annee}`;
    } else {
      const annee = periode ? parseInt(periode.toString()) : now.getFullYear();
      dateDebut = new Date(annee, 0, 1);
      dateFin = new Date(annee, 11, 31, 23, 59, 59);
      groupeLabel = `Année ${annee}`;
    }

    const honoraires = await Honoraire.findAll({
      include: [{
        model: Rapport,
        as: 'rapport',
        where: {
          createdAt: {
            [Op.between]: [dateDebut, dateFin]
          }
        },
        include: [{
          model: Bureau,
          as: 'bureau',
          attributes: ['code', 'nomAgence']
        }]
      }]
    });

    let totalHonoraires = 0;
    let totalFraisDeplacement = 0;
    let nombreRapports = honoraires.length;

    const details = honoraires.map((h: any) => {
      const montant = parseFloat(h.montantBase) || 0;
      const frais = parseFloat(h.fraisDeplacement) || 0;
      totalHonoraires += montant;
      totalFraisDeplacement += frais;

      return {
        rapportId: h.rapport.id,
        numeroSinistre: h.rapport.numeroSinistre,
        bureau: h.rapport.bureau?.nomAgence || 'N/A',
        montantBase: montant,
        fraisDeplacement: frais,
        kilometres: h.kilometres,
        total: parseFloat(h.montantTotal) || 0,
        date: h.createdAt
      };
    });

    res.json({
      type,
      periode: groupeLabel,
      dateDebut,
      dateFin,
      resume: {
        nombreRapports,
        totalHonoraires,
        totalFraisDeplacement,
        totalGeneral: totalHonoraires + totalFraisDeplacement
      },
      details
    });
  } catch (error: any) {
    console.error('Erreur getRecapHonoraires:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la récupération du récapitulatif',
      details: error.message 
    });
  }
};

/**
 * Statistiques par bureau
 * GET /api/stats/bureaux
 */
export const getStatsByBureau = async (req: Request, res: Response) => {
  try {
    const stats = await Rapport.findAll({
      attributes: [
        'bureauId',
        [fn('COUNT', col('Rapport.id')), 'nombreRapports'],
        [fn('SUM', col('Rapport.montant_total')), 'montantTotal']
      ],
      include: [{
        model: Bureau,
        as: 'bureau',
        attributes: ['code', 'nomAgence']
      }],
      group: ['bureauId', 'bureau.id', 'bureau.code', 'bureau.nom_agence'],
      raw: true,
      nest: true
    });

    const statsFormatees = stats.map((item: any) => ({
      bureau: {
        id: item.bureauId,
        code: item.bureau.code,
        nom: item.bureau.nomAgence
      },
      nombreRapports: parseInt(item.nombreRapports) || 0,
      montantTotal: parseFloat(item.montantTotal) || 0
    }));

    res.json({ 
      bureaux: statsFormatees,
      total: statsFormatees.length
    });
  } catch (error: any) {
    console.error('Erreur getStatsByBureau:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la récupération des stats par bureau',
      details: error.message 
    });
  }
};

/**
 * Statistiques par type de rapport
 * GET /api/stats/types
 */
export const getStatsByType = async (req: Request, res: Response) => {
  try {
    const stats = await Rapport.findAll({
      attributes: [
        'typeRapport',
        [fn('COUNT', col('id')), 'nombre'],
        [fn('SUM', col('Rapport.montant_total')), 'montantTotal']
      ],
      group: ['typeRapport'],
      raw: true
    });

    const statsFormatees = stats.map((item: any) => ({
      type: item.typeRapport,
      nombre: parseInt(item.nombre) || 0,
      montantTotal: parseFloat(item.montantTotal) || 0
    }));

    res.json({ 
      types: statsFormatees
    });
  } catch (error: any) {
    console.error('Erreur getStatsByType:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la récupération des stats par type',
      details: error.message 
    });
  }
};

/**
 * Évolution des rapports dans le temps
 * GET /api/stats/evolution?periode=mois&nombre=12
 */
export const getEvolutionRapports = async (req: Request, res: Response) => {
  try {
    const { periode = 'mois', nombre = 12 } = req.query;

    let groupBy: any;

    if (periode === 'jour') {
      groupBy = fn('DATE', col('created_at'));
    } else if (periode === 'semaine') {
      groupBy = fn('DATE_TRUNC', 'week', col('created_at'));
    } else {
      groupBy = fn('DATE_TRUNC', 'month', col('created_at'));
    }

    const stats = await Rapport.findAll({
      attributes: [
        [groupBy, 'periode'],
        [fn('COUNT', col('id')), 'nombre']
      ],
      group: [groupBy],
      order: [[groupBy, 'DESC']],
      limit: parseInt(nombre.toString()),
      raw: true
    });

    res.json({ 
      periode,
      evolution: stats.reverse().map((item: any) => ({
        date: item.periode,
        nombre: parseInt(item.nombre) || 0
      }))
    });
  } catch (error: any) {
    console.error('Erreur getEvolutionRapports:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la récupération de l\'évolution',
      details: error.message 
    });
  }
};

/**
 * Top véhicules expertisés
 * GET /api/stats/vehicules
 */
export const getStatsVehicules = async (req: Request, res: Response) => {
  try {
    const topMarques = await Vehicule.findAll({
      attributes: [
        'marque',
        [fn('COUNT', col('id')), 'nombre']
      ],
      group: ['marque'],
      order: [[fn('COUNT', col('id')), 'DESC']],
      limit: 10,
      raw: true
    });

    const topGenres = await Vehicule.findAll({
      attributes: [
        'genre',
        [fn('COUNT', col('id')), 'nombre']
      ],
      group: ['genre'],
      order: [[fn('COUNT', col('id')), 'DESC']],
      raw: true
    });

    res.json({
      topMarques: topMarques.map((item: any) => ({
        marque: item.marque,
        nombre: parseInt(item.nombre)
      })),
      topGenres: topGenres.map((item: any) => ({
        genre: item.genre,
        nombre: parseInt(item.nombre)
      }))
    });
  } catch (error: any) {
    console.error('Erreur getStatsVehicules:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la récupération des stats véhicules',
      details: error.message 
    });
  }
};
