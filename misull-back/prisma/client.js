// prisma/client.js
// Ce fichier est le point d'entrée UNIQUE vers la base de données.
// Tous les services l'importeront au lieu de créer leur propre connexion.

const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

// On crée le pool de connexions PostgreSQL une seule fois
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL 
});

// On crée l'adaptateur qui fait le pont entre Prisma et pg
const adapter = new PrismaPg(pool);

// On crée LE client Prisma unique de toute l'application
const prisma = new PrismaClient({ adapter });

// On l'exporte pour que tous les services puissent l'importer
module.exports = prisma;