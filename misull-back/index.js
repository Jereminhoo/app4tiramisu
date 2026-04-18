// index.js
// Point d'entrée principal du serveur Express de Misull

// Charge les variables du fichier .env (DATABASE_URL, JWT_SECRET, etc.)
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');               // Sécurité des en-têtes HTTP
const rateLimit = require('express-rate-limit'); // Protection contre la force brute

const app = express();
const port = process.env.PORT || 3000; // On lit le port depuis .env, sinon 3000 par défaut

// ─────────────────────────────────────────────
// MIDDLEWARES GLOBAUX (s'appliquent à TOUTES les routes)
// ─────────────────────────────────────────────

// helmet() ajoute ~15 en-têtes HTTP de sécurité automatiquement
// Par exemple : empêche les navigateurs d'exécuter du code malveillant injecté
app.use(helmet());

// On autorise uniquement les requêtes venant de notre frontend React
// Toute autre origine sera bloquée par le navigateur
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173'
}));

// Permet à Express de lire le JSON envoyé dans le body des requêtes
app.use(express.json());

// ─────────────────────────────────────────────
// RATE LIMITERS (protection contre les attaques)
// ─────────────────────────────────────────────

// Limiteur général : max 100 requêtes par IP toutes les 15 minutes
// Protège toute l'API contre les abus
// Limiteur général : max 300 requêtes par IP toutes les 15 minutes
const limiterGeneral = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 300 : 500,
  message: { message: 'Trop de requêtes, réessaie dans 15 minutes.' }
});

// Limiteur strict pour l'authentification : max 10 tentatives par 15 minutes
const limiterAuth = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 10 : 50,
  message: { message: 'Trop de tentatives, réessaie dans 15 minutes.' }
});

// On applique le limiteur général à toute l'API
app.use('/api', limiterGeneral);

// ─────────────────────────────────────────────
// ROUTES
// ─────────────────────────────────────────────

// Routes du menu (publiques - tout le monde peut voir les produits)
app.use('/api/menu', require('./routes/menuRoutes'));

// Routes utilisateurs (publiques pour register/login, mais avec limiteur strict)
app.use('/api/users', limiterAuth, require('./routes/userRoutes'));

// Routes commandes (protégées - le middleware verifierToken est dans orderRoutes.js)
app.use('/api/orders', require('./routes/orderRoutes'));

// Routes admin (protégées — token + rôle ADMIN requis)
app.use('/api/admin', require('./routes/adminRoutes'));

// ─────────────────────────────────────────────
// PAGE D'ACCUEIL
// ─────────────────────────────────────────────

// Route racine - page d'accueil simple en HTML
app.get('/', (req, res) => {
  res.send(`
    <div style="text-align: center; font-family: sans-serif; margin-top: 50px;">
      <h1>Bienvenue chez Misull 🍰</h1>
      <p>Le site officiel de commande est en cours de preparation !</p>
      <p>En attendant, passez commande sur Instagram :</p>
      <a href="https://www.instagram.com/misulalouviere" target="_blank" 
         style="color: #8b5a2b; font-weight: bold; font-size: 20px; text-decoration: none;">
        @misulalouviere
      </a>
    </div>
  `);
});


app.listen(port, () => {
  console.log(`Le serveur de Misull tourne sur le port ${port}`);
});