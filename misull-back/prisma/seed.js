require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

// 1. On crée le pool de connexion avec la variable d'environnement
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// 2. On le passe à l'adapter Prisma
const adapter = new PrismaPg(pool);

// 3. On donne l'adapter au client Prisma
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('⏳ Remplissage de la base de données...');

  await prisma.taille.createMany({
    data: [
      { nom: 'Petite 450ml', prix: 3.5 },
      { nom: 'Moyen 750ml', prix: 5.5 },
      { nom: 'Grand 1000ml', prix: 7.0 }
    ]
  });

  await prisma.supplement.createMany({
    data: [
      { nom: 'Kinder Bueno', prix: 0.80 },
      { nom: 'Nutella', prix: 0.80 },
      { nom: 'Spéculoos fondu', prix: 0.80 },
      { nom: 'M&M\'s', prix: 0.80 }
    ]
  });

  await prisma.tiramisu.createMany({
    data: [
      { nom: 'Tiramisu Classique', description: 'La recette traditionnelle maison sans alcool ni café', listeIngredients: 'Mascarpone, sucre, oeufs, sucre vanillé, lait (pour l\'imbibage des biscuits), biscuits (Oreo, Spéculoos ou Petit Beurre)' },
      { nom: 'Tira-crêpes', description: 'L\'alliance gourmande du tiramisu et des crêpes maison', listeIngredients: 'Farine, oeufs, lait, sucre (pour les crêpes), Mascarpone, sucre vanillé (pour la crème)' }
    ]
  });

  console.log('✅ Base de données remplie avec succès !');
}

main()
  .catch((e) => {
    console.error('❌ Erreur :', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });