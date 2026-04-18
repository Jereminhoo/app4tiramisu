const bcrypt = require('bcrypt'); // Outil pour crypter les mots de passe
const prisma = require('../prisma/client'); //On importe le client partagé


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

// Récupère le profil complet d'un utilisateur (sans son mot de passe !)
const getProfil = async (id_utilisateur) => {
  return await prisma.utilisateur.findUnique({
    where: { id_utilisateur },
    // On sélectionne uniquement les champs utiles
    // On ne renvoie JAMAIS le motDePasse au frontend
    select: {
      id_utilisateur: true,
      pseudo: true,
      role: true,
      pointsFidelite: true,
      estBanni: true,
    }
  });
};

module.exports = {
  createUser,
  getUserByPseudo,
  getProfil
};