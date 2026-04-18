// src/pages/Profil.jsx
// Page profil du client connecté.
// Affiche ses points de fidélité avec une jauge visuelle
// et l'historique de toutes ses commandes passées.

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import useAuthStore from '../store/useAuthStore';
import '../App.css';
import Chargement from '../components/Chargement';


function Profil() {
  const { utilisateur } = useAuthStore();
  const navigate = useNavigate();

  // Les données du profil venant de l'API (points à jour, etc.)
  const [profil, setProfil] = useState(null);

  // L'historique des commandes
  const [commandes, setCommandes] = useState([]);

  // Pour afficher un chargement
  const [chargement, setChargement] = useState(true);

  // ─────────────────────────────────────────────
  // PROTECTION + CHARGEMENT DES DONNÉES
  // ─────────────────────────────────────────────
  useEffect(() => {
    if (!utilisateur) {
      navigate('/login');
      return;
    }

    // On lance les deux appels API en parallèle avec Promise.all
    // C'est plus rapide que de les faire l'un après l'autre
    Promise.all([
      api.get('/api/users/profil'),
      api.get('/api/orders/historique')
    ])
      .then(([reponseProfil, reponseHistorique]) => {
        setProfil(reponseProfil.data.profil);
        setCommandes(reponseHistorique.data.commandes);
      })
      .catch(erreur => {
        // On affiche l'erreur complète pour comprendre ce qui se passe
        console.error("Erreur chargement profil :", erreur.response?.status, erreur.response?.data);
      })
      .finally(() => setChargement(false));
  }, []);

  // ─────────────────────────────────────────────
  // CALCUL DE LA JAUGE DE FIDÉLITÉ
  // ─────────────────────────────────────────────
  // Règle : 5 points = 1 tiramisu gratuit
  // On calcule la progression dans le cycle actuel (0 à 5)
const calculerJauge = (points) => {
  const tiramisusGratuits = Math.floor(points / 5);
  
  // Si les points sont un multiple exact de 5,
  // on affiche 5/5 plutot que 0/5
  const pointsDansCycle = points % 5 === 0 && points > 0 ? 5 : points % 5;
  
  const pourcentage = (pointsDansCycle / 5) * 100;
  return { pointsDansCycle, tiramisusGratuits, pourcentage };
};

  // ─────────────────────────────────────────────
  // FORMATER LA DATE
  // ─────────────────────────────────────────────
  const formaterDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // ─────────────────────────────────────────────
  // COULEUR DU STATUT
  // ─────────────────────────────────────────────
  const couleurStatut = (statut) => {
    const couleurs = {
      'EN_ATTENTE': '#f0a500',
      'EN_PREPARATION': '#2980b9',
      'PRETE': '#27ae60',
      'LIVREE': '#888',
      'ANNULEE': '#c0392b',
    };
    return couleurs[statut] || '#888';
  };

  if (chargement) return <Chargement texte="Chargement du profil..." />;


  const { pointsDansCycle, tiramisusGratuits, pourcentage } = calculerJauge(profil?.pointsFidelite || 0);

  return (
    <div className="app-container">
      <main className="main-content">

        <h1 style={{ textAlign: 'center', fontSize: '1.8rem', marginBottom: '25px' }}>
          Ton profil 👤
        </h1>

        {/* ── CARTE FIDÉLITÉ ── */}
        <section className="category-section">
          <h2 className="category-title">Carte de fidélité</h2>

          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <p style={{ fontSize: '1.1rem', color: '#3b2f2f', marginBottom: '5px' }}>
              Bonjour <strong>{profil?.pseudo}</strong> !
            </p>
            <p style={{ color: '#666', marginBottom: '20px' }}>
              Tu as <strong style={{ color: '#c0392b' }}>{profil?.pointsFidelite} point{profil?.pointsFidelite > 1 ? 's' : ''}</strong> au total.
            </p>

            {/* Jauge visuelle */}
            <div style={{ marginBottom: '10px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.85rem',
                color: '#666',
                marginBottom: '8px'
              }}>
                <span>{pointsDansCycle} / 5 tiramisus</span>
                <span style={{ marginLeft: '8px' }}>
                  {pointsDansCycle === 5
                    ? 'Tiramisu gratuit disponible !'
                    : `Prochain gratuit dans ${5 - pointsDansCycle} commande${5 - pointsDansCycle > 1 ? 's' : ''}`
                  }
                </span>

              </div>

              {/* Barre de progression */}
              <div style={{
                backgroundColor: '#f0e6d2',
                borderRadius: '20px',
                height: '20px',
                overflow: 'hidden',
              }}>
                <div style={{
                  width: `${pourcentage}%`,
                  height: '100%',
                  backgroundColor: '#c0392b',
                  borderRadius: '20px',
                  // Transition fluide quand les points augmentent
                  transition: 'width 0.5s ease',
                }} />
              </div>
            </div>

            {/* Tiramisus gratuits disponibles */}
            {tiramisusGratuits > 0 && (
              <div style={{
                backgroundColor: '#e6ffe6',
                border: '1px solid #ccffcc',
                borderRadius: '10px',
                padding: '15px',
                marginTop: '15px',
                color: '#006600',
                fontWeight: 'bold',
              }}>
                🎉 Tu as {tiramisusGratuits} tiramisu{tiramisusGratuits > 1 ? 's' : ''} gratuit{tiramisusGratuits > 1 ? 's' : ''} disponible{tiramisusGratuits > 1 ? 's' : ''} !
              </div>
            )}

            {/* Icônes de progression (5 cases) */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '10px',
              marginTop: '20px'
            }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} style={{
                  width: '45px',
                  height: '45px',
                  borderRadius: '50%',
                  backgroundColor: i <= pointsDansCycle ? '#c0392b' : '#f0e6d2',
                  border: '2px solid #c0392b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem',
                  transition: 'all 0.3s ease',
                }}>
                  {i <= pointsDansCycle ? '🍰' : ''}
                </div>
              ))}
            </div>
            <p style={{ fontSize: '0.8rem', color: '#999', marginTop: '10px' }}>
              5 tiramisus achetés = 1 Petite tiramisu (3,5€) offerte 🎁
            </p>
          </div>
        </section>

        {/* ── HISTORIQUE DES COMMANDES ── */}
        <section className="category-section">
          <h2 className="category-title">Tes commandes</h2>

          {commandes.length === 0 ? (
            <p style={{ color: '#888', textAlign: 'center', padding: '20px' }}>
              Tu n'as pas encore passé de commande.
            </p>
          ) : (
            commandes.map((commande) => (
              <div key={commande.id_commande} style={styles.carteCommande}>

                {/* En-tête de la commande */}
                <div style={styles.enTeteCommande}>
                  <div>
                    <span style={{ fontWeight: 'bold', color: '#3b2f2f' }}>
                      Commande #{commande.id_commande}
                    </span>
                    <p style={{ margin: '3px 0 0 0', fontSize: '0.85rem', color: '#888' }}>
                      {formaterDate(commande.dateCreation)}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    {/* Badge de statut coloré */}
                    <span style={{
                      backgroundColor: couleurStatut(commande.statut),
                      color: 'white',
                      padding: '4px 10px',
                      borderRadius: '20px',
                      fontSize: '0.8rem',
                      fontWeight: 'bold',
                    }}>
                      {commande.statut.replace('_', ' ')}
                    </span>
                    <p style={{ margin: '5px 0 0 0', fontWeight: 'bold', color: '#c0392b' }}>
                      {commande.prixTotal}€
                    </p>
                  </div>
                </div>

                {/* Détail des lignes */}
                <div style={{ marginTop: '10px' }}>
                  {commande.lignes.map((ligne) => (
                    <div key={ligne.id_ligne} style={styles.ligneDetail}>
                      <span>
                        {ligne.tiramisu.nom} - {ligne.taille.nom} - {ligne.gout.nom}
                        {ligne.supplements.length > 0 && (
                          <span style={{ color: '#c0392b', fontSize: '0.85rem' }}>
                            {' '}(+ {ligne.supplements.map(s => s.nom).join(', ')})
                          </span>
                        )}
                      </span>
                      <span style={{ color: '#666', fontSize: '0.85rem' }}>
                        x{ligne.quantite}
                      </span>
                    </div>
                  ))}
                </div>

              </div>
            ))
          )}
        </section>

      </main>
    </div>
  );
}

// ─────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────
const styles = {
  carteCommande: {
    border: '1px solid #f0e6d2',
    borderRadius: '10px',
    padding: '15px',
    marginBottom: '15px',
  },
  enTeteCommande: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottom: '1px solid #f0e6d2',
    paddingBottom: '10px',
  },
  ligneDetail: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '5px 0',
    fontSize: '0.9rem',
    color: '#3b2f2f',
    borderBottom: '1px solid #faf7f2',
  },
};

export default Profil;