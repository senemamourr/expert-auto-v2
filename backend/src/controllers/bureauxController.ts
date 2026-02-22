import { Request, Response } from 'express';
import { Bureau } from '../models/Bureau';

export const bureauxController = {
  // Récupérer tous les bureaux
  async getAll(req: Request, res: Response) {
    try {
      const bureaux = await Bureau.findAll({
        order: [['createdAt', 'DESC']]
      });
      res.json({ bureaux });
    } catch (error) {
      console.error('Erreur getAll bureaux:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  },

  // Récupérer un bureau par ID
  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const bureau = await Bureau.findByPk(id);
      
      if (!bureau) {
        return res.status(404).json({ error: 'Bureau non trouvé' });
      }
      
      res.json({ bureau });
    } catch (error) {
      console.error('Erreur getById bureau:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  },

  // Créer un nouveau bureau
  async create(req: Request, res: Response) {
    try {
      const { code, nomAgence, responsableSinistres, telephone, email, adresse } = req.body;
      
      // Validation basique
      if (!code || !nomAgence || !responsableSinistres || !telephone || !email || !adresse) {
        return res.status(400).json({ error: 'Tous les champs sont requis' });
      }
      
      // Vérifier si le code existe déjà
      const existing = await Bureau.findOne({ where: { code } });
      if (existing) {
        return res.status(400).json({ error: 'Ce code bureau existe déjà' });
      }
      
      const bureau = await Bureau.create({
        code,
        nomAgence,
        responsableSinistres,
        telephone,
        email,
        adresse
      });
      
      res.status(201).json({ bureau });
    } catch (error) {
      console.error('Erreur create bureau:', error);
      res.status(500).json({ error: 'Erreur lors de la création du bureau' });
    }
  },

  // Mettre à jour un bureau
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { code, nomAgence, responsableSinistres, telephone, email, adresse } = req.body;
      
      const bureau = await Bureau.findByPk(id);
      if (!bureau) {
        return res.status(404).json({ error: 'Bureau non trouvé' });
      }
      
      // Vérifier si le nouveau code n'est pas déjà utilisé par un autre bureau
      if (code && code !== bureau.code) {
        const existing = await Bureau.findOne({ where: { code } });
        if (existing) {
          return res.status(400).json({ error: 'Ce code bureau existe déjà' });
        }
      }
      
      await bureau.update({
        code: code || bureau.code,
        nomAgence: nomAgence || bureau.nomAgence,
        responsableSinistres: responsableSinistres || bureau.responsableSinistres,
        telephone: telephone || bureau.telephone,
        email: email || bureau.email,
        adresse: adresse || bureau.adresse
      });
      
      res.json({ bureau });
    } catch (error) {
      console.error('Erreur update bureau:', error);
      res.status(500).json({ error: 'Erreur lors de la mise à jour' });
    }
  },

  // Supprimer un bureau
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const bureau = await Bureau.findByPk(id);
      
      if (!bureau) {
        return res.status(404).json({ error: 'Bureau non trouvé' });
      }
      
      await bureau.destroy();
      res.json({ message: 'Bureau supprimé avec succès' });
    } catch (error) {
      console.error('Erreur delete bureau:', error);
      res.status(500).json({ error: 'Erreur lors de la suppression' });
    }
  },

  // Rechercher par code (pour l'autocomplétion)
  async getByCode(req: Request, res: Response) {
    try {
      const { code } = req.params;
      const bureau = await Bureau.findOne({ where: { code } });
      
      if (!bureau) {
        return res.status(404).json({ error: 'Bureau non trouvé' });
      }
      
      res.json({ bureau });
    } catch (error) {
      console.error('Erreur getByCode bureau:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
};
