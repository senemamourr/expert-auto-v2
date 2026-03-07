import { useState, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';

interface Bureau {
  id: string;
  code: string;
  nomAgence: string;
}

interface RapportsFiltersProps {
  bureaux: Bureau[];
  onFilterChange: (filters: {
    statut?: string;
    typeRapport?: string;
    bureauId?: string;
    numeroSinistre?: string;
  }) => void;
  onReset: () => void;
}

export default function RapportsFilters({ bureaux, onFilterChange, onReset }: RapportsFiltersProps) {
  const [statut, setStatut] = useState('');
  const [typeRapport, setTypeRapport] = useState('');
  const [bureauId, setBureauId] = useState('');
  const [numeroSinistre, setNumeroSinistre] = useState('');

  const handleChange = () => {
    onFilterChange({
      statut: statut || undefined,
      typeRapport: typeRapport || undefined,
      bureauId: bureauId || undefined,
      numeroSinistre: numeroSinistre || undefined,
    });
  };

  useEffect(() => {
    handleChange();
  }, [statut, typeRapport, bureauId, numeroSinistre]);

  const handleReset = () => {
    setStatut('');
    setTypeRapport('');
    setBureauId('');
    setNumeroSinistre('');
    onReset();
  };

  const hasFilters = statut || typeRapport || bureauId || numeroSinistre;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Filter className="h-5 w-5 text-gray-500 mr-2" />
          <h3 className="text-sm font-semibold text-gray-700">Filtres</h3>
        </div>
        {hasFilters && (
          <button
            onClick={handleReset}
            className="flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <X className="h-4 w-4 mr-1" />
            Réinitialiser
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Recherche par N° sinistre */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            N° Sinistre
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={numeroSinistre}
              onChange={(e) => setNumeroSinistre(e.target.value)}
              placeholder="Rechercher..."
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Filtre par bureau */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bureau
          </label>
          <select
            value={bureauId}
            onChange={(e) => setBureauId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tous les bureaux</option>
            {bureaux.map((bureau) => (
              <option key={bureau.id} value={bureau.id}>
                {bureau.code} - {bureau.nomAgence}
              </option>
            ))}
          </select>
        </div>

        {/* Filtre par statut */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Statut
          </label>
          <select
            value={statut}
            onChange={(e) => setStatut(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tous les statuts</option>
            <option value="brouillon">Brouillon</option>
            <option value="en_cours">En cours</option>
            <option value="termine">Terminé</option>
            <option value="archive">Archivé</option>
          </select>
        </div>

        {/* Filtre par type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type de rapport
          </label>
          <select
            value={typeRapport}
            onChange={(e) => setTypeRapport(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tous les types</option>
            <option value="estimatif_reparation">Estimatif réparation</option>
            <option value="valeur_venale">Valeur vénale</option>
            <option value="tierce_expertise">Tierce expertise</option>
          </select>
        </div>
      </div>
    </div>
  );
}
