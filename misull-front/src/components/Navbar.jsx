// src/components/Navbar.jsx
// Barre de navigation affichée sur toutes les pages.
// Sur mobile, les liens sont cachés derrière un menu hamburger.
// Les liens Commander/Panier/Profil sont cachés pour l'admin.

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import './Navbar.css';

function Navbar() {
  const { utilisateur, panier, seDeconnecter } = useAuthStore();
  const navigate = useNavigate();

  const [menuOuvert, setMenuOuvert] = useState(false);

  const handleDeconnexion = () => {
    seDeconnecter();
    navigate('/');
    setMenuOuvert(false);
  };

  const fermerMenu = () => setMenuOuvert(false);

  return (
    <nav className="navbar">

      <div className="navbar-top">
        <Link to="/" className="navbar-logo" onClick={fermerMenu}>
          Misull
        </Link>

        <button
          className={`navbar-hamburger ${menuOuvert ? 'ouvert' : ''}`}
          onClick={() => setMenuOuvert(prev => !prev)}
          aria-label="Ouvrir le menu"
        >
          <span className="hamburger-trait" />
          <span className="hamburger-trait" />
          <span className="hamburger-trait" />
        </button>
      </div>

      <div className={`navbar-links ${menuOuvert ? 'visible' : ''}`}>

        {utilisateur ? (
          <>
            {/* Liens visibles uniquement pour les clients — pas pour l'admin */}
            {utilisateur.role !== 'ADMIN' && (
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
              </>
            )}

            {/* Lien admin — visible uniquement pour l'admin */}
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