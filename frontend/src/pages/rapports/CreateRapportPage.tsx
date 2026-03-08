import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  
  const [bureaux, setBureaux] = useState<Bureau[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingRapport, setLoadingRapport] = useState(false);
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
    if (isEditMode && id) {
      loadRapport(id);
    }
  }, [isEditMode, id]);

  const loadBureaux = async () => {
    try {
      const response = await apiClient.get('/bureaux');
      setBureaux(response.data.bureaux || []);
    } catch (error) {
      console.error('Erreur chargement bureaux:', error);
    }
  };

  const loadRapport = async (rapportId: string) => {
    setLoadingRapport(true);
    try {
      const response = await apiClient.get(`/rapports/${rapportId}`);
      const data = response.data.rapport;

      console.log('📊 ===== DONNÉES DU RAPPORT CHARGÉ =====');
      console.log('🔍 Rapport complet:', data);
      console.log('🚗 data.vehicule:', data.vehicule);
      console.log('👤 data.assure:', data.assure);
      console.log('📝 data.observations:', data.observations);
      console.log('💰 data.montantPieces:', data.montantPieces);
      console.log('========================================');

      // Pré-remplir tous les champs avec gestion stricte des valeurs
      setNumeroOrdreService(data.numeroOrdreService ?? '');
      setNumeroSinistre(data.numeroSinistre ?? '');
      setTypeRapport(data.typeRapport ?? 'estimatif_reparation');
      setDateVisite(data.dateVisite ? data.dateVisite.split('T')[0] : new Date().toISOString().split('T')[0]);
      setBureauId(data.bureauId ?? '');
      setStatut(data.statut ?? 'brouillon');

      // Véhicule - gérer structure imbriquée OU plate
      const vehicule = data.vehicule || {};
      console.log('🔧 vehicule extrait:', vehicule);
      console.log('🔧 vehicule.marque:', vehicule.marque);
      console.log('🔧 data.vehiculeMarque:', data.vehiculeMarque);
      
      const marque = vehicule.marque || data.vehiculeMarque || '';
      console.log('✅ Marque finale à setter:', marque);
      setVehiculeGenre(vehicule.genre || data.vehiculeGenre || '');
      setVehiculeMarque(marque);
      setVehiculeModele(vehicule.modele || data.vehiculeModele || '');
      setVehiculeImmatriculation(vehicule.immatriculation || data.vehiculeImmatriculation || '');
      setVehiculeChassis(vehicule.numeroSerie || data.vehiculeChassis || '');
      setVehiculeDateMec(vehicule.dateMiseEnCirculation ? vehicule.dateMiseEnCirculation.split('T')[0] : (data.vehiculeDateMec ? data.vehiculeDateMec.split('T')[0] : ''));
      setVehiculeKilometrage(vehicule.kilometrage != null ? vehicule.kilometrage.toString() : (data.vehiculeKilometrage != null ? data.vehiculeKilometrage.toString() : ''));

      // Assuré - gérer structure imbriquée OU plate
      const assure = data.assure || {};
      console.log('🔧 assure extrait:', assure);
      console.log('🔧 assure.nom:', assure.nom);
      console.log('🔧 data.assureNom:', data.assureNom);
      
      const nom = assure.nom || data.assureNom || '';
      console.log('✅ Nom final à setter:', nom);
      setAssureNom(nom);
      setAssurePrenom(assure.prenom || data.assurePrenom || '');
      setAssureTelephone(assure.telephone || data.assureTelephone || '');
      setAssureAdresse(assure.adresse || data.assureAdresse || '');

      // Montants - convertir en string, 0 si null/undefined
      setMontantPieces(data.montantPieces != null ? data.montantPieces.toString() : '0');
      setMontantMainOeuvre(data.montantMainOeuvre != null ? data.montantMainOeuvre.toString() : '0');
      setMontantPeinture(data.montantPeinture != null ? data.montantPeinture.toString() : '0');
      setMontantFournitures(data.montantFournitures != null ? data.montantFournitures.toString() : '0');

      // Honoraires - gérer structure imbriquée OU plate
      const honoraire = data.honoraire || {};
      setHonorairesBase(honoraire.montantBase != null ? honoraire.montantBase.toString() : (data.honorairesBase != null ? data.honorairesBase.toString() : '25000'));
      setHonorairesDeplacement(honoraire.fraisDeplacement != null ? honoraire.fraisDeplacement.toString() : (data.honorairesDeplacement != null ? data.honorairesDeplacement.toString() : '0'));

      // Observations
      const obs = data.observations ?? '';
      console.log('✅ Observations finales à setter:', obs);
      setObservations(obs);

      console.log('✅ ===== CHAMPS PRÉ-REMPLIS AVEC SUCCÈS =====');
    } catch (error: any) {
      console.error('❌ Erreur chargement rapport:', error);
      setError('Erreur lors du chargement du rapport');
    } finally {
      setLoadingRapport(false);
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
      // TRANSFORMATION : Structure plate → Structure imbriquée pour Sequelize
      const payload = {
        numeroOrdreService,
        numeroSinistre,
        typeRapport,
        dateSinistre: dateVisite,
        bureauId,
        statut,
        
        // Véhicule - Objet imbriqué
        vehicule: vehiculeMarque || vehiculeModele || vehiculeImmatriculation ? {
          genre: vehiculeGenre || null,
          marque: vehiculeMarque || null,
          modele: vehiculeModele || null,
          immatriculation: vehiculeImmatriculation || null,
          numeroSerie: vehiculeChassis || null,
          dateMiseEnCirculation: vehiculeDateMec || null,
          kilometrage: vehiculeKilometrage ? parseInt(vehiculeKilometrage) : null,
        } : null,
        
        // Assuré - Objet imbriqué
        assure: assureNom || assurePrenom ? {
          nom: assureNom || null,
          prenom: assurePrenom || null,
          telephone: assureTelephone || null,
          adresse: assureAdresse || null,
        } : null,
        
        // Montants - Rester au niveau racine
        montantPieces: parseFloat(montantPieces || '0'),
        montantMainOeuvre: parseFloat(montantMainOeuvre || '0'),
        montantPeinture: parseFloat(montantPeinture || '0'),
        montantFournitures: parseFloat(montantFournitures || '0'),
        
        // Honoraires - Objet imbriqué
        honoraire: {
          montantBase: parseFloat(honorairesBase || '0'),
          fraisDeplacement: parseFloat(honorairesDeplacement || '0'),
        },
        
        observations,
      };

      console.log('📤 Payload envoyé au backend:', payload);

      if (isEditMode && id) {
        await apiClient.put(`/rapports/${id}`, payload);
      } else {
        await apiClient.post('/rapports', payload);
      }

      // Rediriger vers la liste
      navigate('/rapports');
    } catch (error: any) {
      console.error('Erreur:', error);
      setError(error.response?.data?.error || `Erreur lors de ${isEditMode ? 'la modification' : 'la création'} du rapport`);
    } finally {
      setLoading(false);
    }
  };

  if (loadingRapport) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
        </div>
      </MainLayout>
    );
  }

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
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditMode ? 'Modifier le rapport' : 'Nouveau rapport d\'expertise'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEditMode ? 'Modifiez les informations du rapport' : 'Créez un nouveau rapport d\'expertise automobile'}
          </p>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="VP, VU, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Marque</label>
                <input
                  type="text"
                  value={vehiculeMarque}
                  onChange={(e) => setVehiculeMarque(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Toyota, Peugeot..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Modèle</label>
                <input
                  type="text"
                  value={vehiculeModele}
                  onChange={(e) => setVehiculeModele(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Corolla, 208..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Immatriculation</label>
                <input
                  type="text"
                  value={vehiculeImmatriculation}
                  onChange={(e) => setVehiculeImmatriculation(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="DK-1234-AB"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">N° Chassis</label>
                <input
                  type="text"
                  value={vehiculeChassis}
                  onChange={(e) => setVehiculeChassis(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date MEC</label>
                <input
                  type="date"
                  value={vehiculeDateMec}
                  onChange={(e) => setVehiculeDateMec(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kilométrage</label>
                <input
                  type="number"
                  value={vehiculeKilometrage}
                  onChange={(e) => setVehiculeKilometrage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                <input
                  type="text"
                  value={assurePrenom}
                  onChange={(e) => setAssurePrenom(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                <input
                  type="tel"
                  value={assureTelephone}
                  onChange={(e) => setAssureTelephone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="+221 77 123 45 67"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                <input
                  type="text"
                  value={assureAdresse}
                  onChange={(e) => setAssureAdresse(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Main d'œuvre (F CFA)</label>
                <input
                  type="number"
                  value={montantMainOeuvre}
                  onChange={(e) => setMontantMainOeuvre(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Peinture (F CFA)</label>
                <input
                  type="number"
                  value={montantPeinture}
                  onChange={(e) => setMontantPeinture(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fournitures (F CFA)</label>
                <input
                  type="number"
                  value={montantFournitures}
                  onChange={(e) => setMontantFournitures(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Frais de déplacement (F CFA)</label>
                <input
                  type="number"
                  value={honorairesDeplacement}
                  onChange={(e) => setHonorairesDeplacement(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              {loading ? (isEditMode ? 'Modification...' : 'Création...') : (isEditMode ? 'Modifier le rapport' : 'Créer le rapport')}
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}
