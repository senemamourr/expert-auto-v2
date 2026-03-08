import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { rapportsService } from '../../services/api/rapports.service';
import apiClient from '../../services/api/api.client';

export default function CreateRapportPage() {
  const navigate = useNavigate();
  const { id: rapportId } = useParams();
  const isEditMode = !!rapportId;
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [bureaux, setBureaux] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    // Rapport
    numeroOrdreService: '',
    numeroSinistre: '',
    typeRapport: 'estimatif_reparation',
    dateSinistre: new Date().toISOString().split('T')[0],
    bureauId: '',
    statut: 'brouillon',
    
    // Véhicule
    vehiculeGenre: 'VP',
    vehiculeMarque: '',
    vehiculeType: '',
    vehiculeImmatriculation: '',
    vehiculeChassis: '',
    vehiculeDateMec: '',
    vehiculeKilometrage: '',
    vehiculeCouleur: '',
    vehiculeSourceEnergie: 'essence',
    vehiculePuissanceFiscale: '',
    vehiculeValeurNeuve: '',
    
    // Assuré
    assureNom: '',
    assurePrenom: '',
    assureTelephone: '',
    assureAdresse: '',
    numeroPolice: '', // À stocker dans observations pour l'instant
    
    // Honoraires
    honorairesBase: '',
    honorairesDeplacement: ''
  });

  useEffect(() => {
    loadBureaux();
    if (isEditMode && rapportId) {
      loadRapport(rapportId);
    }
  }, [rapportId]);

  const loadBureaux = async () => {
    try {
      const response = await apiClient.get('/bureaux');
      if (response.data.success && response.data.bureaux) {
        setBureaux(response.data.bureaux);
      }
    } catch (err) {
      console.error('Erreur chargement bureaux:', err);
    }
  };

  const loadRapport = async (id: string) => {
    try {
      setLoading(true);
      const response = await rapportsService.getRapportById(id);
      if (response.data.success && response.data.rapport) {
        const r = response.data.rapport;
        setFormData({
          numeroOrdreService: r.numeroOrdreService || '',
          numeroSinistre: r.numeroSinistre || '',
          typeRapport: r.typeRapport || 'estimatif_reparation',
          dateSinistre: r.dateSinistre?.split('T')[0] || '',
          bureauId: r.bureauId || '',
          statut: r.statut || 'brouillon',
          
          vehiculeGenre: r.vehiculeGenre || 'VP',
          vehiculeMarque: r.vehiculeMarque || '',
          vehiculeType: r.vehiculeType || '',
          vehiculeImmatriculation: r.vehiculeImmatriculation || '',
          vehiculeChassis: r.vehiculeChassis || '',
          vehiculeDateMec: r.vehiculeDateMec?.split('T')[0] || '',
          vehiculeKilometrage: r.vehiculeKilometrage?.toString() || '',
          vehiculeCouleur: r.vehiculeCouleur || '',
          vehiculeSourceEnergie: r.vehiculeSourceEnergie || 'essence',
          vehiculePuissanceFiscale: r.vehiculePuissanceFiscale?.toString() || '',
          vehiculeValeurNeuve: r.vehiculeValeurNeuve?.toString() || '',
          
          assureNom: r.assureNom || '',
          assurePrenom: r.assurePrenom || '',
          assureTelephone: r.assureTelephone || '',
          assureAdresse: r.assureAdresse || '',
          numeroPolice: '', // À extraire des observations si nécessaire
          
          honorairesBase: r.honorairesBase?.toString() || '',
          honorairesDeplacement: r.honorairesDeplacement?.toString() || ''
        });
      }
    } catch (err) {
      console.error('Erreur chargement rapport:', err);
      setError('Erreur lors du chargement du rapport');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const payload: any = {
        numeroOrdreService: formData.numeroOrdreService,
        numeroSinistre: formData.numeroSinistre,
        typeRapport: formData.typeRapport,
        dateSinistre: formData.dateSinistre,
        bureauId: formData.bureauId,
        statut: formData.statut
      };

      // Véhicule (envoyer seulement si au moins la marque est remplie)
      if (formData.vehiculeMarque) {
        payload.vehicule = {
          genre: formData.vehiculeGenre,
          marque: formData.vehiculeMarque,
          type: formData.vehiculeType || undefined,
          immatriculation: formData.vehiculeImmatriculation || undefined,
          numeroSerie: formData.vehiculeChassis || undefined,
          dateMiseEnCirculation: formData.vehiculeDateMec || undefined,
          kilometrage: formData.vehiculeKilometrage ? parseInt(formData.vehiculeKilometrage) : undefined,
          couleur: formData.vehiculeCouleur || undefined,
          sourceEnergie: formData.vehiculeSourceEnergie,
          puissanceFiscale: formData.vehiculePuissanceFiscale ? parseInt(formData.vehiculePuissanceFiscale) : undefined,
          valeurNeuve: formData.vehiculeValeurNeuve ? parseFloat(formData.vehiculeValeurNeuve) : undefined
        };
      }

      // Assuré (envoyer seulement si au moins le nom est rempli)
      if (formData.assureNom) {
        payload.assure = {
          nom: formData.assureNom,
          prenom: formData.assurePrenom || undefined,
          telephone: formData.assureTelephone || undefined,
          adresse: formData.assureAdresse || undefined
        };
      }

      // Honoraires
      if (formData.honorairesBase || formData.honorairesDeplacement) {
        payload.honoraire = {
          montantBase: formData.honorairesBase ? parseFloat(formData.honorairesBase) : 0,
          fraisDeplacement: formData.honorairesDeplacement ? parseFloat(formData.honorairesDeplacement) : 0
        };
      }

      // Observations (inclure le numéro de police)
      if (formData.numeroPolice) {
        payload.observations = `N° Police: ${formData.numeroPolice}`;
      }

      console.log('📤 Payload:', payload);

      let response;
      if (isEditMode) {
        response = await rapportsService.updateRapport(rapportId!, payload);
      } else {
        response = await rapportsService.createRapport(payload);
      }

      if (response.data.success) {
        navigate('/rapports');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Erreur lors de la sauvegarde');
      console.error('Erreur:', err);
    }
  };

  if (loading) {
    return <div className="p-8">Chargement...</div>;
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          {isEditMode ? 'Modifier le rapport' : 'Nouveau rapport'}
        </h1>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* INFORMATIONS DU RAPPORT */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Informations du rapport</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type de rapport *
                </label>
                <select
                  name="typeRapport"
                  value={formData.typeRapport}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="estimatif_reparation">Estimatif de réparation</option>
                  <option value="valeur_venale">Valeur vénale</option>
                  <option value="tierce_expertise">Tierce expertise</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bureau *
                </label>
                <select
                  name="bureauId"
                  value={formData.bureauId}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sélectionner un bureau</option>
                  {bureaux.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.code} - {b.nomAgence}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  N° Ordre de service *
                </label>
                <input
                  type="text"
                  name="numeroOrdreService"
                  value={formData.numeroOrdreService}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="OS-2026-001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  N° Sinistre *
                </label>
                <input
                  type="text"
                  name="numeroSinistre"
                  value={formData.numeroSinistre}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="SIN-2026-001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date du sinistre *
                </label>
                <input
                  type="date"
                  name="dateSinistre"
                  value={formData.dateSinistre}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Statut
                </label>
                <select
                  name="statut"
                  value={formData.statut}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="brouillon">Brouillon</option>
                  <option value="en_cours">En cours</option>
                  <option value="valide">Validé</option>
                  <option value="facture">Facturé</option>
                </select>
              </div>
            </div>
          </div>

          {/* VÉHICULE */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Véhicule</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Genre *
                </label>
                <select
                  name="vehiculeGenre"
                  value={formData.vehiculeGenre}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="VP">VP (Véhicule Particulier)</option>
                  <option value="VU">VU (Véhicule Utilitaire)</option>
                  <option value="MOTO">Moto</option>
                  <option value="PL">PL (Poids Lourd)</option>
                  <option value="QUAD">Quad</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Source d'énergie *
                </label>
                <select
                  name="vehiculeSourceEnergie"
                  value={formData.vehiculeSourceEnergie}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="essence">Essence</option>
                  <option value="diesel">Diesel</option>
                  <option value="electrique">Électrique</option>
                  <option value="hybride">Hybride</option>
                  <option value="gpl">GPL</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Marque
                </label>
                <input
                  type="text"
                  name="vehiculeMarque"
                  value={formData.vehiculeMarque}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Toyota"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type/Modèle
                </label>
                <input
                  type="text"
                  name="vehiculeType"
                  value={formData.vehiculeType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Corolla"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Immatriculation
                </label>
                <input
                  type="text"
                  name="vehiculeImmatriculation"
                  value={formData.vehiculeImmatriculation}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="DK-1234-AB"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  N° Châssis
                </label>
                <input
                  type="text"
                  name="vehiculeChassis"
                  value={formData.vehiculeChassis}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="VIN123456789"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Couleur
                </label>
                <input
                  type="text"
                  name="vehiculeCouleur"
                  value={formData.vehiculeCouleur}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Blanc"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de mise en circulation
                </label>
                <input
                  type="date"
                  name="vehiculeDateMec"
                  value={formData.vehiculeDateMec}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kilométrage
                </label>
                <input
                  type="number"
                  name="vehiculeKilometrage"
                  value={formData.vehiculeKilometrage}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="50000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Puissance fiscale (CV)
                </label>
                <input
                  type="number"
                  name="vehiculePuissanceFiscale"
                  value={formData.vehiculePuissanceFiscale}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="7"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valeur à neuf (F CFA)
                </label>
                <input
                  type="number"
                  name="vehiculeValeurNeuve"
                  value={formData.vehiculeValeurNeuve}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="15000000"
                />
              </div>
            </div>
          </div>

          {/* ASSURÉ */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Assuré</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom
                </label>
                <input
                  type="text"
                  name="assureNom"
                  value={formData.assureNom}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="DIOP"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prénom
                </label>
                <input
                  type="text"
                  name="assurePrenom"
                  value={formData.assurePrenom}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Moussa"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone
                </label>
                <input
                  type="tel"
                  name="assureTelephone"
                  value={formData.assureTelephone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+221 77 123 45 67"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  N° Police d'assurance
                </label>
                <input
                  type="text"
                  name="numeroPolice"
                  value={formData.numeroPolice}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="POL-2026-12345"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adresse
                </label>
                <textarea
                  name="assureAdresse"
                  value={formData.assureAdresse}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Adresse complète"
                />
              </div>
            </div>
          </div>

          {/* HONORAIRES */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Honoraires</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Montant de base (F CFA)
                </label>
                <input
                  type="number"
                  name="honorairesBase"
                  value={formData.honorairesBase}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="25000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Frais de déplacement (F CFA)
                </label>
                <input
                  type="number"
                  name="honorairesDeplacement"
                  value={formData.honorairesDeplacement}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="5000"
                />
              </div>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/rapports')}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {isEditMode ? 'Mettre à jour' : 'Créer le rapport'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
