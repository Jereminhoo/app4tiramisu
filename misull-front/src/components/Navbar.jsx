// src/components/Navbar.jsx
// Barre de navigation affichée sur toutes les pages.
// Sur mobile, les liens sont cachés derrière un menu hamburger.

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import './Navbar.css';

function Navbar() {
  const { utilisateur, panier, seDeconnecter } = useAuthStore();
  const navigate = useNavigate();

  // État qui contrôle si le menu mobile est ouvert ou fermé
  const [menuOuvert, setMenuOuvert] = useState(false);

  const handleDeconnexion = () => {
    seDeconnecter();
    navigate('/');
    // On ferme aussi le menu quand on se déconnecte
    setMenuOuvert(false);
  };

  // Ferme le menu quand on clique sur un lien
  // Utile sur mobile pour que le menu disparaisse après navigation
  const fermerMenu = () => setMenuOuvert(false);

  return (
    <nav className="navbar">

      {/* Ligne du haut : logo + bouton hamburger */}
      <div className="navbar-top">

        <Link to="/" className="navbar-logo" onClick={fermerMenu}>
          Misull
        </Link>

        {/* Bouton hamburger — visible uniquement sur mobile via CSS */}
        {/* aria-label pour l'accessibilité (lecteurs d'écran) */}
        <button
          className={`navbar-hamburger ${menuOuvert ? 'ouvert' : ''}`}
          onClick={() => setMenuOuvert(prev => !prev)}
          aria-label="Ouvrir le menu"
        >
          {/* Les 3 traits du hamburger — dessinés en CSS via les ::before ::after */}
          <span className="hamburger-trait" />
          <span className="hamburger-trait" />
          <span className="hamburger-trait" />
        </button>

      </div>

      {/* Les liens de navigation */}
      {/* Sur desktop : toujours visibles */}
      {/* Sur mobile : visibles seulement si menuOuvert = true */}
      <div className={`navbar-links ${menuOuvert ? 'visible' : ''}`}>

        {utilisateur ? (
          <>
            <Link to="/commande" className="navbar-link" onClick={fermerMenu}>
              Commander
            </Link>

            <Link to="/checkout" className="navbar-link" onClick={fermerMenu}>
              Panier
              {panier.length > 0 && (
                <span className="navbar-badge">{panier.length}</span>
              )}
            </Link>

            <Link to="/profil" className="navbar-link" onClick={fermerMenu}>
              {utilisateur.pseudo}
            </Link>

            <Link to="/mes-commandes" className="navbar-link" onClick={fermerMenu}>
              Mes commandes
            </Link>

            {utilisateur.role === 'ADMIN' && (
              <Link to="/admin" className="navbar-link-admin" onClick={fermerMenu}>
                Admin
              </Link>
            )}

            <button
              onClick={handleDeconnexion}
              className="navbar-bouton-deconnexion"
            >
              Deconnexion
            </button>
          </>
        ) : (
          <Link to="/login" className="navbar-link" onClick={fermerMenu}>
            Connexion
          </Link>
        )}

      </div>
    </nav>
  );
}

export default Navbar;