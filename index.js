const express = require('express');
const app = express();
const menuRoutes = require('./routes/menuRoutes');
const port = 3000;

// On dit à Express d'utiliser nos routes avec le préfixe /api
app.use('/api', menuRoutes);

app.listen(port, () => {
  console.log(`Le serveur de Misull tourne sur le port ${port}`);
});