import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/layouts/MainLayout';
import { ArrowLeft, Edit, Trash2, FileText } from 'lucide-react';
import StatutBadge from '@/components/rapports/StatutBadge';
import apiClient from '@/services/api/api.client';

interface Rapport {
  id: string;
  numeroOrdreService: string;
  numeroSinistre: string;
  typeRapport: string;
  dateVisite: string;
  statut: 'brouillon' | 'en_cours' | 'termine' | 'archive';
  
  bureauId: string;
  bureauCode: string;
  bureauNom: string;
  
  vehiculeGenre?: string;
  vehiculeMarque?: string;
  vehiculeModele?: string;
  vehiculeImmatriculation?: string;
  vehiculeChassis?: string;
  vehiculeDateMec?: string;
  vehiculeKilometrage?: number;
  
  assureNom?: string;
  assurePrenom?: string;
  assureTelephone?: string;
  assureAdresse?: string;
  
  montantPieces: number;
  montantMainOeuvre: number;
  montantPeinture: number;
  montantFournitures: number;
  montantTotal: number;
  
  honorairesBase: number;
  honorairesDeplacement: number;
  honorairesTotal: number;
  
  observations?: string;
  createdAt: string;
}

export default function RapportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [rapport, setRapport] = useState<Rapport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadRapport();
    }
  }, [id]);

  const loadRapport = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.get(`/rapports/${id}`);
      const data = response.data.rapport;
      
      // Extraire les infos du bureau (structure imbriquée)
      const rapport = {
        ...data,
        bureauCode: data.bureau?.code || 'N/A',
        bureauNom: data.bureau?.nomAgence || 'N/A',
      };
      
      setRapport(rapport);
    } catch (error: any) {
      console.error('Erreur chargement rapport:', error);
      setError(error.response?.data?.error || 'Erreur lors du chargement du rapport');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce rapport ?')) return;
    
    try {
      await apiClient.delete(`/rapports/${id}`);
      navigate('/rapports');
    } catch (error) {
      console.error('Erreur suppression:', error);
      alert('Erreur lors de la suppression du rapport');
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      estimatif_reparation: 'Estimatif de réparation',
      valeur_venale: 'Valeur vénale',
      tierce_expertise: 'Tierce expertise',
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <MainLayout title="Chargement...">
        <div className="flex items-center justify-center h-64">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
        </div>
      </MainLayout>
    );
  }

  if (error || !rapport) {
    return (
      <MainLayout title="Erreur">
        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded">
          <p className="text-red-800">{error || 'Rapport non trouvé'}</p>
          <button
            onClick={() => navigate('/rapports')}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retour à la liste
          </button>
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
          
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  {rapport.numeroOrdreService}
                </h1>
                <StatutBadge statut={rapport.statut} />
              </div>
              <p className="text-gray-600">
                N° Sinistre: {rapport.numeroSinistre} • {getTypeLabel(rapport.typeRapport)}
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate(`/rapports/${id}/modifier`)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit className="h-5 w-5 mr-2" />
                Modifier
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 className="h-5 w-5 mr-2" />
                Supprimer
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Informations principales */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Informations principales</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Date de visite</p>
                <p className="font-medium">
                  {rapport.dateVisite 
                    ? new Date(rapport.dateVisite).toLocaleDateString('fr-FR') 
                    : 'Non renseignée'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Bureau</p>
                <p className="font-medium">{rapport.bureauCode} - {rapport.bureauNom}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date de création</p>
                <p className="font-medium">
                  {rapport.createdAt 
                    ? new Date(rapport.createdAt).toLocaleDateString('fr-FR') 
                    : 'Non renseignée'}
                </p>
              </div>
            </div>
          </div>

          {/* Véhicule */}
          {(rapport.vehiculeMarque || rapport.vehiculeModele) && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Véhicule</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rapport.vehiculeGenre && (
                  <div>
                    <p className="text-sm text-gray-600">Genre</p>
                    <p className="font-medium">{rapport.vehiculeGenre}</p>
                  </div>
                )}
                {rapport.vehiculeMarque && (
                  <div>
                    <p className="text-sm text-gray-600">Marque</p>
                    <p className="font-medium">{rapport.vehiculeMarque}</p>
                  </div>
                )}
                {rapport.vehiculeModele && (
                  <div>
                    <p className="text-sm text-gray-600">Modèle</p>
                    <p className="font-medium">{rapport.vehiculeModele}</p>
                  </div>
                )}
                {rapport.vehiculeImmatriculation && (
                  <div>
                    <p className="text-sm text-gray-600">Immatriculation</p>
                    <p className="font-medium">{rapport.vehiculeImmatriculation}</p>
                  </div>
                )}
                {rapport.vehiculeChassis && (
                  <div>
                    <p className="text-sm text-gray-600">N° Chassis</p>
                    <p className="font-medium">{rapport.vehiculeChassis}</p>
                  </div>
                )}
                {rapport.vehiculeKilometrage && (
                  <div>
                    <p className="text-sm text-gray-600">Kilométrage</p>
                    <p className="font-medium">
                      {typeof rapport.vehiculeKilometrage === 'number' 
                        ? rapport.vehiculeKilometrage.toLocaleString('fr-FR') 
                        : rapport.vehiculeKilometrage} km
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Assuré */}
          {(rapport.assureNom || rapport.assurePrenom) && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Assuré</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(rapport.assureNom || rapport.assurePrenom) && (
                  <div>
                    <p className="text-sm text-gray-600">Nom complet</p>
                    <p className="font-medium">{rapport.assurePrenom} {rapport.assureNom}</p>
                  </div>
                )}
                {rapport.assureTelephone && (
                  <div>
                    <p className="text-sm text-gray-600">Téléphone</p>
                    <p className="font-medium">{rapport.assureTelephone}</p>
                  </div>
                )}
                {rapport.assureAdresse && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-600">Adresse</p>
                    <p className="font-medium">{rapport.assureAdresse}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Montants */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Montants de réparation</h2>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Pièces</span>
                <span className="font-medium">
                  {typeof rapport.montantPieces === 'number' 
                    ? rapport.montantPieces.toLocaleString('fr-FR') 
                    : '0'} F CFA
                </span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Main d'œuvre</span>
                <span className="font-medium">
                  {typeof rapport.montantMainOeuvre === 'number' 
                    ? rapport.montantMainOeuvre.toLocaleString('fr-FR') 
                    : '0'} F CFA
                </span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Peinture</span>
                <span className="font-medium">
                  {typeof rapport.montantPeinture === 'number' 
                    ? rapport.montantPeinture.toLocaleString('fr-FR') 
                    : '0'} F CFA
                </span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Fournitures</span>
                <span className="font-medium">
                  {typeof rapport.montantFournitures === 'number' 
                    ? rapport.montantFournitures.toLocaleString('fr-FR') 
                    : '0'} F CFA
                </span>
              </div>
              <div className="flex justify-between py-3 bg-blue-50 px-4 rounded-lg">
                <span className="font-semibold text-gray-900">Total réparation</span>
                <span className="text-xl font-bold text-blue-600">
                  {typeof rapport.montantTotal === 'number' 
                    ? rapport.montantTotal.toLocaleString('fr-FR') 
                    : '0'} F CFA
                </span>
              </div>
            </div>
          </div>

          {/* Honoraires */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Honoraires</h2>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Honoraires de base</span>
                <span className="font-medium">
                  {typeof rapport.honorairesBase === 'number' 
                    ? rapport.honorairesBase.toLocaleString('fr-FR') 
                    : '0'} F CFA
                </span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Frais de déplacement</span>
                <span className="font-medium">
                  {typeof rapport.honorairesDeplacement === 'number' 
                    ? rapport.honorairesDeplacement.toLocaleString('fr-FR') 
                    : '0'} F CFA
                </span>
              </div>
              <div className="flex justify-between py-3 bg-green-50 px-4 rounded-lg">
                <span className="font-semibold text-gray-900">Total honoraires</span>
                <span className="text-xl font-bold text-green-600">
                  {typeof rapport.honorairesTotal === 'number' 
                    ? rapport.honorairesTotal.toLocaleString('fr-FR') 
                    : '0'} F CFA
                </span>
              </div>
            </div>
          </div>

          {/* Observations */}
          {rapport.observations && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Observations</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{rapport.observations}</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
