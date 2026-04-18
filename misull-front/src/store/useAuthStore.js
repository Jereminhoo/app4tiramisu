// src/store/useAuthStore.js
import { create } from 'zustand';

// Récupère l'utilisateur depuis le token au démarrage
const recupererUtilisateur = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp * 1000 < Date.now()) {
      localStorage.removeItem('token');
      return null;
    }
    return { id: payload.id, role: payload.role, pseudo: payload.pseudo };
  } catch {
    localStorage.removeItem('token');
    return null;
  }
};

// Récupère la commande en cours depuis localStorage au démarrage
const recupererCommandeValidee = () => {
  const data = localStorage.getItem('commandeValidee');
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
};

// Récupère le panier de l'utilisateur depuis localStorage
// Chaque utilisateur a sa propre clé : "panier_1", "panier_2" etc.
const recupererPanier = (id_utilisateur) => {
  if (!id_utilisateur) return [];
  const data = localStorage.getItem(`panier_${id_utilisateur}`);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
};

const useAuthStore = create((set) => ({

  utilisateur: recupererUtilisateur(),
  token: localStorage.getItem('token') || null,
  // On charge le panier de l'utilisateur connecté au démarrage
  panier: recupererPanier(recupererUtilisateur()?.id),
  commandeValidee: recupererCommandeValidee(),

  seConnecter: (utilisateur, token) => {
    localStorage.setItem('token', token);
    // On charge le panier propre à CET utilisateur
    const panier = recupererPanier(utilisateur.id);
    set({ utilisateur, token, panier });
  },

  seDeconnecter: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('commandeValidee');
    set({ utilisateur: null, token: null, panier: [], commandeValidee: null });
  },

  ajouterAuPanier: (ligne) => {
    set((state) => {
      const nouveauPanier = [...state.panier, ligne];
      // On sauvegarde le panier avec l'id utilisateur comme clé unique
      localStorage.setItem(`panier_${state.utilisateur.id}`, JSON.stringify(nouveauPanier));
      return { panier: nouveauPanier };
    });
  },

  supprimerDuPanier: (index) => {
    set((state) => {
      const nouveauPanier = state.panier.filter((_, i) => i !== index);
      localStorage.setItem(`panier_${state.utilisateur.id}`, JSON.stringify(nouveauPanier));
      return { panier: nouveauPanier };
    });
  },

  viderPanier: () => {
    set((state) => {
      // On supprime aussi du localStorage
      if (state.utilisateur?.id) {
        localStorage.removeItem(`panier_${state.utilisateur.id}`);
      }
      return { panier: [] };
    });
  },

  // Sauvegarde la commande dans le store ET dans localStorage
  setCommandeValidee: (commande) => {
    localStorage.setItem('commandeValidee', JSON.stringify(commande));
    set({ commandeValidee: commande });
  },

  // Efface la commande du store ET du localStorage
  clearCommandeValidee: () => {
    localStorage.removeItem('commandeValidee');
    set({ commandeValidee: null });
  },

}));

export default useAuthStore;