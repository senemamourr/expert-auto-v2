const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Vehicule = sequelize.define('Vehicule', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    
    // Informations de base - OPTIONNELLES
    genre: {
      type: DataTypes.STRING(50),
      allowNull: true,  // ✅ Optionnel
      comment: 'Genre du véhicule (VP, VU, etc.)'
    },
    type: {
      type: DataTypes.STRING(100),
      allowNull: true,  // ✅ Optionnel (était false)
      comment: 'Type de véhicule'
    },
    marque: {
      type: DataTypes.STRING(100),
      allowNull: true,  // ✅ Optionnel
      comment: 'Marque du véhicule'
    },
    modele: {
      type: DataTypes.STRING(100),
      allowNull: true,  // ✅ Optionnel
      comment: 'Modèle du véhicule'
    },
    
    // Identification - OPTIONNELLES
    immatriculation: {
      type: DataTypes.STRING(50),
      allowNull: true,  // ✅ Optionnel
      comment: 'Numéro d\'immatriculation'
    },
    numeroChassis: {
      type: DataTypes.STRING(100),
      allowNull: true,  // ✅ Optionnel (était false)
      comment: 'Numéro de châssis/série'
    },
    numeroSerie: {
      type: DataTypes.STRING(100),
      allowNull: true,  // ✅ Optionnel
      comment: 'Numéro de série (alias)'
    },
    
    // Caractéristiques - OPTIONNELLES
    couleur: {
      type: DataTypes.STRING(50),
      allowNull: true,  // ✅ Optionnel (était false)
      comment: 'Couleur du véhicule'
    },
    sourceEnergie: {
      type: DataTypes.STRING(50),
      allowNull: true,  // ✅ Optionnel (était false)
      comment: 'Type de carburant (Essence, Diesel, Électrique, etc.)'
    },
    puissanceFiscale: {
      type: DataTypes.INTEGER,
      allowNull: true,  // ✅ Optionnel (était false)
      comment: 'Puissance fiscale en chevaux'
    },
    puissanceReelle: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Puissance réelle en chevaux'
    },
    
    // Dates et kilométrage - OPTIONNELS
    dateMiseEnCirculation: {
      type: DataTypes.DATEONLY,
      allowNull: true,  // ✅ Optionnel
      comment: 'Date de première mise en circulation'
    },
    kilometrage: {
      type: DataTypes.INTEGER,
      allowNull: true,  // ✅ Optionnel
      comment: 'Kilométrage actuel'
    },
    
    // Valeurs - OPTIONNELLES
    valeurNeuve: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,  // ✅ Optionnel (était false)
      defaultValue: 0,
      comment: 'Valeur à neuf en F CFA'
    },
    valeurVenale: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      defaultValue: 0,
      comment: 'Valeur vénale actuelle en F CFA'
    },
    
    // Divers - OPTIONNELS
    observations: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Observations sur le véhicule'
    }
  }, {
    tableName: 'vehicules',
    timestamps: true,
    underscored: true
  });

  return Vehicule;
};
