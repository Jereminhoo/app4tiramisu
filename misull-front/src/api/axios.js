// src/api/axios.js
import axios from 'axios';
import useAuthStore from '../store/useAuthStore';

//utilise la variable d'environnement si disponible, sinon localhost
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
});

// ─────────────────────────────────────────────
// INTERCEPTEUR DE REQUÊTE
// ─────────────────────────────────────────────
// Ajoute automatiquement le token JWT à chaque requête
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  return config;
});

// ─────────────────────────────────────────────
// INTERCEPTEUR DE RÉPONSE
// ─────────────────────────────────────────────
// Inspecte chaque réponse du serveur AVANT qu'elle arrive au composant.
// Si le serveur répond 403 "Ce compte a été banni",
// on déconnecte l'utilisateur automatiquement.

api.interceptors.response.use(
  // Réponse normale (200, 201...) — on la laisse passer sans rien faire
  (response) => response,

  // Réponse d'erreur (400, 401, 403, 500...)
  (error) => {
    const statut = error.response?.status;
    const message = error.response?.data?.message;

    // Si le serveur répond 403 avec le message de bannissement
    // on déconnecte l'utilisateur automatiquement
    if (statut === 403 && message === 'Ce compte a été banni.') {
      // On récupère la fonction de déconnexion du store Zustand
      // sans utiliser le hook (car on est hors d'un composant React)
      const seDeconnecter = useAuthStore.getState().seDeconnecter;
      seDeconnecter();

      // On redirige vers la page de connexion
      // window.location force un vrai rechargement de la page
      window.location.href = '/login?banni=true';

    }

    // On laisse l'erreur se propager normalement pour les autres cas
    return Promise.reject(error);
  }
);

export default api;