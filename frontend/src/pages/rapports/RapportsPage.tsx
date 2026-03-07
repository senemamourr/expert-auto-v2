import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/layouts/MainLayout';
import { Plus, Eye, Edit, Trash2, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import StatutBadge from '@/components/rapports/StatutBadge';
import RapportsFilters from '@/components/rapports/RapportsFilters';
import apiClient from '@/services/api/api.client';

interface Rapport {
  id: string;
  numeroOrdreService: string;
  numeroSinistre: string;
  typeRapport: string;
  dateVisite: string;
  statut: 'brouillon' | 'en_cours' | 'termine' | 'archive';
  montantTotal: number;
  bureauCode?: string;
  bureauNom?: string;
}

interface Bureau {
  id: string;
  code: string;
  nomAgence: string;
}

export default function RapportsPage() {
  const navigate = useNavigate();
  
  const [rapports, setRapports] = useState<Rapport[]>([]);
  const [bureaux, setBureaux] = useState<Bureau[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  // Filtres
  const [filters, setFilters] = useState<any>({});

  useEffect(() => {
    loadBureaux();
    loadRapports();
  }, [page, filters]);

  const loadBureaux = async () => {
    try {
      const response = await apiClient.get('/bureaux');
      setBureaux(response.data.bureaux || []);
    } catch (error) {
      console.error('Erreur chargement bureaux:', error);
    }
  };

  const loadRapports = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...filters,
      });

      const response = await apiClient.get(`/rapports?${params}`);
      
      setRapports(response.data.rapports || []);
      setTotal(response.data.total || 0);
      setTotalPages(response.data.totalPages || 1);
    } catch (error: any) {
      console.error('Erreur chargement rapports:', error);
      setError(error.response?.data?.error || 'Erreur lors du chargement des rapports');
      setRapports([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page
  };

  const handleResetFilters = () => {
    setFilters({});
    setPage(1);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce rapport ?')) return;
    
    try {
      await apiClient.delete(`/rapports/${id}`);
      loadRapports(); // Reload list
    } catch (error) {
      console.error('Erreur suppression:', error);
      alert('Erreur lors de la suppression du rapport');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      estimatif_reparation: 'Estimatif réparation',
      valeur_venale: 'Valeur vénale',
      tierce_expertise: 'Tierce expertise',
    };
    return labels[type] || type;
  };

  if (error && rapports.length === 0) {
    return (
      <MainLayout title="Rapports">
        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
          <p className="text-red-800">{error}</p>
          <button
            onClick={loadRapports}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Réessayer
          </button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Rapports">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Rapports d'expertise</h1>
          <p className="text-gray-600 mt-1">Gérez vos rapports d'expertise automobile</p>
        </div>
        <button
          onClick={() => navigate('/rapports/nouveau')}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nouveau rapport
        </button>
      </div>

      {/* Filtres */}
      <RapportsFilters 
        bureaux={bureaux}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-2 text-gray-600">Chargement...</p>
          </div>
        ) : rapports.length === 0 ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun rapport trouvé</h3>
            <p className="text-gray-600 mb-6">
              {Object.keys(filters).length > 0 
                ? 'Aucun rapport ne correspond à vos critères.'
                : 'Commencez par créer votre premier rapport.'}
            </p>
            {Object.keys(filters).length === 0 && (
              <button
                onClick={() => navigate('/rapports/nouveau')}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="h-5 w-5 mr-2" />
                Créer un rapport
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
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
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {rapports.map((rapport) => (
                    <tr key={rapport.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {rapport.numeroOrdreService}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{rapport.numeroSinistre}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          {rapport.bureauCode || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          {getTypeLabel(rapport.typeRapport)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          {formatDate(rapport.dateVisite)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatutBadge statut={rapport.statut} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {rapport.montantTotal.toLocaleString('fr-FR')} F
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => navigate(`/rapports/${rapport.id}`)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                            title="Voir les détails"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => navigate(`/rapports/${rapport.id}/modifier`)}
                            className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                            title="Modifier"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(rapport.id)}
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Affichage de{' '}
                    <span className="font-medium">{(page - 1) * limit + 1}</span> à{' '}
                    <span className="font-medium">
                      {Math.min(page * limit, total)}
                    </span>{' '}
                    sur <span className="font-medium">{total}</span> résultats
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                      className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (page <= 3) {
                          pageNum = i + 1;
                        } else if (page >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = page - 2 + i;
                        }
                        
                        return (
                          <button
                            key={i}
                            onClick={() => setPage(pageNum)}
                            className={`px-3 py-1 rounded-lg ${
                              pageNum === page
                                ? 'bg-blue-600 text-white'
                                : 'border border-gray-300 hover:bg-gray-100'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => setPage(page + 1)}
                      disabled={page === totalPages}
                      className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
}
