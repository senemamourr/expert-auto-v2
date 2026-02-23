import { useEffect, useState } from 'react';
import { MainLayout } from '@/layouts/MainLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FormInput } from '@/components/ui/FormInput';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { bureauxService } from '@/services/api';
import type { Bureau } from '@/types';

export default function BureauxPage() {
  const [bureaux, setBureaux] = useState<Bureau[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBureau, setEditingBureau] = useState<Bureau | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
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
    } catch (error: any) {
      console.error('Erreur chargement bureaux:', error);
      // Si 404, backend pas encore configuré - c'est normal
      if (error.response?.status === 404) {
        console.log('API bureaux pas encore disponible');
        setBureaux([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Effacer l'erreur du champ modifié
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.code.trim()) newErrors.code = 'Le code est requis';
    if (!formData.nomAgence.trim()) newErrors.nomAgence = 'Le nom de l agence est requis';
    if (!formData.responsableSinistres.trim()) newErrors.responsableSinistres = 'Le responsable est requis';
    if (!formData.telephone.trim()) newErrors.telephone = 'Le téléphone est requis';
    if (!formData.email.trim()) {
      newErrors.email = 'L email est requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }
    if (!formData.adresse.trim()) newErrors.adresse = 'L adresse est requise';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      if (editingBureau) {
        await bureauxService.update(editingBureau.id, formData);
      } else {
        await bureauxService.create(formData);
      }
      await loadBureaux();
      closeModal();
    } catch (error: any) {
      console.error('Erreur sauvegarde:', error);
      const message = error.response?.data?.error || 'Erreur lors de la sauvegarde. Vérifiez que le backend est configuré.';
      alert(message);
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
    setErrors({});
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
    setErrors({});
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
        description={'Gestion de ' + bureaux.length + ' compagnies d assurance'}
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
              {bureaux.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Aucun bureau pour le moment. Cliquez sur "Nouveau bureau" pour commencer.
                  </td>
                </tr>
              ) : (
                bureaux.map((bureau) => (
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
                ))
              )}
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
                <FormInput
                  label="Code bureau"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  required
                  placeholder="Ex: AXA001, ALLIANZ01"
                  error={errors.code}
                />
                <FormInput
                  label="Nom de l agence"
                  name="nomAgence"
                  value={formData.nomAgence}
                  onChange={handleInputChange}
                  required
                  placeholder="Ex: AXA Assurances Dakar"
                  error={errors.nomAgence}
                />
              </div>
              
              <FormInput
                label="Responsable sinistres"
                name="responsableSinistres"
                value={formData.responsableSinistres}
                onChange={handleInputChange}
                required
                placeholder="Ex: Amadou Diallo"
                error={errors.responsableSinistres}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormInput
                  label="Téléphone"
                  name="telephone"
                  type="tel"
                  value={formData.telephone}
                  onChange={handleInputChange}
                  required
                  placeholder="Ex: +221 33 123 45 67"
                  error={errors.telephone}
                />
                <FormInput
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="Ex: sinistres@axa.sn"
                  error={errors.email}
                />
              </div>
              
              <FormInput
                label="Adresse"
                name="adresse"
                value={formData.adresse}
                onChange={handleInputChange}
                required
                rows={3}
                placeholder="Ex: Avenue Léopold Sédar Senghor, Dakar"
                error={errors.adresse}
              />
              
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
