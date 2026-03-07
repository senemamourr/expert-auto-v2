import type { StatutRapport } from '@/types';

interface StatutBadgeProps {
  statut: StatutRapport;
  className?: string;
}

export default function StatutBadge({ statut, className = '' }: StatutBadgeProps) {
  const styles = {
    brouillon: 'bg-gray-100 text-gray-800 border-gray-300',
    en_cours: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    termine: 'bg-green-100 text-green-800 border-green-300',
    archive: 'bg-blue-100 text-blue-800 border-blue-300',
  };

  const labels = {
    brouillon: 'Brouillon',
    en_cours: 'En cours',
    termine: 'Terminé',
    archive: 'Archivé',
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${styles[statut]} ${className}`}
    >
      {labels[statut]}
    </span>
  );
}
