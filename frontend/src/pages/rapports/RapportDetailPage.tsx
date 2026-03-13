import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { rapportsService } from '../../services/api/rapports.service';

export default function RapportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [rapport, setRapport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      loadRapport(id);
    }
  }, [id]);

  const loadRapport = async (rapportId: string) => {
    try {
      setLoading(true);
      setError('');
      
      console.log('🔍 Chargement rapport:', rapportId);
      
      const response = await rapportsService.getRapportById(rapportId);
      
      console.log('📥 Response complète:', response);
      
      if (response) {
        // Le service retourne directement {success: true, rapport: {...}}
        // OU {rapport: {...}}
        const rapportData = response.rapport || response;
        
        console.log('✅ Rapport chargé:', rapportData);
        setRapport(rapportData);
      } else {
        setError('Aucune donnée retournée par le serveur');
      }
    } catch (err: any) {
      console.error('❌ Erreur chargement rapport:', err);
      console.error('❌ Erreur response:', err.response);
      setError(err.response?.error || err.message || 'Erreur lors du chargement du rapport');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !window.confirm('Êtes-vous sûr de vouloir supprimer ce rapport ?')) {
      return;
    }

    try {
      await rapportsService.deleteRapport(id);
      navigate('/rapports');
    } catch (err: any) {
      alert('Erreur lors de la suppression : ' + (err.response?.data?.error || err.message));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du rapport...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
            <p className="font-semibold">Erreur</p>
            <p>{error}</p>
          </div>
          <button
            onClick={() => navigate('/rapports')}
            className="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Retour à la liste
          </button>
        </div>
      </div>
    );
  }

  if (!rapport) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <p className="text-gray-600">Rapport non trouvé</p>
          <button
            onClick={() => navigate('/rapports')}
            className="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Retour à la liste
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* En-tête */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Rapport {rapport.numeroOrdreService}
            </h1>
            <p className="text-gray-600 mt-1">
              Sinistre : {rapport.numeroSinistre}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/rapports/modifier/${id}`)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              ✏️ Modifier
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              🗑️ Supprimer
            </button>
          </div>
        </div>

        {/* Informations générales */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Informations générales</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Type de rapport</p>
              <p className="font-medium">{rapport.typeRapport || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Statut</p>
              <p className="font-medium">
                <span className={`px-2 py-1 rounded text-xs ${
                  rapport.statut === 'brouillon' ? 'bg-gray-200 text-gray-800' :
                  rapport.statut === 'en_cours' ? 'bg-blue-200 text-blue-800' :
                  rapport.statut === 'valide' ? 'bg-green-200 text-green-800' :
                  'bg-purple-200 text-purple-800'
                }`}>
                  {rapport.statut || 'N/A'}
                </span>
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Date du sinistre</p>
              <p className="font-medium">
                {rapport.dateSinistre ? new Date(rapport.dateSinistre).toLocaleDateString('fr-FR') : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Bureau</p>
              <p className="font-medium">
                {rapport.bureauCode || 'N/A'} - {rapport.bureauNom || 'Non spécifié'}
              </p>
            </div>
          </div>
        </div>

        {/* Véhicule */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Véhicule</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Marque</p>
              <p className="font-medium">{rapport.vehiculeMarque || 'Non spécifié'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Type/Modèle</p>
              <p className="font-medium">{rapport.vehiculeType || 'Non spécifié'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Genre</p>
              <p className="font-medium">{rapport.vehiculeGenre || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Immatriculation</p>
              <p className="font-medium">{rapport.vehiculeImmatriculation || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">N° Châssis</p>
              <p className="font-medium">{rapport.vehiculeChassis || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Kilométrage</p>
              <p className="font-medium">{rapport.vehiculeKilometrage ? `${rapport.vehiculeKilometrage} km` : 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Couleur</p>
              <p className="font-medium">{rapport.vehiculeCouleur || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Source d'énergie</p>
              <p className="font-medium">{rapport.vehiculeSourceEnergie || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Assuré */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Assuré</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Nom complet</p>
              <p className="font-medium">
                {rapport.assureNom || 'N/A'} {rapport.assurePrenom || ''}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Téléphone</p>
              <p className="font-medium">{rapport.assureTelephone || 'N/A'}</p>
            </div>
            <div className="col-span-2">
              <p className="text-sm text-gray-600">Adresse</p>
              <p className="font-medium">{rapport.assureAdresse || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Honoraires */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Honoraires</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Montant de base</p>
              <p className="font-medium">{rapport.honorairesBase ? `${rapport.honorairesBase} F CFA` : '0 F CFA'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Frais de déplacement</p>
              <p className="font-medium">{rapport.honorairesDeplacement ? `${rapport.honorairesDeplacement} F CFA` : '0 F CFA'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total honoraires</p>
              <p className="font-medium text-blue-600">{rapport.honorairesTotal ? `${rapport.honorairesTotal} F CFA` : '0 F CFA'}</p>
            </div>
          </div>
        </div>

        {/* Section Chocs - À venir */}
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 mb-6 text-center">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">🔧 Chocs et Réparations</h2>
          <p className="text-gray-600 mb-4">Cette section sera disponible prochainement</p>
          <button
            disabled
            className="px-6 py-3 bg-gray-400 text-white rounded cursor-not-allowed"
          >
            ➕ Ajouter un choc
          </button>
        </div>

        {/* Montant total */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-gray-900">MONTANT TOTAL</span>
            <span className="text-2xl font-bold text-blue-600">
              {rapport.montantTotal ? `${rapport.montantTotal} F CFA` : '0 F CFA'}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-between">
          <button
            onClick={() => navigate('/rapports')}
            className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            ← Retour à la liste
          </button>
          <button
            disabled
            className="px-6 py-2 bg-gray-400 text-white rounded cursor-not-allowed"
          >
            📄 Exporter PDF (bientôt)
          </button>
        </div>
      </div>
    </div>
  );
}
