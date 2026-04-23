// src/pages/Home.jsx
// Page d'accueil publique — visible par tout le monde.
// Affiche le menu, les prix, les suppléments et les infos importantes.
// Optimisée pour être "scannable" rapidement sur mobile.

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import useAuthStore from '../store/useAuthStore';
import Chargement from '../components/Chargement';
import '../App.css';

function Home() {
  const [menu, setMenu] = useState(null);
  const navigate = useNavigate();

  // On récupère l'état de connexion depuis le store Zustand
  const utilisateur = useAuthStore(state => state.utilisateur);

  useEffect(() => {
    api.get('/api/menu')
      .then(reponse => setMenu(reponse.data))
      .catch(erreur => console.error("Erreur chargement menu :", erreur));
  }, []);

  if (!menu) return <Chargement texte="Chargement de la carte..." />;

  // Si connecté → /commande, sinon → /login
  const handleCommander = () => {
    if (utilisateur) {
      navigate('/commande');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="app-container">

      {/* ── EN-TÊTE ── */}
      <header className="header">
        <img src="/logo.jpg" alt="Logo Misull" className="logo" />
        <p className="subtitle">Tiramisus et Tira-crêpes fait maison</p>
        <p style={styles.ville}>La Louvière</p>
      </header>

      {/* ── IMAGE DE BIENVENUE ── */}
      <div className="welcome-banner">
        <img src="/welcome.jpg" alt="Welcome to Misull" />
      </div>

      {/* ── BANNIÈRE PROJET ÉTUDIANT ── */}
      <div style={styles.banniereEtudiant}>
        Projet étudiant
      </div>

      <div style={styles.ctaSection}>
        <button onClick={handleCommander} style={styles.boutonCommander}>
          Commander maintenant
        </button>
      </div>

      <main className="main-content">

        {/* ── NOS DESSERTS ── */}
        <section className="category-section">
          <h2 className="category-title">Nos Desserts</h2>
          <div className="dessert-list">
            {menu.tiramisus.map((tira) => (
              <div key={tira.id_tiramisu} className="dessert-card">
                <h3 className="dessert-name">{tira.nom}</h3>
                <p className="dessert-desc">{tira.description}</p>
                <p className="dessert-ingredients">
                  Ingrédients : {tira.listeIngredients}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── TAILLES ET PRIX ──
            Prix en grand pour être vus immédiatement. */}
        <section className="category-section">
          <h2 className="category-title">Tailles et Prix</h2>
          <div style={styles.prixGrid}>
            {menu.tailles.map((taille) => (
              <div key={taille.id_taille} style={styles.prixCard}>
                <p style={styles.prixNom}>{taille.nom}</p>
                <p style={styles.prixMontant}>{taille.prix} €</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── GOÛTS DISPONIBLES ── */}
        <section className="category-section">
          <h2 className="category-title">Goûts disponibles</h2>
          <div className="flavors-container">
            {menu.gouts.map((gout) => (
              <span key={gout.id_gout} className="supp-badge">
                {gout.nom}
              </span>
            ))}
          </div>
        </section>

        {/* ── GARNITURES SUPPLÉMENTAIRES ── */}
        <section className="category-section">
          <h2 className="category-title">Garnitures Supplémentaires</h2>
          <p style={styles.optionnel}>
            OPTIONNEL : +1 € par garniture, vous pouvez en prendre plusieurs !
          </p>
          <div className="flavors-container">
            {menu.supplements.map((supp) => (
              <span key={supp.id_supplement} className="supp-badge">
                {supp.nom}
              </span>
            ))}
          </div>
        </section>

        {/* ── INFOS IMPORTANTES ── */}
        <section className="category-section">
          <h2 className="category-title">Infos importantes</h2>
          <div className="info-grid">
            <div className="info-box">
              <strong>Délai minimum</strong>
              <p>On est étudiants ! Prévoir au moins 1 jour après la commande.</p>
            </div>
            <div className="info-box">
              <strong>Allergies</strong>
              <p>Sans alcool ni café. Contient du lait.</p>
            </div>
            <div className="info-box">
              <strong>Livraison</strong>
              <p>Retrait gratuit. Livraison le samedi : +2,50 €.</p>
            </div>
            <div className="info-box">
              <strong>Paiement</strong>
              <p>En espèces si possible.</p>
            </div>
          </div>
        </section>

        {/* ── LIEN INSTAGRAM ── */}
        <section style={styles.instaSection}>
          <p style={styles.instaTexte}>
            Envie de voir plus de photos et vidéos ?
          </p>
          <a
            href="https://www.instagram.com/misulalouviere"
            target="_blank"
            rel="noopener noreferrer"
            style={styles.instaLien}
          >
            Suivre @misulalouviere sur Instagram
          </a>
        </section>

      </main>

      {/* ── VERSION ── discrète, fixe en bas à droite */}
      <p style={styles.version}>v4.0.0</p>

    </div>
  );
}

// ─────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────
const styles = {
  ville: {
    fontSize: '0.9rem',
    color: '#888',
    margin: '4px 0 0 0',
  },
  banniereEtudiant: {
    backgroundColor: '#ffe6e6',
    color: '#cc0000',
    padding: '12px 20px',
    textAlign: 'center',
    borderRadius: '8px',
    maxWidth: '800px',
    margin: '0 auto 20px auto',
    fontWeight: 'bold',
    border: '1px solid #ffcccc',
    fontSize: '0.9rem',
  },
  ctaSection: {
    textAlign: 'center',
    margin: '0 auto 30px auto',
    maxWidth: '800px',
    padding: '0 20px',
  },
  boutonCommander: {
    backgroundColor: '#c0392b',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    padding: '16px 40px',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(192, 57, 43, 0.3)',
  },
  messageConnexion: {
    marginTop: '12px',
    fontSize: '0.9rem',
    color: '#666',
  },
  lienConnexion: {
    color: '#c0392b',
    fontWeight: 'bold',
    cursor: 'pointer',
    textDecoration: 'underline',
  },
  prixGrid: {
    display: 'flex',
    gap: '15px',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  prixCard: {
    backgroundColor: '#faf7f2',
    border: '1px solid #c8b49c',
    borderRadius: '12px',
    padding: '20px 30px',
    textAlign: 'center',
    minWidth: '140px',
    flex: '1',
  },
  prixNom: {
    fontSize: '1rem',
    color: '#3b2f2f',
    margin: '0 0 8px 0',
    fontWeight: 'bold',
  },
  prixMontant: {
    fontSize: '1.8rem',
    color: '#c0392b',
    fontWeight: 'bold',
    margin: 0,
  },
  optionnel: {
    fontSize: '0.9rem',
    color: '#888',
    textAlign: 'center',
    marginBottom: '15px',
    fontStyle: 'italic',
  },
  instaSection: {
    textAlign: 'center',
    margin: '30px auto 20px auto',
    padding: '25px',
    backgroundColor: '#faf7f2',
    borderRadius: '12px',
    border: '1px solid #c8b49c',
    maxWidth: '500px',
  },
  instaTexte: {
    color: '#3b2f2f',
    marginBottom: '12px',
    fontSize: '1rem',
  },
  instaLien: {
    color: '#c0392b',
    fontWeight: 'bold',
    textDecoration: 'none',
    fontSize: '1rem',
    display: 'inline-block',
  },
  version: {
    position: 'fixed',
    bottom: '10px',
    right: '12px',
    fontSize: '0.7rem',
    color: '#c8b49c',
    margin: 0,
    userSelect: 'none',
  },
};

export default Home;