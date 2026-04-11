const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
const menuRoutes = require('./routes/menuRoutes');
const port = 3000;

// On dit à Express d'utiliser nos routes avec le préfixe /api
app.use('/api', menuRoutes);

// La route pour la page d'accueil (la racine)
app.get('/', (req, res) => {
  res.send(`
    <div style="text-align: center; font-family: sans-serif; margin-top: 50px;">
      <h1>Bienvenue chez Misull 🍰</h1>
      <p>Le site officiel de commande est en cours de préparation !</p>
      <p>En attendant, venez voir nos Tira-crêpes et passez commande sur notre compte Instagram :</p>
      
      <a href="https://www.instagram.com/misulalouviere" target="_blank" style="color: #8b5a2b; font-weight: bold; font-size: 20px; text-decoration: none;">
        📸 @misulalouviere
      </a>
      
      <br><br><br>
      
      <p style="font-size: 12px; color: gray;">
        Curieux ? <a href="/api/menu" style="color: gray;">Voir les données brutes du menu</a>
      </p>
    </div>
  `);
});

app.listen(port, () => {
  console.log(`Le serveur de Misull tourne sur le port ${port}`);
});