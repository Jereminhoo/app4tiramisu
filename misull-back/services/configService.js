// services/configService.js
// Gère la lecture et la modification des configurations de l'application.
// Les configs sont stockées en BDD sous forme clé/valeur.

const prisma = require('../prisma/client');

// Récupère toutes les configurations
const getConfig = async () => {
  const configs = await prisma.config.findMany();
  // On transforme le tableau [{cle, valeur}] en objet {cle: valeur}
  // pour que ce soit plus facile à utiliser côté frontend
  // Ex: [{cle: "heureOuverture", valeur: "15"}] → {heureOuverture: "15"}
  return configs.reduce((acc, config) => {
    acc[config.cle] = config.valeur;
    return acc;
  }, {});
};

// Met à jour une configuration
// upsert = update si existe, insert si n'existe pas
const updateConfig = async (cle, valeur) => {
  return await prisma.config.upsert({
    where: { cle },
    update: { valeur: String(valeur) },
    create: { cle, valeur: String(valeur) },
  });
};

module.exports = { getConfig, updateConfig };