import { useEffect, useState } from 'react';
import { MainLayout } from '@/layouts/MainLayout';
import { Card } from '@/components/ui/Card';
import { FileText, Building2, TrendingUp, DollarSign } from 'lucide-react';
import { statsService, rapportsService } from '@/services/api';
import type { Statistiques, Rapport } from '@/types';

export default function DashboardPage() {
  const [stats, setStats] = useState<Statistiques>({ 
    totalRapports: 0, 
    rapportsMois: 0, 
    revenusMois: 0, 
    tauxRealisation: 0 
  });
  const [recentRapports, setRecentRapports] = useState<Rapport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsData, rapportsData] = await Promise.all([
        statsService.get().catch(() => stats),
        rapportsService.getAll().catch(() => [])
      ]);
      setStats(statsData);
      setRecentRapports(rapportsData.slice(0, 5));
    } catch (error) {
      console.error('Erreur chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { 
      title: 'Rapports totaux', 
      value: stats.totalRapports, 
      icon: FileText, 
      color: 'bg-blue-500',
      change: '+12%'
    },
    { 
      title: 'Ce mois', 
      value: stats.rapportsMois, 
      icon: TrendingUp, 
      color: 'bg-green-500',
      change: '+8%'
    },
    { 
      title: 'Revenus mensuels', 
      value: stats.revenusMois.toLocaleString('fr-FR') + ' F CFA', 
      icon: DollarSign, 
      color: 'bg-purple-500',
      change: '+15%'
    },
    { 
      title: 'Bureaux actifs', 
      value: '12', 
      icon: Building2, 
      color: 'bg-orange-500',
      change: '+2'
    },
  ];

  if (loading) {
    return (
      <MainLayout title="Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Chargement...</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Dashboard">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  <p className="text-sm text-green-600 mt-1">{stat.change} ce mois</p>
                </div>
                <div className={'w-12 h-12 rounded-lg flex items-center justify-center text-white ' + stat.color}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Reports */}
      <Card title="Rapports récents" description="Les 5 derniers rapports créés">
        {recentRapports.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Aucun rapport pour le moment
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">N° Sinistre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentRapports.map((rapport) => (
                  <tr key={rapport.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{rapport.numeroSinistre}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{rapport.typeRapport}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(rapport.dateSinistre).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={'px-2 py-1 text-xs font-medium rounded-full ' + 
                        (rapport.statut === 'termine' ? 'bg-green-100 text-green-800' : 
                         rapport.statut === 'en_cours' ? 'bg-blue-100 text-blue-800' : 
                         'bg-gray-100 text-gray-800')}>
                        {rapport.statut}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {rapport.montantTotal?.toLocaleString('fr-FR')} F CFA
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </MainLayout>
  );
}
