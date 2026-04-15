const userService = require('../services/userService');
const bcrypt = require('bcrypt');

const register = async (req, res) => {
  try {
    const { pseudo, motDePasse } = req.body;

    // 1. VERIFICATION DU PSEUDO
    // - Pas d'espaces : /^\S+$/
    // - Au moins une majuscule : /[A-Z]/
    // - Minimum 3 caractères
    const pseudoRegex = /^(?=.*[A-Z])\S{3,}$/;

    if (!pseudoRegex.test(pseudo)) {
      return res.status(400).json({ 
        message: "Pseudo invalide : 3 caractères min, une majuscule et aucun espace." 
      });
    }

    // 2. VERIFICATION DU MOT DE PASSE
    // - Pas d'espaces : /^\S+$/
    // - Minimum 8 caractères
    // - Au moins une lettre : /[a-zA-Z]/
    // - Au moins un caractère spécial : /[!@#$%^&*(),.?":{}|<>]/
    const mdpRegex = /^(?=.*[a-zA-Z])(?=.*[!@#$%^&*(),.?":{}|<>])\S{8,}$/;

    if (!mdpRegex.test(motDePasse)) {
      return res.status(400).json({ 
        message: "Mot de passe trop faible : 8 caractères min, une lettre, un caractère spécial et aucun espace." 
      });
    }

    // 3. VERIFICATION DOUBLON (on garde ce qu'on avait)
    const existingUser = await userService.getUserByPseudo(pseudo);
    if (existingUser) {
      return res.status(400).json({ message: "Ce pseudo est déjà pris." });
    }

    // 4. CREATION
    const newUser = await userService.createUser(pseudo, motDePasse);
    
    res.status(201).json({ 
      message: "Utilisateur créé !",
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

    // 1. On cherche si l'utilisateur existe dans la base
    const user = await userService.getUserByPseudo(pseudo);

    if (!user) {
      // Si on ne trouve pas le pseudo, on renvoie une erreur
      // Note : on reste vague ("Pseudo ou mdp incorrect") pour la sécurité
      return res.status(401).json({ message: "Pseudo ou mot de passe incorrect." });
    }

    // 2. On compare le mot de passe envoyé avec celui qui est crypté en base
    // bcrypt.compare fait tout le travail de vérification pour nous
    const isMatch = await bcrypt.compare(motDePasse, user.motDePasse);

    if (!isMatch) {
      // Si le mot de passe ne correspond pas
      return res.status(401).json({ message: "Pseudo ou mot de passe incorrect." });
    }

    // 3. Si tout est bon, on connecte l'utilisateur
    // Pour l'instant, on renvoie juste un message de succès et ses infos
    res.json({
      message: "Connexion réussie !",
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

module.exports = {
  register,
  login
};