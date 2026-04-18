// middlewares/auth.js
// Ce middleware vérifie que l'utilisateur est bien connecté
// ET qu'il n'est pas banni — à chaque requête protégée

const jwt = require('jsonwebtoken');
const prisma = require('../prisma/client');

// On passe le middleware en async car on fait une requête BDD
const verifierToken = async (req, res, next) => {
  // 1. On récupère le token dans les headers de la requête
  const authHeader = req.headers['authorization'];

  // 2. Si aucun header authorization n'est présent → accès refusé
  if (!authHeader) {
    return res.status(401).json({ message: "Accès refusé : aucun token fourni." });
  }

  // 3. On extrait juste le token (on enlève "Bearer " au début)
  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: "Accès refusé : format du token invalide." });
  }

  // 4. On vérifie que le token est valide et non expiré
  let decoded;
  try {
    // On utilise un try/catch plutot que le callback
    // pour pouvoir faire du code async après
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return res.status(403).json({ message: "Token invalide ou expiré." });
  }

  // 5. NOUVEAU — On vérifie en base si l'utilisateur est banni
  // Meme si le token est valide, un banni ne doit pas pouvoir agir
  try {
    const utilisateur = await prisma.utilisateur.findUnique({
      where: { id_utilisateur: decoded.id },
      // On ne prend que ce dont on a besoin
      select: { id_utilisateur: true, estBanni: true, role: true }
    });

    // Si l'utilisateur n'existe plus du tout en base
    if (!utilisateur) {
      return res.status(401).json({ message: "Compte introuvable." });
    }

    // Si l'utilisateur est banni → on bloque immédiatement
    if (utilisateur.estBanni) {
      return res.status(403).json({ message: "Ce compte a été banni." });
    }

  } catch (err) {
    return res.status(500).json({ message: "Erreur serveur lors de la vérification." });
  }

  // 6. Tout est bon — on attache les infos décodées à la requête
  req.utilisateur = decoded;

  // 7. On passe à la route suivante
  next();
};

module.exports = verifierToken;