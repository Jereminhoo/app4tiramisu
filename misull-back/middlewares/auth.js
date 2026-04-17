// middlewares/auth.js
// Ce middleware vérifie que l'utilisateur est bien connecté
// Il sera placé devant toutes les routes qui nécessitent d'être connecté

const jwt = require('jsonwebtoken');

const verifierToken = (req, res, next) => {
  // 1. On récupère le token dans les headers de la requête
  // Le frontend l'envoie sous la forme : "Bearer eyJhbGci..."
  const authHeader = req.headers['authorization'];

  // 2. Si aucun header authorization n'est présent → accès refusé
  if (!authHeader) {
    return res.status(401).json({ message: "Accès refusé : aucun token fourni." });
  }

  // 3. On extrait juste le token (on enlève le mot "Bearer " au début)
  // "Bearer eyJhbGci..." → "eyJhbGci..."
  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: "Accès refusé : format du token invalide." });
  }

  // 4. On vérifie que le token est valide et non expiré
  // jwt.verify va recalculer la signature et comparer
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      // Le token est expiré ou falsifié
      return res.status(403).json({ message: "Token invalide ou expiré." });
    }

    // 5. Si tout est bon, on attache les infos de l'utilisateur à la requête
    // Comme ça, la route suivante peut savoir QUI fait la requête
    // decoded contient ce qu'on avait mis dans jwt.sign() : { id, role }
    req.utilisateur = decoded;

    // 6. next() dit à Express "ok, tu peux passer à la suite"
    next();
  });
};

module.exports = verifierToken;