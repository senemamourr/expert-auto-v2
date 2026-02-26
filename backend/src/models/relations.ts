import Rapport from './Rapport';
import Vehicule from './Vehicule';
import Assure from './Assure';
import Choc from './Choc';
import Fourniture from './Fourniture';
import Honoraire from './Honoraire';

/**
 * Définition des relations entre les modèles
 * À importer dans server.ts après la connexion à la base de données
 */

// Rapport → Vehicule (1:1)
Rapport.hasOne(Vehicule, {
  foreignKey: 'rapportId',
  as: 'vehicule',
  onDelete: 'CASCADE',
});
Vehicule.belongsTo(Rapport, {
  foreignKey: 'rapportId',
  as: 'rapport',
});

// Rapport → Assure (1:1)
Rapport.hasOne(Assure, {
  foreignKey: 'rapportId',
  as: 'assure',
  onDelete: 'CASCADE',
});
Assure.belongsTo(Rapport, {
  foreignKey: 'rapportId',
  as: 'rapport',
});

// Rapport → Chocs (1:N)
Rapport.hasMany(Choc, {
  foreignKey: 'rapportId',
  as: 'chocs',
  onDelete: 'CASCADE',
});
Choc.belongsTo(Rapport, {
  foreignKey: 'rapportId',
  as: 'rapport',
});

// Choc → Fournitures (1:N)
Choc.hasMany(Fourniture, {
  foreignKey: 'chocId',
  as: 'fournitures',
  onDelete: 'CASCADE',
});
Fourniture.belongsTo(Choc, {
  foreignKey: 'chocId',
  as: 'choc',
});

// Rapport → Honoraire (1:1)
Rapport.hasOne(Honoraire, {
  foreignKey: 'rapportId',
  as: 'honoraire',
  onDelete: 'CASCADE',
});
Honoraire.belongsTo(Rapport, {
  foreignKey: 'rapportId',
  as: 'rapport',
});

export {
  Rapport,
  Vehicule,
  Assure,
  Choc,
  Fourniture,
  Honoraire,
};
