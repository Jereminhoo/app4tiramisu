// src/api/axios.js
// Ce fichier configure Axios une seule fois pour toute l'application.
// Au lieu de répéter "http://localhost:3000" dans chaque composant,
// on le définit ici et tous les appels API partent de cette base.

import axios from 'axios';

// On crée une instance Axios personnalisée
const api = axios.create({
  baseURL: 'http://localhost:3000', // L'adresse de ton serveur Express
});

// ─────────────────────────────────────────────
// INTERCEPTEUR DE REQUÊTE
// ─────────────────────────────────────────────
// Un intercepteur c'est comme un agent qui inspecte CHAQUE requête
// avant qu'elle parte vers le serveur.
// Ici, il ajoute automatiquement le token JWT dans les headers
// pour que tu n'aies pas à le faire manuellement à chaque appel.

api.interceptors.request.use((config) => {
  // On va chercher le token dans le localStorage du navigateur
  // C'est là que Zustand va le stocker quand l'utilisateur se connecte
  const token = localStorage.getItem('token');

  if (token) {
    // Si un token existe, on l'ajoute automatiquement à chaque requête
    // sous la forme "Bearer eyJhbGci..." que ton middleware auth.js attend
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  return config; // On laisse partir la requête
});

export default api;