import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/layouts/MainLayout';
import { Save, X, ArrowLeft } from 'lucide-react';
import apiClient from '@/services/api/api.client';

interface Bureau {
  id: string;
  code: string;
  nomAgence: string;
}

export default function CreateRapportPage() {
  const navigate = useNavigate();
  
  const [bureaux, setBureaux] = useState<Bureau[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Champs du formulaire
  const [numeroOrdreService, setNumeroOrdreService] = useState('');
  const [numeroSinistre, setNumeroSinistre] = useState('');
  const [typeRapport, setTypeRapport] = useState('estimatif_reparation');
  const [dateVisite, setDateVisite] = useState(new Date().toISOString().split('T')[0]);
  const [bureauId, setBureauId] = useState('');
  const [statut, setStatut] = useState('brouillon');

  // Véhicule
  const [vehiculeGenre, setVehiculeGenre] = useState('');
  const [vehiculeMarque, setVehiculeMarque] = useState('');
  const [vehiculeModele, setVehiculeModele] = useState('');
  const [vehiculeImmatriculation, setVehiculeImmatriculation] = useState('');
  const [vehiculeChassis, setVehiculeChassis] = useState('');
  const [vehiculeDateMec, setVehiculeDateMec] = useState('');
  const [vehiculeKilometrage, setVehiculeKilometrage] = useState('');

  // Assuré
  const [assureNom, setAssureNom] = useState('');
  const [assurePrenom, setAssurePrenom] = useState('');
  const [assureTelephone, setAssureTelephone] = useState('');
  const [assureAdresse, setAssureAdresse] = useState('');

  // Montants
  const [montantPieces, setMontantPieces] = useState('0');
  const [montantMainOeuvre, setMontantMainOeuvre] = useState('0');
  const [montantPeinture, setMontantPeinture] = useState('0');
  const [montantFournitures, setMontantFournitures] = useState('0');

  // Honoraires
  const [honorairesBase, setHonorairesBase] = useState('25000');
  const [honorairesDeplacement, setHonorairesDeplacement] = useState('0');

  // Observations
  const [observations, setObservations] = useState('');

  useEffect(() => {
    loadBureaux();
  }, []);

  const loadBureaux = async () => {
    try {
      const response = await apiClient.get('/bureaux');
      setBureaux(response.data.bureaux || []);
    } catch (error) {
      console.error('Erreur chargement bureaux:', error);
    }
  };

  const calculerMontantTotal = () => {
    return (
      parseFloat(montantPieces || '0') +
      parseFloat(montantMainOeuvre || '0') +
      parseFloat(montantPeinture || '0') +
      parseFloat(montantFournitures || '0')
    );
  };

  const calculerHonorairesTotal = () => {
    return (
      parseFloat(honorairesBase || '0') +
      parseFloat(honorairesDeplacement || '0')
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!numeroOrdreService || !numeroSinistre || !typeRapport || !dateVisite || !bureauId) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await apiClient.post('/rapports', {
        numeroOrdreService,
        numeroSinistre,
        typeRapport,
        dateVisite,
        bureauId,
        statut,
        
        vehiculeGenre,
        vehiculeMarque,
        vehiculeModele,
        vehiculeImmatriculation,
        vehiculeChassis,
        vehiculeDateMec: vehiculeDateMec || null,
        vehiculeKilometrage: vehiculeKilometrage ? parseInt(vehiculeKilometrage) : null,
        
        assureNom,
        assurePrenom,
        assureTelephone,
        assureAdresse,
        
        montantPieces: parseFloat(montantPieces || '0'),
        montantMainOeuvre: parseFloat(montantMainOeuvre || '0'),
        montantPeinture: parseFloat(montantPeinture || '0'),
        montantFournitures: parseFloat(montantFournitures || '0'),
        
        honorairesBase: parseFloat(honorairesBase || '0'),
        honorairesDeplacement: parseFloat(honorairesDeplacement || '0'),
        
        observations,
      });

      // Rediriger vers la liste
      navigate('/rapports');
    } catch (error: any) {
      console.error('Erreur création rapport:', error);
      setError(error.response?.data?.error || 'Erreur lors de la création du rapport');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/rapports')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Retour à la liste
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Nouveau rapport d'expertise</h1>
          <p className="text-gray-600 mt-1">Créez un nouveau rapport d'expertise automobile</p>
        </div>

        {/* Erreur */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations principales */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Informations principales</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  N° Ordre de Service <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={numeroOrdreService}
                  onChange={(e) => setNumeroOrdreService(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="OS-2024-001"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  N° Sinistre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={numeroSinistre}
                  onChange={(e) => setNumeroSinistre(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="SIN-2024-12345"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type de rapport <span className="text-red-500">*</span>
                </label>
                <select
                  value={typeRapport}
                  onChange={(e) => setTypeRapport(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="estimatif_reparation">Estimatif de réparation</option>
                  <option value="valeur_venale">Valeur vénale</option>
                  <option value="tierce_expertise">Tierce expertise</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de visite <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={dateVisite}
                  onChange={(e) => setDateVisite(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bureau <span className="text-red-500">*</span>
                </label>
                <select
                  value={bureauId}
                  onChange={(e) => setBureauId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Sélectionner un bureau</option>
                  {bureaux.map((bureau) => (
                    <option key={bureau.id} value={bureau.id}>
                      {bureau.code} - {bureau.nomAgence}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                <select
                  value={statut}
                  onChange={(e) => setStatut(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="brouillon">Brouillon</option>
                  <option value="en_cours">En cours</option>
                  <option value="termine">Terminé</option>
                </select>
              </div>
            </div>
          </div>

          {/* Véhicule */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Véhicule</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Genre</label>
                <input
                  type="text"
                  value={vehiculeGenre}
                  onChange={(e) => setVehiculeGenre(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="VP, VU, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Marque</label>
                <input
                  type="text"
                  value={vehiculeMarque}
                  onChange={(e) => setVehiculeMarque(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Toyota, Peugeot..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Modèle</label>
                <input
                  type="text"
                  value={vehiculeModele}
                  onChange={(e) => setVehiculeModele(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Corolla, 208..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Immatriculation</label>
                <input
                  type="text"
                  value={vehiculeImmatriculation}
                  onChange={(e) => setVehiculeImmatriculation(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="DK-1234-AB"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">N° Chassis</label>
                <input
                  type="text"
                  value={vehiculeChassis}
                  onChange={(e) => setVehiculeChassis(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date MEC</label>
                <input
                  type="date"
                  value={vehiculeDateMec}
                  onChange={(e) => setVehiculeDateMec(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kilométrage</label>
                <input
                  type="number"
                  value={vehiculeKilometrage}
                  onChange={(e) => setVehiculeKilometrage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="50000"
                />
              </div>
            </div>
          </div>

          {/* Assuré */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Assuré</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                <input
                  type="text"
                  value={assureNom}
                  onChange={(e) => setAssureNom(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                <input
                  type="text"
                  value={assurePrenom}
                  onChange={(e) => setAssurePrenom(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                <input
                  type="tel"
                  value={assureTelephone}
                  onChange={(e) => setAssureTelephone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="+221 77 123 45 67"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                <input
                  type="text"
                  value={assureAdresse}
                  onChange={(e) => setAssureAdresse(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Montants */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Montants</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pièces (F CFA)</label>
                <input
                  type="number"
                  value={montantPieces}
                  onChange={(e) => setMontantPieces(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Main d'œuvre (F CFA)</label>
                <input
                  type="number"
                  value={montantMainOeuvre}
                  onChange={(e) => setMontantMainOeuvre(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Peinture (F CFA)</label>
                <input
                  type="number"
                  value={montantPeinture}
                  onChange={(e) => setMontantPeinture(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fournitures (F CFA)</label>
                <input
                  type="number"
                  value={montantFournitures}
                  onChange={(e) => setMontantFournitures(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2 bg-blue-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-900">Montant total</span>
                  <span className="text-xl font-bold text-blue-600">
                    {calculerMontantTotal().toLocaleString('fr-FR')} F CFA
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Honoraires */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Honoraires</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Honoraires de base (F CFA)</label>
                <input
                  type="number"
                  value={honorairesBase}
                  onChange={(e) => setHonorairesBase(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Frais de déplacement (F CFA)</label>
                <input
                  type="number"
                  value={honorairesDeplacement}
                  onChange={(e) => setHonorairesDeplacement(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2 bg-green-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-900">Total honoraires</span>
                  <span className="text-xl font-bold text-green-600">
                    {calculerHonorairesTotal().toLocaleString('fr-FR')} F CFA
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Observations */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Observations</h2>
            <textarea
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Notes, observations, commentaires..."
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/rapports')}
              className="flex items-center px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <X className="h-5 w-5 mr-2" />
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Save className="h-5 w-5 mr-2" />
              {loading ? 'Création...' : 'Créer le rapport'}
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}
