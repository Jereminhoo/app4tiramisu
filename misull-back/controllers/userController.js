// controllers/userController.js
// Gère l'inscription, la connexion et le profil utilisateur.

const userService = require('../services/userService');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// ─────────────────────────────────────────
// INSCRIPTION
// ─────────────────────────────────────────
const register = async (req, res) => {
  try {
    const { pseudo, motDePasse } = req.body;

    // Pseudo : minimum 3 caractères, pas d'espace
    // On a supprimé l'obligation d'avoir une majuscule, c'était trop strict
    const pseudoRegex = /^\S{3,}$/;
    if (!pseudoRegex.test(pseudo)) {
      return res.status(400).json({
        message: "Pseudo invalide : 3 caractères minimum, sans espace."
      });
    }

    // Mot de passe : minimum 6 caractères, pas d'espace
    // On a supprimé l'obligation du caractère spécial, c'était trop strict
    const mdpRegex = /^\S{6,}$/;
    if (!mdpRegex.test(motDePasse)) {
      return res.status(400).json({
        message: "Mot de passe invalide : 6 caractères minimum, sans espace."
      });
    }

    // Vérifier si le pseudo est déjà pris
    const existingUser = await userService.getUserByPseudo(pseudo);
    if (existingUser) {
      return res.status(400).json({ message: "Ce pseudo est déjà pris." });
    }

    // Créer l'utilisateur en base de données
    const newUser = await userService.createUser(pseudo, motDePasse);

    // ─── AUTO-CONNEXION ───
    // On génère directement un JWT après l'inscription
    // Comme ça, le frontend peut connecter l'utilisateur sans qu'il
    // doive retaper son pseudo et mot de passe
    const token = jwt.sign(
      {
        id: newUser.id_utilisateur,
        role: newUser.role,
        pseudo: newUser.pseudo
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // On renvoie le token ET les infos user, exactement comme /login
    res.status(201).json({
      message: "Compte créé avec succès !",
      token: token,
      user: {
        id: newUser.id_utilisateur,
        pseudo: newUser.pseudo,
        role: newUser.role
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de l'inscription." });
  }
};

// ─────────────────────────────────────────
// CONNEXION
// ─────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { pseudo, motDePasse } = req.body;

    // 1. L'utilisateur existe ?
    const user = await userService.getUserByPseudo(pseudo);
    if (!user) {
      return res.status(401).json({ message: "Pseudo ou mot de passe incorrect." });
    }

    // 2. Compte banni ? On bloque avant même de vérifier le mot de passe
    if (user.estBanni) {
      return res.status(403).json({ message: "Ce compte a été banni." });
    }

    // 3. Mot de passe correct ?
    const isMatch = await bcrypt.compare(motDePasse, user.motDePasse);
    if (!isMatch) {
      return res.status(401).json({ message: "Pseudo ou mot de passe incorrect." });
    }

    // 4. Générer le JWT
    // jwt.sign() prend 3 arguments :
    // - Le payload : les infos qu'on veut stocker dans le token
    // - Le secret : la clé secrète du .env pour signer le token
    // - Les options : "expiresIn" fait expirer le token après 24h
    const token = jwt.sign(
      {
        id: user.id_utilisateur,
        role: user.role,
        pseudo: user.pseudo
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // 5. Renvoyer le token au frontend
    res.json({
      message: "Connexion réussie !",
      token: token,
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

// ─────────────────────────────────────────
// PROFIL
// ─────────────────────────────────────────
// Renvoie le profil de l'utilisateur connecté.
// L'id vient du token JWT, pas de l'URL — sécurisé !
const getProfil = async (req, res) => {
  try {
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