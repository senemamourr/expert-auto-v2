import { useEffect } from 'react';
import { MainLayout } from '@/layouts/MainLayout';
import { useStatsStore } from '@/stores/statsStore';
import { TrendingUp, FileText, DollarSign, Calendar, CheckCircle } from 'lucide-react';

export default function DashboardPage() {
  const { kpis, revenus, fetchKPIs, fetchRevenus, isLoading, error } = useStatsStore();

  useEffect(() => {
    fetchKPIs();
    fetchRevenus({ annee: new Date().getFullYear() });
  }, []);

  // Calculer les revenus du mois en cours
  const revenusMoisActuel = revenus?.revenus.find(
    r => r.mois === new Date().getMonth() + 1
  )?.total || 0;

  if (error) {
    return (
      <MainLayout title="Dashboard">
        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700 font-medium">Erreur de chargement : {error}</p>
            </div>
          </div>
          <button
            onClick={() => {
              fetchKPIs();
              fetchRevenus();
            }}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Pas de title prop car on va mettre un header custom */}
      
      {/* Header custom avec date */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          {new Date().toLocaleDateString('fr-FR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      {/* Loading State */}
      {isLoading && !kpis ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Cartes KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Rapports */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Rapports totaux</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {kpis?.totalRapports || 0}
                  </p>
                  <p className="text-sm text-green-600 mt-2 flex items-center">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    +{kpis?.rapportsMois || 0} ce mois
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Rapports ce mois */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ce mois</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {kpis?.rapportsMois || 0}
                  </p>
                  <p className="text-sm text-green-600 mt-2 flex items-center">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    +{Math.round(((kpis?.rapportsMois || 0) / (kpis?.totalRapports || 1)) * 100)}% du total
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <Calendar className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </div>

            {/* Revenus mensuels */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Revenus mensuels</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {revenusMoisActuel.toLocaleString('fr-FR')} F CFA
                  </p>
                  <p className="text-sm text-green-600 mt-2 flex items-center">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    +15% ce mois
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <DollarSign className="h-8 w-8 text-purple-600" />
                </div>
              </div>
            </div>

            {/* Rapports terminés */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Rapports terminés</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {kpis?.statuts.termine || 0}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    {kpis?.statuts.brouillon || 0} brouillons
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Statuts des rapports */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Répartition par statut */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Répartition par statut
              </h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-gray-400 rounded-full mr-2"></div>
                    <span className="text-sm text-gray-700">Brouillons</span>
                  </div>
                  <span className="font-semibold">{kpis?.statuts.brouillon || 0}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-yellow-400 rounded-full mr-2"></div>
                    <span className="text-sm text-gray-700">En cours</span>
                  </div>
                  <span className="font-semibold">{kpis?.statuts.en_cours || 0}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-sm text-gray-700">Terminés</span>
                  </div>
                  <span className="font-semibold">{kpis?.statuts.termine || 0}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                    <span className="text-sm text-gray-700">Archivés</span>
                  </div>
                  <span className="font-semibold">{kpis?.statuts.archive || 0}</span>
                </div>
              </div>
            </div>

            {/* Statistiques rapides */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Statistiques rapides
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm text-gray-600">Rapports cette semaine</span>
                  <span className="font-semibold text-gray-900">{kpis?.rapportsSemaine || 0}</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm text-gray-600">Honoraires totaux</span>
                  <span className="font-semibold text-gray-900">
                    {(kpis?.honorairesTotal || 0).toLocaleString('fr-FR')} F CFA
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm text-gray-600">Montant total</span>
                  <span className="font-semibold text-gray-900">
                    {(kpis?.montantTotal || 0).toLocaleString('fr-FR')} F CFA
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-600">Moyenne par rapport</span>
                  <span className="font-semibold text-gray-900">
                    {kpis?.totalRapports ? 
                      Math.round((kpis.honorairesTotal || 0) / kpis.totalRapports).toLocaleString('fr-FR') : 
                      0
                    } F CFA
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
