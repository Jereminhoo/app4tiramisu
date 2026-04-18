// controllers/userController.js
const userService = require('../services/userService');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // On importe l'outil JWT

const register = async (req, res) => {
  try {
    const { pseudo, motDePasse } = req.body;

    const pseudoRegex = /^(?=.*[A-Z])\S{3,}$/;
    if (!pseudoRegex.test(pseudo)) {
      return res.status(400).json({ 
        message: "Pseudo invalide : 3 caractères min, une majuscule et aucun espace." 
      });
    }

    const mdpRegex = /^(?=.*[a-zA-Z])(?=.*[!@#$%^&*(),.?":{}|<>])\S{8,}$/;
    if (!mdpRegex.test(motDePasse)) {
      return res.status(400).json({ 
        message: "Mot de passe trop faible : 8 caractères min, une lettre, un caractère spécial et aucun espace." 
      });
    }

    const existingUser = await userService.getUserByPseudo(pseudo);
    if (existingUser) {
      return res.status(400).json({ message: "Ce pseudo est déjà pris." });
    }

    const newUser = await userService.createUser(pseudo, motDePasse);
    
    res.status(201).json({ 
      message: "Compte créé avec succès !",
      user: { id: newUser.id_utilisateur, pseudo: newUser.pseudo }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de l'inscription." });
  }
};

const login = async (req, res) => {
  try {
    const { pseudo, motDePasse } = req.body;

    // 1. L'utilisateur existe ?
    const user = await userService.getUserByPseudo(pseudo);
    if (!user) {
      return res.status(401).json({ message: "Pseudo ou mot de passe incorrect." });
    }

    // 2. Compte banni ?
    // On bloque avant même de vérifier le mot de passe
    if (user.estBanni) {
      return res.status(403).json({ message: "Ce compte a été banni." });
    }

    // 3. Mot de passe correct ?
    const isMatch = await bcrypt.compare(motDePasse, user.motDePasse);
    if (!isMatch) {
      return res.status(401).json({ message: "Pseudo ou mot de passe incorrect." });
    }

    // 4. On génère le JWT
    // jwt.sign() prend 3 arguments :
    // - Le payload : les infos qu'on veut stocker dans le token
    // - Le secret : la clé secrète du .env pour signer le token
    // - Les options : ici "expiresIn" fait expirer le token après 24h
    const token = jwt.sign(
      { 
        id: user.id_utilisateur,  // L'id de l'utilisateur
        role: user.role,            // Son rôle (CLIENT ou ADMIN)
        pseudo: user.pseudo 
      },
      process.env.JWT_SECRET,     // La clé secrète dans ton .env
      { expiresIn: '24h' }        // Le token expire après 24 heures
    );

    // 5. On renvoie le token au frontend
    res.json({
      message: "Connexion réussie !",
      token: token, // Le frontend va stocker ce token
      user: {
        id: user.id_utilisateur,
        pseudo: user.pseudo,
        role: user.role
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la connexion." });
  }
};

// Renvoie le profil de l'utilisateur connecté
const getProfil = async (req, res) => {
  try {
    // L'id vient du token JWT, pas de l'URL — sécurisé !
    const profil = await userService.getProfil(req.utilisateur.id);
    res.json({ profil });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération du profil." });
  }
};

module.exports = {
  register,
  login, 
  getProfil
};