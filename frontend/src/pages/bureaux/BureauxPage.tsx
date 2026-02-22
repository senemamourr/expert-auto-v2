import { useEffect, useState } from 'react';
import { MainLayout } from '@/layouts/MainLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { bureauxService } from '@/services/api';
import type { Bureau } from '@/types';

export default function BureauxPage() {
  const [bureaux, setBureaux] = useState<Bureau[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBureau, setEditingBureau] = useState<Bureau | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    nomAgence: '',
    responsableSinistres: '',
    telephone: '',
    email: '',
    adresse: ''
  });

  useEffect(() => {
    loadBureaux();
  }, []);

  const loadBureaux = async () => {
    try {
      const data = await bureauxService.getAll();
      setBureaux(data);
    } catch (error) {
      console.error('Erreur chargement bureaux:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBureau) {
        await bureauxService.update(editingBureau.id, formData);
      } else {
        await bureauxService.create(formData);
      }
      await loadBureaux();
      closeModal();
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      alert('Erreur lors de la sauvegarde');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce bureau ?')) return;
    try {
      await bureauxService.delete(id);
      await loadBureaux();
    } catch (error) {
      console.error('Erreur suppression:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const openModal = (bureau?: Bureau) => {
    if (bureau) {
      setEditingBureau(bureau);
      setFormData({
        code: bureau.code,
        nomAgence: bureau.nomAgence,
        responsableSinistres: bureau.responsableSinistres,
        telephone: bureau.telephone,
        email: bureau.email,
        adresse: bureau.adresse
      });
    } else {
      setEditingBureau(null);
      setFormData({
        code: '',
        nomAgence: '',
        responsableSinistres: '',
        telephone: '',
        email: '',
        adresse: ''
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingBureau(null);
  };

  if (loading) {
    return (
      <MainLayout title="Gestion des Bureaux">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Chargement...</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Gestion des Bureaux">
      <Card 
        title="Bureaux d'assurance" 
        description={'Gestion de ' + bureaux.length + ' compagnies d\'assurance'}
      >
        <div className="mb-4">
          <Button onClick={() => openModal()} className="flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            Nouveau bureau
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Agence</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Responsable</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Téléphone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bureaux.map((bureau) => (
                <tr key={bureau.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{bureau.code}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{bureau.nomAgence}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{bureau.responsableSinistres}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{bureau.telephone}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{bureau.email}</td>
                  <td className="px-6 py-4 text-sm space-x-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openModal(bureau)}
                      className="inline-flex"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDelete(bureau.id)}
                      className="inline-flex"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingBureau ? 'Modifier le bureau' : 'Nouveau bureau'}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Code bureau"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  required
                />
                <Input
                  label="Nom de l'agence"
                  value={formData.nomAgence}
                  onChange={(e) => setFormData({ ...formData, nomAgence: e.target.value })}
                  required
                />
              </div>
              
              <Input
                label="Responsable sinistres"
                value={formData.responsableSinistres}
                onChange={(e) => setFormData({ ...formData, responsableSinistres: e.target.value })}
                required
              />
              
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Téléphone"
                  type="tel"
                  value={formData.telephone}
                  onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                  required
                />
                <Input
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows={3}
                  value={formData.adresse}
                  onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                  required
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="secondary" onClick={closeModal}>
                  Annuler
                </Button>
                <Button type="submit">
                  {editingBureau ? 'Enregistrer' : 'Créer'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
