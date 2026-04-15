// 1. LES IMPORTS : On va chercher les outils nécessaires
const { PrismaClient } = require('@prisma/client'); // Prisma, l'outil principal pour lire la base de données
const { Pool } = require('pg'); // L'outil "pg" qui permet de se connecter à PostgreSQL
const { PrismaPg } = require('@prisma/adapter-pg'); // L'adaptateur qui fait fonctionner Prisma avec "pg" (notre solution au bug)

// 2. LA CONNEXION : On relie le code à ta base de données
// On crée une connexion en utilisant l'URL qui se trouve dans ton fichier .env
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
// On prépare l'adaptateur avec cette connexion
const adapter = new PrismaPg(pool);
// On démarre Prisma en lui disant d'utiliser notre adaptateur
const prisma = new PrismaClient({ adapter });

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

// 4. L'EXPORT : On rend ces fonctions utilisables ailleurs
// On exporte les 3 fonctions pour que ton fichier menuController.js puisse les appeler
module.exports = {
  getTiramisus,
  getTailles,
  getSupplements
};