// src/components/Chargement.jsx
// Composant de chargement réutilisable.
// On le place sur toutes les pages qui attendent des données de l'API.

function Chargement({ texte = 'Chargement...' }) {
  // La prop "texte" est optionnelle — par défaut c'est "Chargement..."
  // Ca permet d'afficher un message différent selon la page
  return (
    <div className="loading">
      <div className="loading-spinner" />
      <p>{texte}</p>
    </div>
  );
}

export default Chargement;