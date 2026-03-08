import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/layouts/MainLayout';
import { Plus, Eye, Edit, Trash2 } from 'lucide-react';
import StatutBadge from '@/components/rapports/StatutBadge';
// import RapportsFilters from '@/components/rapports/RapportsFilters'; // Temporairement désactivé
import apiClient from '@/services/api/api.client';

interface Rapport {
  id: string;
  numeroOrdreService: string;
  numeroSinistre: string;
  typeRapport: string;
  dateVisite: string;
  statut: string;
  bureauId: string;
  bureauCode?: string;
  bureauNom?: string;
  bureau?: {
    code: string;
    nomAgence: string;
  };
  vehicule?: any;
  assure?: any;
  montantTotal: number;
  honorairesTotal?: number;
  createdAt: string;
}

export default function RapportsPage() {
  const navigate = useNavigate();
  
  const [rapports, setRapports] = useState<Rapport[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [filters, setFilters] = useState({
    statut: '',
    typeRapport: '',
    bureauId: '',
    numeroSinistre: '',
  });

  useEffect(() => {
    loadRapports();
  }, [page, filters]);

  const loadRapports = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/rapports', {
        params: {
          page,
          limit: 10,
          ...filters,
        },
      });

      // NORMALISATION DIRECTE ICI !
      const rapportsNormalized = (response.data.rapports || []).map((r: any) => ({
        ...r,
        // Extraire bureau depuis structure imbriquée
        bureauCode: r.bureau?.code || r.bureauCode || 'N/A',
        bureauNom: r.bureau?.nomAgence || r.bureauNom || 'N/A',
        // Convertir montant en nombre
        montantTotal: parseFloat(r.montantTotal) || 0,
      }));

      setRapports(rapportsNormalized);
      setTotalPages(response.data.pagination?.pages || 1);
    } catch (error) {
      console.error('Erreur chargement rapports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce rapport ?')) return;
    
    try {
      await apiClient.delete(`/rapports/${id}`);
      loadRapports();
    } catch (error) {
      console.error('Erreur suppression:', error);
      alert('Erreur lors de la suppression du rapport');
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      estimatif_reparation: 'Estimatif réparation',
      valeur_venale: 'Valeur vénale',
      tierce_expertise: 'Tierce expertise',
    };
    return labels[type] || type;
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Rapports d'expertise</h1>
            <p className="text-gray-600 mt-1">Gérez vos rapports d'expertise automobile</p>
          </div>
          <button
            onClick={() => navigate('/rapports/nouveau')}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Nouveau rapport
          </button>
        </div>

        {/* Filtres - Temporairement désactivés pour éviter erreur TypeScript */}
        {/* <RapportsFilters
          filters={filters}
          onFiltersChange={setFilters}
        /> */}

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            </div>
          ) : rapports.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Aucun rapport trouvé
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      N° Ordre Service
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      N° Sinistre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bureau
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date Visite
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Montant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {rapports.map((rapport) => (
                    <tr key={rapport.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {rapport.numeroOrdreService}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {rapport.numeroSinistre}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {rapport.bureauCode} - {rapport.bureauNom}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {getTypeLabel(rapport.typeRapport)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(rapport.dateVisite).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatutBadge statut={rapport.statut as any} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {rapport.montantTotal.toLocaleString('fr-FR')} F
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => navigate(`/rapports/${rapport.id}`)}
                            className="p-1 text-blue-600 hover:text-blue-800"
                            title="Voir les détails"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => navigate(`/rapports/${rapport.id}/modifier`)}
                            className="p-1 text-green-600 hover:text-green-800"
                            title="Modifier"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(rapport.id)}
                            className="p-1 text-red-600 hover:text-red-800"
                            title="Supprimer"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center space-x-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Précédent
            </button>
            <span className="text-sm text-gray-600">
              Page {page} sur {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Suivant
            </button>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
