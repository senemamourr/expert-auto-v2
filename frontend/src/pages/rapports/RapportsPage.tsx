import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/layouts/MainLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Plus, Eye, Edit2, Trash2 } from 'lucide-react';
import { rapportsService } from '@/services/api';
import type { Rapport } from '@/types';

export default function RapportsPage() {
  const navigate = useNavigate();
  const [rapports, setRapports] = useState<Rapport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRapports();
  }, []);

  const loadRapports = async () => {
    try {
      const data = await rapportsService.getAll();
      setRapports(data);
    } catch (error) {
      console.error('Erreur chargement rapports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce rapport ?')) return;
    try {
      await rapportsService.delete(id);
      await loadRapports();
    } catch (error) {
      console.error('Erreur suppression:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      estimatif_reparation: 'Estimatif de réparation',
      valeur_venale: 'Valeur vénale',
      tierce_expertise: 'Tierce expertise'
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <MainLayout title="Gestion des Rapports">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Chargement...</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Gestion des Rapports">
      <Card 
        title="Rapports d'expertise" 
        description={'Total: ' + rapports.length + ' rapport(s)'}
      >
        <div className="mb-4">
          <Button onClick={() => navigate('/rapports/nouveau')} className="flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            Nouveau rapport
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">N° Sinistre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date sinistre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Immatriculation</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rapports.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    Aucun rapport pour le moment. Cliquez sur "Nouveau rapport" pour commencer.
                  </td>
                </tr>
              ) : (
                rapports.map((rapport) => (
                  <tr key={rapport.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {rapport.numeroSinistre}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {getTypeLabel(rapport.typeRapport)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(rapport.dateSinistre).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {rapport.vehicule?.immatriculation || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={'px-2 py-1 text-xs font-medium rounded-full ' + 
                        (rapport.statut === 'termine' ? 'bg-green-100 text-green-800' : 
                         rapport.statut === 'en_cours' ? 'bg-blue-100 text-blue-800' : 
                         'bg-gray-100 text-gray-800')}>
                        {rapport.statut || 'brouillon'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {rapport.montantTotal ? rapport.montantTotal.toLocaleString('fr-FR') + ' F CFA' : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => navigate('/rapports/' + rapport.id)}
                        className="inline-flex"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => navigate('/rapports/' + rapport.id + '/modifier')}
                        className="inline-flex"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => rapport.id && handleDelete(rapport.id)}
                        className="inline-flex"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </MainLayout>
  );
}
