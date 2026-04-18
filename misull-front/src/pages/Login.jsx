// src/pages/Login.jsx
// Page de connexion et d'inscription.
// Un seul formulaire avec deux modes : "connexion" et "inscription"
// On bascule entre les deux avec un simple état local.

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import useAuthStore from '../store/useAuthStore';
import '../App.css';

function Login() {
  // Mode actuel : 'connexion' ou 'inscription'
  const [mode, setMode] = useState('connexion');

  // Les valeurs des champs du formulaire
  const [pseudo, setPseudo] = useState('');
  const [motDePasse, setMotDePasse] = useState('');

  // Message d'erreur ou de succès affiché sous le formulaire
  const [message, setMessage] = useState('');
  const [erreur, setErreur] = useState(false);

  // Pour rediriger après connexion
  const navigate = useNavigate();

  // La fonction du store Zustand pour sauvegarder l'utilisateur connecté
  const seConnecter = useAuthStore(state => state.seConnecter);

  // ─────────────────────────────────────────────
  // SOUMISSION DU FORMULAIRE
  // ─────────────────────────────────────────────

  const handleSubmit = async () => {
    // On remet les messages à zéro avant chaque tentative
    setMessage('');
    setErreur(false);

    // Vérification basique côté frontend avant même d'appeler l'API
    if (!pseudo || !motDePasse) {
      setErreur(true);
      setMessage('Remplis tous les champs !');
      return;
    }

    try {
      if (mode === 'inscription') {
        // Appel à la route POST /api/users/register
        await api.post('/api/users/register', { pseudo, motDePasse });
        setMessage('Compte créé ! Tu peux maintenant te connecter.');
        setMode('connexion'); // On bascule vers le mode connexion
        setMotDePasse('');    // On vide le mot de passe pour que l'user le retape

      } else {
        // Appel à la route POST /api/users/login
        const reponse = await api.post('/api/users/login', { pseudo, motDePasse });

        // On récupère le token et les infos utilisateur depuis la réponse
        const { token, user } = reponse.data;

        // On sauvegarde dans Zustand + localStorage
        seConnecter(user, token);

        // On redirige vers la page de commande
        navigate('/commande');
      }

    } catch (error) {
      // L'API renvoie un message d'erreur dans error.response.data.message
      setErreur(true);
      setMessage(error.response?.data?.message || 'Une erreur est survenue.');
    }
  };

  return (
    <div className="app-container">
      <div style={styles.container}>

        {/* Logo */}
        <img src="/logo.jpg" alt="Logo Misull" style={styles.logo} />

        {/* Titre qui change selon le mode */}
        <h1 style={styles.titre}>
          {mode === 'connexion' ? 'Content de te revoir 👋' : 'Crée ton compte 🍰'}
        </h1>

        {/* Champ pseudo */}
        <div style={styles.champGroupe}>
          <label style={styles.label}>Pseudo</label>
          <input
            type="text"
            value={pseudo}
            onChange={e => setPseudo(e.target.value)}
            placeholder="Ton pseudo..."
            style={styles.input}
          />
        </div>

        {/* Champ mot de passe */}
        <div style={styles.champGroupe}>
          <label style={styles.label}>Mot de passe</label>
          <input
            type="password"
            value={motDePasse}
            onChange={e => setMotDePasse(e.target.value)}
            placeholder="Ton mot de passe..."
            style={styles.input}
            // Permet de soumettre avec la touche Entrée
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          />
        </div>

        {/* Indication pour l'inscription */}
        {mode === 'inscription' && (
          <p style={{ fontSize: '0.8rem', color: '#888', marginBottom: '10px' }}>
            Mot de passe : 8 caractères min, une lettre, un caractère spécial (!@#...), sans espaces.
          </p>
        )}

        {/* Message d'erreur ou de succès */}
        {message && (
          <div style={{
            padding: '10px',
            borderRadius: '6px',
            marginBottom: '15px',
            backgroundColor: erreur ? '#ffe6e6' : '#e6ffe6',
            color: erreur ? '#cc0000' : '#006600',
            border: `1px solid ${erreur ? '#ffcccc' : '#ccffcc'}`,
            fontSize: '0.9rem',
            textAlign: 'center',
          }}>
            {message}
          </div>
        )}

        {/* Bouton principal */}
        <button onClick={handleSubmit} style={styles.bouton}>
          {mode === 'connexion' ? 'Se connecter' : "S'inscrire"}
        </button>

        {/* Lien pour basculer entre les deux modes */}
        <p style={styles.switchTexte}>
          {mode === 'connexion' ? "Pas encore de compte ? " : "Déjà un compte ? "}
          <span
            onClick={() => {
              setMode(mode === 'connexion' ? 'inscription' : 'connexion');
              setMessage(''); // On efface les messages quand on change de mode
            }}
            style={styles.switchLien}
          >
            {mode === 'connexion' ? "S'inscrire" : 'Se connecter'}
          </span>
        </p>

      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────
const styles = {
  container: {
    maxWidth: '420px',
    margin: '40px auto',
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  logo: {
    width: '90px',
    height: '90px',
    borderRadius: '50%',
    objectFit: 'cover',
    marginBottom: '20px',
  },
  titre: {
    fontSize: '1.5rem',
    color: '#3b2f2f',
    marginBottom: '25px',
    textAlign: 'center',
  },
  champGroupe: {
    width: '100%',
    marginBottom: '15px',
  },
  label: {
    display: 'block',
    marginBottom: '6px',
    fontWeight: 'bold',
    color: '#3b2f2f',
    fontSize: '0.9rem',
  },
  input: {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #c8b49c',
    fontSize: '1rem',
    backgroundColor: '#faf7f2',
    boxSizing: 'border-box', // Pour que le padding ne déborde pas
    outline: 'none',
  },
  bouton: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#c0392b',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '5px',
  },
  switchTexte: {
    marginTop: '20px',
    fontSize: '0.9rem',
    color: '#666',
  },
  switchLien: {
    color: '#c0392b',
    fontWeight: 'bold',
    cursor: 'pointer',
    textDecoration: 'underline',
  },
};

export default Login;