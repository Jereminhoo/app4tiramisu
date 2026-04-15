const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcrypt'); // Outil pour crypter les mots de passe

// Connexion à la base de données (même setup que pour le menu)
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Fonction pour enregistrer un nouvel utilisateur
const createUser = async (pseudo, motDePasse) => {
  // On ne stocke jamais le mot de passe tel quel. 
  // bcrypt.hash va transformer "1234" en un truc illisible comme "$2b$10$..."
  const hashedPass = await bcrypt.hash(motDePasse, 10);
  
  // On insère les données dans la table Utilisateur
  return await prisma.utilisateur.create({
    data: {
      pseudo: pseudo,
      motDePasse: hashedPass, // On enregistre la version cryptée
      role: 'CLIENT' // On lui donne le rôle client par défaut
    }
  });
};

// Fonction pour vérifier si un pseudo existe déjà
const getUserByPseudo = async (pseudo) => {
  return await prisma.utilisateur.findUnique({
    where: { pseudo: pseudo }
  });
};

module.exports = {
  createUser,
  getUserByPseudo
};