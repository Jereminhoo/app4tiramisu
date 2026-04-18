// src/components/Navbar.jsx
// La barre de navigation affichée sur toutes les pages.
// Elle s'adapte selon si l'utilisateur est connecté ou non,
// et montre le lien Admin uniquement aux administrateurs.

import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';

function Navbar() {
  // On récupère les infos du store Zustand
  // utilisateur = l'objet { id, pseudo, role } ou null si déconnecté
  // seDeconnecter = la fonction pour vider le store et le localStorage
  const { utilisateur, panier, seDeconnecter } = useAuthStore();

  // useNavigate permet de rediriger l'utilisateur vers une autre page
  const navigate = useNavigate();

  // Fonction appelée quand on clique sur "Se déconnecter"
  const handleDeconnexion = () => {
    seDeconnecter();          // On vide le store et le localStorage
    navigate('/');            // On redirige vers la page d'accueil
  };

  return (
    <nav style={styles.nav}>

      {/* Logo / Nom du site — cliquable pour revenir à l'accueil */}
      <Link to="/" style={styles.logo}>
        🍰 Misull
      </Link>

      {/* Liens de navigation */}
      <div style={styles.links}>

        {/* Ces liens ne sont visibles que si on est connecté */}
        {utilisateur ? (
        <>
            <Link to="/commande" style={styles.link}>Commander</Link>
            
            <Link to="/checkout" style={styles.link}>
            🛒 Panier
            {panier.length > 0 && (
                <span style={styles.badge}>{panier.length}</span>
            )}
            </Link>

            <Link to="/profil" style={styles.link}>
            👤 {utilisateur.pseudo}
            </Link>

            {utilisateur.role === 'ADMIN' && (
            <Link to="/admin" style={styles.linkAdmin}>
                🛠️ Admin
            </Link>
            )}

            <button onClick={handleDeconnexion} style={styles.boutonDeconnexion}>
            Déconnexion
            </button>
        </>
        ) : (
        <Link to="/login" style={styles.link}>Connexion</Link>
        )}

      </div>
    </nav>
  );
}

// ─────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────
// On définit les styles directement en JavaScript (style inline)
// pour garder le composant autonome sans fichier CSS séparé

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between', // Logo à gauche, liens à droite
    alignItems: 'center',
    padding: '12px 30px',
    backgroundColor: '#3b2f2f',      // Marron foncé comme le style Instagram
    color: '#f7f3eb',                 // Crème pour le texte
    position: 'sticky',              // La navbar reste en haut au scroll
    top: 0,
    zIndex: 100,                     // Elle passe par-dessus le reste
  },
  logo: {
    color: '#f7f3eb',
    textDecoration: 'none',
    fontWeight: 'bold',
    fontSize: '1.4rem',
    letterSpacing: '1px',
  },
  links: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',                     // Espace entre chaque lien
  },
  link: {
    color: '#f7f3eb',
    textDecoration: 'none',
    fontSize: '1rem',
    position: 'relative',            // Pour positionner le badge panier
  },
  linkAdmin: {
    color: '#f0a500',                // Orange/doré pour distinguer le lien admin
    textDecoration: 'none',
    fontSize: '1rem',
    fontWeight: 'bold',
  },
  badge: {
    backgroundColor: '#c0392b',     // Rouge pour attirer l'attention
    color: 'white',
    borderRadius: '50%',
    padding: '2px 7px',
    fontSize: '0.75rem',
    marginLeft: '5px',
  },
  boutonDeconnexion: {
    backgroundColor: 'transparent',
    border: '1px solid #f7f3eb',
    color: '#f7f3eb',
    padding: '6px 14px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
};

export default Navbar;