// src/pages/NotFound.jsx
// Page affichée quand l'URL ne correspond à aucune route connue.
// React Router redirige automatiquement ici via la route "*".

import { Link } from 'react-router-dom';
import './NotFound.css';

function NotFound() {
  return (
    <div className="notfound-container">

      {/* Le code d'erreur — grand et visible */}
      <p className="notfound-code">404</p>

      {/* Petit trait rouge décoratif */}
      <hr className="notfound-separateur" />

      {/* Message principal */}
      <h1 className="notfound-titre">Cette page n'existe pas</h1>

      {/* Explication avec un clin d'oeil Misull */}
      <p className="notfound-message">
        On a cherché partout, même dans nos tiramisus. Cette page est introuvable.
      </p>

      {/* Lien vers l'accueil stylisé comme un bouton */}
      {/* On utilise <Link> de React Router plutot que <button> + navigate
          car c'est une navigation simple sans logique — meilleure pratique */}
      <Link to="/" className="notfound-bouton">
        Retour a l'accueil
      </Link>

    </div>
  );
}

export default NotFound;