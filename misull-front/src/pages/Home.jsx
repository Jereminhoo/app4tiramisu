// src/pages/Home.jsx
// Page d'accueil publique — visible par tout le monde.
// Elle affiche le menu, les prix, les suppléments et les infos importantes.

import { useEffect, useState } from 'react';
import api from '../api/axios'; // On utilise notre instance Axios centralisée
import '../App.css'; // Import du CSS global
import Chargement from '../components/Chargement';


function Home() {
  // État local pour stocker les données du menu venant de l'API
  const [menu, setMenu] = useState(null);

  // useEffect se lance une seule fois au chargement de la page (le [] à la fin)
  useEffect(() => {
    // On appelle notre API Express pour récupérer le menu complet
    api.get('/api/menu')
      .then(reponse => setMenu(reponse.data))
      .catch(erreur => console.error("Erreur chargement menu :", erreur));
  }, []);

  // Tant que le menu n'est pas chargé, on affiche un message
  if (!menu) return <Chargement texte="Chargement de la carte..." />;


  return (
    <div className="app-container">

      {/* En-tête avec logo */}
      <header className="header">
        <img src="/logo.jpg" alt="Logo Misull" className="logo" />
        <p className="subtitle">Tiramisus et Tira-crêpes fait maison</p>
      </header>

      {/* Image de bienvenue */}
      <div className="welcome-banner">
        <img
          src="/welcome.jpg"
          alt="Welcome to Misull"
        />
      </div>

      {/* Bannière d'avertissement projet étudiant */}
      <div style={{
        backgroundColor: '#ffe6e6',
        color: '#cc0000',
        padding: '15px',
        textAlign: 'center',
        borderRadius: '8px',
        maxWidth: '800px',
        margin: '0 auto 25px auto',
        fontWeight: 'bold',
        border: '1px solid #ffcccc'
      }}>
        ⚠️ Ceci est un projet étudiant de simulation. Aucune vraie commande ne sera traitée.
      </div>

      <main className="main-content">

        {/* Section desserts */}
        <section className="category-section">
          <h2 className="category-title">Nos Desserts</h2>
          <div className="dessert-list">
            {menu.tiramisus.map((tira) => (
              <div key={tira.id_tiramisu} className="dessert-card">
                <h3 className="dessert-name">{tira.nom}</h3>
                <p className="dessert-desc">{tira.description}</p>
                <p className="dessert-ingredients">Ingrédients : {tira.listeIngredients}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Section tailles et prix */}
        <section className="category-section">
          <h2 className="category-title">Tailles / Prix</h2>
          <div className="flavors-container">
            {menu.tailles.map((taille) => (
              <span key={taille.id_taille} className="price-badge">
                {taille.nom} : <strong>{taille.prix}€</strong>
              </span>
            ))}
          </div>
        </section>

        {/* Section suppléments */}
        <section className="category-section">
          <h2 className="category-title">Garnitures Supplémentaires (0,80€)</h2>
          <p className="optionnel-text">OPTIONNEL : Vous n'êtes pas obligé d'en prendre !</p>
          <div className="flavors-container">
            {menu.supplements.map((supp) => (
              <span key={supp.id_supplement} className="supp-badge">
                {supp.nom}
              </span>
            ))}
          </div>
        </section>

        {/* Section infos importantes */}
        <section className="info-grid">
          <div className="info-box">
            <strong>1. Étudiants</strong>
            <p>On fait ça avec passion, mais pas de commandes en urgence.</p>
          </div>
          <div className="info-box">
            <strong>2. Allergies</strong>
            <p>Sans alcool ni café. Contient du lait.</p>
          </div>
          <div className="info-box">
            <strong>3. Livraison</strong>
            <p>Retrait gratuit / Livraison +2€, uniquement le samedi</p>
          </div>
          <div className="info-box">
            <strong>4. Paiement</strong>
            <p>En espèces si possible.</p>
          </div>
        </section>

      </main>
      {/* Version — discrète, en bas à droite */}
      <p style={{
        position: 'fixed',      /* Reste visible même en scrollant */
        bottom: '10px',
        right: '12px',
        fontSize: '0.7rem',
        color: '#c8b49c',       /* Couleur marron clair, très discret */
        margin: 0,
        userSelect: 'none',     /* On peut pas la sélectionner au clic */
      }}>
        v4.0.0
      </p>
    </div>
  );
}

export default Home;