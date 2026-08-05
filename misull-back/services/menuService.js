const prisma = require('../prisma/client'); // On importe le client partagé

// 3. LES FONCTIONS : On crée les requêtes pour aller chercher les données

// Fonction qui va chercher toutes les lignes de la table "Tiramisu"
const getTiramisus = async () => {
  // prisma.tiramisu correspond à ta table, findMany() veut dire "trouve-les tous"
  return await prisma.tiramisu.findMany();
};

// Fonction qui va chercher toutes les lignes de la table "Taille"
const getTailles = async () => {
  return await prisma.taille.findMany();
};

// Fonction qui va chercher toutes les lignes de la table "Supplement"
const getSupplements = async () => {
  return await prisma.supplement.findMany();
};

// Récupère tous les goûts disponibles
const getGouts = async () => {
  return await prisma.gout.findMany();
};

module.exports = {
  getTiramisus,
  getTailles,
  getSupplements,
  getGouts
};