import apiClient from './api.client';

/**
 * Normalise un rapport depuis l'API
 * Gère la structure imbriquée du backend Sequelize
 */
function normalizeRapport(rapport: any) {
  return {
    ...rapport,
    // Extraire bureau depuis structure imbriquée OU plate
    bureauCode: rapport.bureau?.code || rapport.bureauCode || 'N/A',
    bureauNom: rapport.bureau?.nomAgence || rapport.bureauNom || 'N/A',
    
    // Extraire véhicule si imbriqué
    vehiculeMarque: rapport.vehicule?.marque || rapport.vehiculeMarque,
    vehiculeModele: rapport.vehicule?.modele || rapport.vehiculeModele,
    vehiculeImmatriculation: rapport.vehicule?.immatriculation || rapport.vehiculeImmatriculation,
    vehiculeGenre: rapport.vehicule?.genre || rapport.vehiculeGenre,
    vehiculeChassis: rapport.vehicule?.numeroSerie || rapport.vehiculeChassis,
    vehiculeDateMec: rapport.vehicule?.dateMiseEnCirculation || rapport.vehiculeDateMec,
    vehiculeKilometrage: rapport.vehicule?.kilometrage || rapport.vehiculeKilometrage,
    
    // Extraire assuré si imbriqué
    assureNom: rapport.assure?.nom || rapport.assureNom,
    assurePrenom: rapport.assure?.prenom || rapport.assurePrenom,
    assureTelephone: rapport.assure?.telephone || rapport.assureTelephone,
    assureAdresse: rapport.assure?.adresse || rapport.assureAdresse,
    
    // Assurer que les montants sont des nombres
    montantPieces: rapport.montantPieces != null ? parseFloat(rapport.montantPieces) : 0,
    montantMainOeuvre: rapport.montantMainOeuvre != null ? parseFloat(rapport.montantMainOeuvre) : 0,
    montantPeinture: rapport.montantPeinture != null ? parseFloat(rapport.montantPeinture) : 0,
    montantFournitures: rapport.montantFournitures != null ? parseFloat(rapport.montantFournitures) : 0,
    montantTotal: rapport.montantTotal != null ? parseFloat(rapport.montantTotal) : 0,
    
    honorairesBase: rapport.honoraire?.montantBase || rapport.honorairesBase || 0,
    honorairesDeplacement: rapport.honoraire?.fraisDeplacement || rapport.honorairesDeplacement || 0,
    honorairesTotal: rapport.honoraire?.montantTotal || rapport.honorairesTotal || 0,
  };
}

export const rapportsService = {
  /**
   * Récupère la liste des rapports avec pagination et filtres
   */
  async getRapports(params?: any) {
    const response = await apiClient.get('/rapports', { params });
    return {
      ...response.data,
      rapports: response.data.rapports?.map(normalizeRapport) || [],
    };
  },

  /**
   * Récupère un rapport par son ID
   */
  async getRapportById(id: string) {
    const response = await apiClient.get(`/rapports/${id}`);
    return {
      ...response.data,
      rapport: normalizeRapport(response.data.rapport),
    };
  },

  /**
   * Crée un nouveau rapport
   */
  async createRapport(data: any) {
    const response = await apiClient.post('/rapports', data);
    return response.data;
  },

  /**
   * Met à jour un rapport existant
   */
  async updateRapport(id: string, data: any) {
    const response = await apiClient.put(`/rapports/${id}`, data);
    return response.data;
  },

  /**
   * Supprime un rapport
   */
  async deleteRapport(id: string) {
    const response = await apiClient.delete(`/rapports/${id}`);
    return response.data;
  },
};

export default rapportsService;
