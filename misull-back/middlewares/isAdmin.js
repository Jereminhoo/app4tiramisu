// middlewares/isAdmin.js
// Ce middleware vérifie que l'utilisateur connecté est bien un ADMIN
// Il s'utilise TOUJOURS après verifierToken, jamais seul

const isAdmin = (req, res, next) => {
  // verifierToken a déjà attaché req.utilisateur avant nous
  // On vérifie juste son rôle
  if (req.utilisateur.role !== 'ADMIN') {
    return res.status(403).json({ 
      message: "Accès refusé : réservé aux administrateurs." 
    });
  }

  // Si c'est bien un admin, on laisse passer
  next();
};

module.exports = isAdmin;