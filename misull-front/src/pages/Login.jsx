// src/pages/Login.jsx
// Page de connexion et d'inscription.
// Deux modes : "connexion" et "inscription", on bascule avec un état local.
// Fonctionnalités :
// - Validation simplifiée
// - Confirmation du mot de passe en mode inscription
// - Bouton oeil pour voir/cacher le mot de passe (fonctionne sur mobile)
// - Auto-connexion après inscription

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import useAuthStore from '../store/useAuthStore';
import '../App.css';

function Login() {
  const [mode, setMode] = useState('connexion');
  const [pseudo, setPseudo] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [confirmation, setConfirmation] = useState(''); // Nouveau : confirmation mdp
  const [voirMdp, setVoirMdp] = useState(false);       // Nouveau : afficher/cacher mdp
  const [message, setMessage] = useState('');
  const [erreur, setErreur] = useState(false);

  const navigate = useNavigate();
  const seConnecter = useAuthStore(state => state.seConnecter);

  // ─────────────────────────────────────────
  // DÉTECTION DU BANNISSEMENT
  // Si l'intercepteur axios a redirigé vers /login?banni=true,
  // on affiche un message d'erreur immédiatement au chargement
  // ─────────────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('banni') === 'true') {
      setErreur(true);
      setMessage('Ton compte a été banni. Contacte un administrateur.');
    }
  }, []); // [] = se lance une seule fois au chargement

  // ─────────────────────────────────────────
  // RÉINITIALISER LES CHAMPS quand on change de mode
  // ─────────────────────────────────────────
  const changerMode = (nouveauMode) => {
    setMode(nouveauMode);
    setMessage('');
    setErreur(false);
    setMotDePasse('');
    setConfirmation('');
    setVoirMdp(false);
  };

  // ─────────────────────────────────────────
  // SOUMISSION DU FORMULAIRE
  // ─────────────────────────────────────────
  const handleSubmit = async () => {
    setMessage('');
    setErreur(false);

    // Vérification des champs vides
    if (!pseudo || !motDePasse) {
      setErreur(true);
      setMessage('Remplis tous les champs !');
      return;
    }

    // En mode inscription, vérifier que les deux mots de passe correspondent
    if (mode === 'inscription' && motDePasse !== confirmation) {
      setErreur(true);
      setMessage('Les mots de passe ne correspondent pas !');
      return;
    }

    try {
      if (mode === 'inscription') {
        // ─── INSCRIPTION + AUTO-CONNEXION ───
        // Le backend renvoie maintenant un token directement après l'inscription
        // On appelle seConnecter() exactement comme après un login normal
        const reponse = await api.post('/api/users/register', { pseudo, motDePasse });
        const { token, user } = reponse.data;
        seConnecter(user, token); // On connecte l'utilisateur directement
        // Si admin → dashboard admin, sinon → page commande
        navigate(user.role === 'ADMIN' ? '/admin' : '/commande');
      } else {
        // ─── CONNEXION NORMALE ───
        const reponse = await api.post('/api/users/login', { pseudo, motDePasse });
        const { token, user } = reponse.data;
        seConnecter(user, token);
        // Si admin → dashboard admin, sinon → page commande
        navigate(user.role === 'ADMIN' ? '/admin' : '/commande');
      }
    } catch (error) {
      setErreur(true);
      setMessage(error.response?.data?.message || 'Une erreur est survenue.');
    }
  };

  // ─────────────────────────────────────────
  // RENDU
  // ─────────────────────────────────────────
  return (
    <div className="app-container">
      <div style={styles.container}>

        <img src="/logo.jpg" alt="Logo Misull" style={styles.logo} />

        <h1 style={styles.titre}>
          {mode === 'connexion' ? 'Content de te revoir !' : 'Crée ton compte'}
        </h1>

        {/* Champ Pseudo */}
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

        {/* Champ Mot de passe avec bouton oeil */}
        <div style={styles.champGroupe}>
          <label style={styles.label}>Mot de passe</label>

          {/* 
            Ce div est un "wrapper" qui contient l'input ET le bouton oeil.
            position: relative permet de placer le bouton oeil
            à l'intérieur de l'input visuellement.
          */}
          <div style={styles.inputWrapper}>
            <input
              type={voirMdp ? 'text' : 'password'} // Bascule entre texte et password
              value={motDePasse}
              onChange={e => setMotDePasse(e.target.value)}
              placeholder="Ton mot de passe..."
              style={styles.inputAvecOeil}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
            {/* 
              Bouton oeil — fonctionne sur mobile et PC.
              On utilise des emojis pour éviter d'importer une librairie d'icônes.
              onMouseDown avec preventDefault empêche le champ de perdre le focus.
            */}
            <button
              type="button"
              onMouseDown={e => e.preventDefault()}
              onClick={() => setVoirMdp(!voirMdp)}
              style={styles.boutonOeil}
            >
              {voirMdp ? '🙈' : '👁️'}
            </button>
          </div>
        </div>

        {/* Champ confirmation (uniquement en mode inscription) */}
        {mode === 'inscription' && (
          <div style={styles.champGroupe}>
            <label style={styles.label}>Confirmer le mot de passe</label>
            <div style={styles.inputWrapper}>
              <input
                type={voirMdp ? 'text' : 'password'}
                value={confirmation}
                onChange={e => setConfirmation(e.target.value)}
                placeholder="Retape ton mot de passe..."
                style={styles.inputAvecOeil}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              />
              <button
                type="button"
                onMouseDown={e => e.preventDefault()}
                onClick={() => setVoirMdp(!voirMdp)}
                style={styles.boutonOeil}
              >
                {voirMdp ? '🙈' : '👁️'}
              </button>
            </div>

            {/* Indication des règles du mot de passe */}
            <p style={styles.aide}>
               6 caractères minimum, sans espace. Utilise un mot de passe unique, différent de tes autres comptes.
            </p>
          </div>
        )}

        {/* Message d'erreur ou de succès */}
        {message && (
          <div style={{
            ...styles.messageBox,
            backgroundColor: erreur ? '#ffe6e6' : '#e6ffe6',
            color: erreur ? '#cc0000' : '#006600',
            border: `1px solid ${erreur ? '#ffcccc' : '#ccffcc'}`,
          }}>
            {message}
          </div>
        )}

        {/* Bouton principal */}
        <button onClick={handleSubmit} style={styles.bouton}>
          {mode === 'connexion' ? 'Se connecter' : "S'inscrire"}
        </button>

        {/* Lien pour changer de mode */}
        <p style={styles.switchTexte}>
          {mode === 'connexion' ? "Pas encore de compte ? " : "Déjà un compte ? "}
          <span
            onClick={() => changerMode(mode === 'connexion' ? 'inscription' : 'connexion')}
            style={styles.switchLien}
          >
            {mode === 'connexion' ? "S'inscrire" : 'Se connecter'}
          </span>
        </p>

      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────
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
  // Wrapper pour l'input + bouton oeil
  inputWrapper: {
    position: 'relative', // Le bouton oeil se positionne par rapport à ce div
    width: '100%',
  },
  // Input qui laisse de la place pour le bouton oeil à droite
  inputAvecOeil: {
    width: '100%',
    padding: '12px 45px 12px 12px', // padding-right = 45px pour ne pas chevaucher l'oeil
    borderRadius: '8px',
    border: '1px solid #c8b49c',
    fontSize: '1rem',
    backgroundColor: '#faf7f2',
    boxSizing: 'border-box',
    outline: 'none',
  },
  // Input normal (sans oeil) pour le pseudo
  input: {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #c8b49c',
    fontSize: '1rem',
    backgroundColor: '#faf7f2',
    boxSizing: 'border-box',
    outline: 'none',
  },
  // Bouton oeil positionné en absolu dans le wrapper
  boutonOeil: {
    position: 'absolute',
    right: '10px',
    top: '50%',
    transform: 'translateY(-50%)', // Centré verticalement
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1.1rem',
    padding: '0',
  },
  aide: {
    fontSize: '0.8rem',
    color: '#888',
    marginTop: '5px',
  },
  messageBox: {
    padding: '10px',
    borderRadius: '6px',
    marginBottom: '15px',
    fontSize: '0.9rem',
    textAlign: 'center',
    width: '100%',
    boxSizing: 'border-box',
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