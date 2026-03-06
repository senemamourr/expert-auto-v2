import { useEffect } from 'react';
import { useStatsStore } from '@/stores/statsStore';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, PieChart, Pie, Cell 
} from 'recharts';
import { 
  TrendingUp, TrendingDown, FileText, DollarSign, 
  Calendar, CheckCircle, Clock, Archive 
} from 'lucide-react';

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

  // Préparer les données pour le graphique en aires
  const revenusChartData = revenus?.revenus.map(r => ({
    mois: r.nom,
    revenus: r.total,
    rapports: r.nombreRapports
  })) || [];

  // Données pour le pie chart des statuts
  const statutsData = [
    { name: 'Brouillons', value: kpis?.statuts.brouillon || 0, color: '#9CA3AF' },
    { name: 'En cours', value: kpis?.statuts.en_cours || 0, color: '#FBBF24' },
    { name: 'Terminés', value: kpis?.statuts.termine || 0, color: '#10B981' },
    { name: 'Archivés', value: kpis?.statuts.archive || 0, color: '#3B82F6' },
  ];

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700 font-medium">
                Erreur de chargement : {error}
              </p>
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
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* En-tête élégant */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-8 text-white">
        <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
        <p className="text-blue-100 text-lg">
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
            <div key={i} className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-10 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Cartes KPIs Premium */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Rapports */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-transform duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <FileText className="h-8 w-8" />
                </div>
                <div className="text-right">
                  <p className="text-sm text-blue-100 font-medium mb-1">Rapports totaux</p>
                  <p className="text-4xl font-bold">{kpis?.totalRapports || 0}</p>
                </div>
              </div>
              <div className="flex items-center text-sm text-blue-100">
                <TrendingUp className="h-4 w-4 mr-1" />
                +{kpis?.rapportsMois || 0} ce mois
              </div>
            </div>

            {/* Rapports ce mois */}
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-transform duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Calendar className="h-8 w-8" />
                </div>
                <div className="text-right">
                  <p className="text-sm text-green-100 font-medium mb-1">Ce mois</p>
                  <p className="text-4xl font-bold">{kpis?.rapportsMois || 0}</p>
                </div>
              </div>
              <div className="flex items-center text-sm text-green-100">
                <TrendingUp className="h-4 w-4 mr-1" />
                {kpis?.totalRapports ? Math.round(((kpis.rapportsMois || 0) / kpis.totalRapports) * 100) : 0}% du total
              </div>
            </div>

            {/* Revenus mensuels */}
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-transform duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <DollarSign className="h-8 w-8" />
                </div>
                <div className="text-right">
                  <p className="text-sm text-purple-100 font-medium mb-1">Revenus mois</p>
                  <p className="text-3xl font-bold">{(revenusMoisActuel / 1000).toFixed(0)}K</p>
                </div>
              </div>
              <div className="text-xs text-purple-100">
                {revenusMoisActuel.toLocaleString('fr-FR')} F CFA
              </div>
            </div>

            {/* Rapports terminés */}
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-transform duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <CheckCircle className="h-8 w-8" />
                </div>
                <div className="text-right">
                  <p className="text-sm text-emerald-100 font-medium mb-1">Terminés</p>
                  <p className="text-4xl font-bold">{kpis?.statuts.termine || 0}</p>
                </div>
              </div>
              <div className="text-sm text-emerald-100">
                {kpis?.statuts.brouillon || 0} brouillons
              </div>
            </div>
          </div>

          {/* Graphiques */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Graphique Revenus - 2 colonnes */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <div className="w-1 h-6 bg-blue-600 rounded-full mr-3"></div>
                Évolution des revenus {revenus?.annee}
              </h2>
              
              {revenus ? (
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={revenusChartData}>
                    <defs>
                      <linearGradient id="colorRevenus" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis 
                      dataKey="mois" 
                      stroke="#6B7280"
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis 
                      stroke="#6B7280"
                      style={{ fontSize: '12px' }}
                      tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                      formatter={(value: any) => [`${value.toLocaleString('fr-FR')} F CFA`, 'Revenus']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenus" 
                      stroke="#3B82F6" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorRevenus)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[350px] flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <DollarSign className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>Chargement des revenus...</p>
                  </div>
                </div>
              )}
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Total annuel</span>
                  <span className="text-3xl font-bold text-blue-600">
                    {((revenus?.totalAnnuel || 0) / 1000).toFixed(0)}K F CFA
                  </span>
                </div>
              </div>
            </div>

            {/* Répartition par statut - 1 colonne */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <div className="w-1 h-6 bg-purple-600 rounded-full mr-3"></div>
                Statuts
              </h2>
              
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={statutsData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statutsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div className="space-y-3 mt-6">
                {statutsData.map((stat, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-3" 
                        style={{ backgroundColor: stat.color }}
                      ></div>
                      <span className="text-sm text-gray-700 font-medium">{stat.name}</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Stats détaillées en bas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium mb-1">Cette semaine</p>
                  <p className="text-3xl font-bold text-gray-900">{kpis?.rapportsSemaine || 0}</p>
                </div>
                <Clock className="h-12 w-12 text-blue-500 opacity-20" />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium mb-1">Honoraires totaux</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {((kpis?.honorairesTotal || 0) / 1000).toFixed(0)}K
                  </p>
                </div>
                <DollarSign className="h-12 w-12 text-purple-500 opacity-20" />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium mb-1">Moyenne / rapport</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {kpis?.totalRapports ? 
                      ((kpis.honorairesTotal || 0) / kpis.totalRapports / 1000).toFixed(0) : 
                      0
                    }K
                  </p>
                </div>
                <TrendingUp className="h-12 w-12 text-green-500 opacity-20" />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
