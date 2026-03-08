const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Assure = sequelize.define('Assure', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    
    // Identité - OPTIONNELLES
    nom: {
      type: DataTypes.STRING(100),
      allowNull: true,  // ✅ Optionnel
      comment: 'Nom de l\'assuré'
    },
    prenom: {
      type: DataTypes.STRING(100),
      allowNull: true,  // ✅ Optionnel
      comment: 'Prénom de l\'assuré'
    },
    
    // Contact - OPTIONNELS
    telephone: {
      type: DataTypes.STRING(50),
      allowNull: true,  // ✅ Optionnel
      comment: 'Numéro de téléphone'
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Adresse email'
    },
    
    // Adresse - OPTIONNELLE
    adresse: {
      type: DataTypes.TEXT,
      allowNull: true,  // ✅ Optionnel
      comment: 'Adresse complète'
    },
    ville: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Ville'
    },
    codePostal: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: 'Code postal'
    },
    pays: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: 'Sénégal',
      comment: 'Pays'
    },
    
    // Informations complémentaires - OPTIONNELLES
    numeroPermis: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Numéro de permis de conduire'
    },
    dateNaissance: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: 'Date de naissance'
    },
    profession: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Profession'
    },
    
    // Observations - OPTIONNELLES
    observations: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Observations sur l\'assuré'
    }
  }, {
    tableName: 'assures',
    timestamps: true,
    underscored: true
  });

  return Assure;
};
