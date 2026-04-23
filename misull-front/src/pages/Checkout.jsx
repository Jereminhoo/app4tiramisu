// src/pages/Checkout.jsx
// Page panier + validation de commande.
// Gère : choix date de retrait, option livraison samedi,
// confirmation avant annulation, polling du statut.

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import useAuthStore from '../store/useAuthStore';
import '../App.css';

function Checkout() {
  const {
    panier, utilisateur, supprimerDuPanier, viderPanier,
    commandeValidee, setCommandeValidee, clearCommandeValidee
  } = useAuthStore();

  const [tempsRestant, setTempsRestant] = useState(null);
  const [message, setMessage] = useState('');
  const [statutActuel, setStatutActuel] = useState(commandeValidee?.statut || null);

  // ── Bug 11 : date de retrait choisie par l'utilisateur ──
  // On calcule la date minimum : maintenant + 24h
  const maintenant = new Date();
  const dateMiniDate = new Date(maintenant.getTime() + 24 * 60 * 60 * 1000);

  // Format pour l'input datetime-local : "YYYY-MM-DDTHH:MM"
  const formatDatetimeLocal = (date) => {
    const annee = date.getFullYear();
    const mois = String(date.getMonth() + 1).padStart(2, '0');
    const jour = String(date.getDate()).padStart(2, '0');
    const heures = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${annee}-${mois}-${jour}T${heures}:${minutes}`;
  };

  const dateMiniString = formatDatetimeLocal(dateMiniDate);
  const [dateRetrait, setDateRetrait] = useState(dateMiniString);

  // ── Bug 12 : option livraison samedi ──
  const [livraisonSamedi, setLivraisonSamedi] = useState(false);
  const PRIX_LIVRAISON = 2.50;

  // ── Bug 14 : confirmation avant annulation ──
  const [demandeConfirmation, setDemandeConfirmation] = useState(false);

  const navigate = useNavigate();

  // Protection : redirige si pas connecté
  useEffect(() => {
    if (!utilisateur) navigate('/login');
  }, []);

  // ── Chrono + Polling du statut toutes les 10 secondes ──
  useEffect(() => {
    if (!commandeValidee) return;

    const dateCreation = new Date(commandeValidee.dateCreation);
    const secondesEcoulees = Math.floor((new Date() - dateCreation) / 1000);
    const secondesRestantes = 1800 - secondesEcoulees;

    setStatutActuel(commandeValidee.statut);

    if (secondesRestantes <= 0 || commandeValidee.statut !== 'EN_ATTENTE') {
      setTempsRestant(0);
    } else {
      setTempsRestant(secondesRestantes);
    }

    // Chrono qui décompte chaque seconde
    const intervalChrono = setInterval(() => {
      setTempsRestant(prev => {
        if (prev <= 1) { clearInterval(intervalChrono); return 0; }
        return prev - 1;
      });
    }, 1000);

    // Polling : vérifie le statut toutes les 10 secondes
    // Bug 19 : si l'admin change le statut, le chrono s'arrête
    const intervalPolling = setInterval(async () => {
      try {
        const rep = await api.get(`/api/orders/${commandeValidee.id_commande}/statut`);
        const nouveauStatut = rep.data.commande.statut;
        setStatutActuel(nouveauStatut);

        // Dès que le statut change, on arrête le chrono
        if (nouveauStatut !== 'EN_ATTENTE') {
          setTempsRestant(0);
          clearInterval(intervalChrono);
          setCommandeValidee({ ...commandeValidee, statut: nouveauStatut });
        }
      } catch (e) {
        console.error('Erreur polling statut :', e);
      }
    }, 10000);

    return () => {
      clearInterval(intervalChrono);
      clearInterval(intervalPolling);
    };
  }, [commandeValidee?.id_commande]);

  // ── Calcul du total panier ──
  const calculerTotal = () => {
    const totalArticles = panier.reduce((total, ligne) => total + ligne.prix, 0);
    // On ajoute la livraison si l'option est cochée
    const totalFinal = livraisonSamedi ? totalArticles + PRIX_LIVRAISON : totalArticles;
    return totalFinal.toFixed(2);
  };

  const formaterTemps = (secondes) => {
    const minutes = Math.floor(secondes / 60);
    const secs = secondes % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // ── Validation de la commande ──
  const validerCommande = async () => {
    if (panier.length === 0) return;

    // Vérifier que la date choisie est bien dans au moins 24h
    const dateChoisie = new Date(dateRetrait);
    if (dateChoisie < dateMiniDate) {
      setMessage('La date de retrait doit être au moins 24h après la commande.');
      return;
    }

    try {
      const body = {
        prixTotal: parseFloat(calculerTotal()),
        livraisonSamedi: livraisonSamedi,
        dateRetrait: dateChoisie.toISOString(),
        lignes: panier.map(ligne => ({
          id_tiramisu: ligne.id_tiramisu,
          id_taille: ligne.id_taille,
          id_gout: ligne.id_gout,
          quantite: ligne.quantite,
          supplements: ligne.supplements,
        }))
      };
      const reponse = await api.post('/api/orders/create', body);
      setCommandeValidee(reponse.data.commande);
      viderPanier();
      setMessage('');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Erreur lors de la commande.');
    }
  };

  // ── Bug 14 : annulation en deux étapes ──
  // Étape 1 : on demande confirmation
  const demanderAnnulation = () => {
    setDemandeConfirmation(true);
  };

  // Étape 2 : l'utilisateur confirme
  const confirmerAnnulation = async () => {
    try {
      await api.put(`/api/orders/${commandeValidee.id_commande}/annuler`);
      clearCommandeValidee();
      setTempsRestant(null);
      setStatutActuel(null);
      setDemandeConfirmation(false);
      setMessage('Commande annulée avec succès.');
    } catch (error) {
      setMessage(error.response?.data?.message || "Erreur lors de l'annulation.");
      setDemandeConfirmation(false);
    }
  };

  // ── AFFICHAGE APRÈS VALIDATION ──
  if (commandeValidee) {
    return (
      <div className="app-container">
        <div style={styles.container}>

          <div style={{ textAlign: 'center', marginBottom: '25px' }}>
            <span style={{ fontSize: '3rem' }}>🎉</span>
            <h1 style={styles.titre}>Commande reçue !</h1>
            <p style={{ color: '#666' }}>
              Numéro de commande : <strong>#{commandeValidee.id_commande}</strong>
            </p>
            {/* Code de retrait bien visible pour que le client le donne au retrait */}
            <div style={styles.codeRetrait}>
              <p style={{ margin: '0 0 5px 0', fontSize: '0.9rem', color: '#666' }}>
                Ton code de retrait :
              </p>
              <span style={styles.codeRetraitValeur}>
                {commandeValidee.codeRetrait}
              </span>
              <p style={{ margin: '5px 0 0 0', fontSize: '0.8rem', color: '#888' }}>
                Donne ce code quand tu viens chercher ta commande.
              </p>
            </div>
          </div>

          {/* Bug 17 : message pour voir l'avancement */}
          <div style={styles.banniereInfo}>
            Pour connaître l'avancement de ta commande, actualise régulièrement cette page.
            On t'indiquera quand venir la chercher !
          </div>

          {/* Bug 18 : où récupérer la commande */}
          <div style={styles.banniereRetrait}>
            <strong>Où récupérer ta commande ?</strong>
            <p style={{ margin: '8px 0 0 0', fontSize: '0.95rem' }}>
              Contacte-nous sur Instagram{' '}
              <a 
                href="https://www.instagram.com/misulalouviere"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#c0392b', fontWeight: 'bold' }}
              >
                @misulalouviere
              </a>{' '}
              en mentionnant ton pseudo <strong>{utilisateur?.pseudo}</strong> et
              ton numéro de commande <strong>#{commandeValidee.id_commande}</strong>.
            </p>
          </div>

          {/* Statut EN_ATTENTE : chrono visible */}
          {statutActuel === 'EN_ATTENTE' && tempsRestant > 0 && (
            <div style={styles.banniereAnnulation}>
              <p style={{ margin: '0 0 10px 0' }}>
                Tu peux annuler ta commande pendant encore :
              </p>
              <span style={styles.timer}>{formaterTemps(tempsRestant)}</span>

              {/* Bug 14 : confirmation en deux étapes */}
              {!demandeConfirmation ? (
                <button onClick={demanderAnnulation} style={styles.boutonAnnuler}>
                  Annuler ma commande
                </button>
              ) : (
                <div style={{ marginTop: '10px' }}>
                  <p style={{ color: '#c0392b', fontWeight: 'bold', marginBottom: '10px' }}>
                    Es-tu sûr de vouloir annuler ?
                  </p>
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                    <button onClick={confirmerAnnulation} style={styles.boutonAnnuler}>
                      Oui, annuler
                    </button>
                    <button
                      onClick={() => setDemandeConfirmation(false)}
                      style={styles.boutonGarde}
                    >
                      Non, garder
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* EN_ATTENTE mais délai écoulé */}
          {statutActuel === 'EN_ATTENTE' && tempsRestant === 0 && (
            <p style={{ textAlign: 'center', color: '#888' }}>
              Le délai d'annulation est écoulé.
            </p>
          )}

          {/* EN_PREPARATION */}
          {statutActuel === 'EN_PREPARATION' && (
            <div style={styles.bannierePreparation}>
              <p style={{ margin: 0, fontWeight: 'bold', color: '#1a5fa8' }}>
                Ta commande est en préparation !
              </p>
              <p style={{ margin: '8px 0 0 0', fontSize: '0.9rem', color: '#555' }}>
                Tu ne peux plus l'annuler.
              </p>
            </div>
          )}

          {/* PRETE */}
          {statutActuel === 'PRETE' && (
            <div style={styles.bannierePrete}>
              <p style={{ margin: 0, fontWeight: 'bold', color: '#006600' }}>
                Ta commande est prête ! Viens la chercher.
              </p>
            </div>
          )}

          <button
            onClick={() => { clearCommandeValidee(); navigate('/commande'); }}
            style={styles.boutonRetour}
          >
            Passer une nouvelle commande
          </button>

        </div>
      </div>
    );
  }

  // ── PANIER VIDE ──
  if (panier.length === 0) {
    return (
      <div className="app-container">
        <div style={styles.container}>
          <span style={{ fontSize: '3rem' }}>🛒</span>
          <h1 style={styles.titre}>Ton panier est vide</h1>
          <button onClick={() => navigate('/commande')} style={styles.boutonRetour}>
            Voir les tiramisus
          </button>
        </div>
      </div>
    );
  }

  // ── PANIER AVEC ARTICLES ──
  return (
    <div className="app-container">
      <main className="main-content">

        <h1 style={{ textAlign: 'center', fontSize: '1.8rem', marginBottom: '25px' }}>
          Ton panier
        </h1>

        {/* Message simulation discret */}
        <p style={styles.simulation}>
          Aucune transaction d'argent n'a lieu sur ce site.
        </p>

        {message && (
          <div style={styles.banniereErreur}>{message}</div>
        )}

        {/* ── Liste des articles ── */}
        <section className="category-section">
          {panier.map((ligne, index) => (
            <div key={index} style={styles.lignePanier}>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 5px 0', color: '#3b2f2f' }}>
                  {ligne.nom}
                </h3>
                <p style={{ margin: '0', color: '#666', fontSize: '0.9rem' }}>
                  {ligne.nomTaille} - {ligne.nomGout}
                </p>
                {ligne.nomsSupplements?.length > 0 && (
                  <p style={{ margin: '4px 0 0 0', color: '#c0392b', fontSize: '0.85rem' }}>
                    + {ligne.nomsSupplements.join(', ')}
                  </p>
                )}
                <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#666' }}>
                  Quantité : {ligne.quantite}
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
                <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#3b2f2f' }}>
                  {ligne.prix} €
                </span>
                <button onClick={() => supprimerDuPanier(index)} style={styles.boutonSupprimer}>
                  Retirer
                </button>
              </div>
            </div>
          ))}
        </section>

        {/* ── Bug 12 : option livraison samedi ── */}
        <section className="category-section">
          <div style={styles.livraisonBox}>
            <div>
              <strong>Livraison le samedi</strong>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#666' }}>
                +{PRIX_LIVRAISON.toFixed(2)} € — disponible uniquement le samedi
              </p>
            </div>
            {/* 
              Interrupteur (toggle) pour activer/désactiver la livraison.
              Un simple checkbox stylisé suffit ici.
            */}
            <input
              type="checkbox"
              checked={livraisonSamedi}
              onChange={e => setLivraisonSamedi(e.target.checked)}
              style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#c0392b' }}
            />
          </div>
        </section>

        {/* ── Bug 11 : choix de la date de retrait ── */}
        <section className="category-section">
          <h2 className="category-title">Quand veux-tu récupérer ta commande ?</h2>
          <p style={{ fontSize: '0.9rem', color: '#888', marginBottom: '10px' }}>
            Minimum 24h après la commande. On est étudiants, merci pour ta patience !
          </p>
          {/*
            datetime-local = input HTML natif pour choisir date + heure.
            min = la date minimum autorisée (maintenant + 24h).
            On utilise le format "YYYY-MM-DDTHH:MM" pour la valeur.
          */}
          <input
            type="datetime-local"
            value={dateRetrait}
            min={dateMiniString}
            onChange={e => setDateRetrait(e.target.value)}
            style={styles.inputDate}
          />
        </section>

        {/* ── Total et boutons ── */}
        <section className="category-section" style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#3b2f2f' }}>
            Total : <span style={{ color: '#c0392b' }}>{calculerTotal()} €</span>
            {livraisonSamedi && (
              <span style={{ fontSize: '0.85rem', color: '#888', display: 'block', marginTop: '4px' }}>
                dont {PRIX_LIVRAISON.toFixed(2)} € de livraison
              </span>
            )}
          </p>
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={viderPanier} style={styles.boutonVider}>
              Vider le panier
            </button>
            <button onClick={validerCommande} style={styles.boutonValider}>
              Valider la commande
            </button>
          </div>
        </section>

      </main>
    </div>
  );
}

// ─────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────
const styles = {
  container: {
    maxWidth: '500px',
    margin: '40px auto',
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '15px',
  },
  titre: {
    fontSize: '1.6rem',
    color: '#3b2f2f',
    margin: '10px 0',
  },
  simulation: {
    textAlign: 'center',
    color: '#bbb',
    fontSize: '0.75rem',
    marginBottom: '10px',
  },
  banniereInfo: {
    backgroundColor: '#fff8e6',
    color: '#7a5c00',
    border: '1px solid #f0c040',
    borderRadius: '10px',
    padding: '15px 20px',
    textAlign: 'center',
    width: '100%',
    boxSizing: 'border-box',
    fontSize: '0.95rem',
  },
  banniereRetrait: {
    backgroundColor: '#faf7f2',
    border: '1px solid #c8b49c',
    borderRadius: '10px',
    padding: '15px 20px',
    width: '100%',
    boxSizing: 'border-box',
    fontSize: '0.95rem',
    textAlign: 'center',
  },
  banniereErreur: {
    backgroundColor: '#ffe6e6',
    color: '#cc0000',
    padding: '10px',
    borderRadius: '6px',
    marginBottom: '15px',
    textAlign: 'center',
    border: '1px solid #ffcccc',
  },
  banniereAnnulation: {
    backgroundColor: '#fff8e6',
    border: '1px solid #f0c040',
    borderRadius: '10px',
    padding: '20px',
    textAlign: 'center',
    width: '100%',
    boxSizing: 'border-box',
  },
  bannierePreparation: {
    backgroundColor: '#e6f3ff',
    border: '1px solid #a0c4e8',
    borderRadius: '10px',
    padding: '20px',
    textAlign: 'center',
    width: '100%',
    boxSizing: 'border-box',
  },
  bannierePrete: {
    backgroundColor: '#e6ffe6',
    border: '1px solid #ccffcc',
    borderRadius: '10px',
    padding: '20px',
    textAlign: 'center',
    width: '100%',
    boxSizing: 'border-box',
  },
  timer: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#c0392b',
    display: 'block',
    marginBottom: '15px',
  },
  lignePanier: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '15px 0',
    borderBottom: '1px solid #f0e6d2',
  },
  livraisonBox: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#faf7f2',
    border: '1px solid #c8b49c',
    borderRadius: '10px',
    padding: '15px 20px',
  },
  inputDate: {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #c8b49c',
    fontSize: '1rem',
    backgroundColor: '#faf7f2',
    boxSizing: 'border-box',
    outline: 'none',
  },
  boutonSupprimer: {
    backgroundColor: 'transparent',
    border: '1px solid #c0392b',
    color: '#c0392b',
    padding: '5px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.85rem',
  },
  boutonVider: {
    backgroundColor: 'transparent',
    border: '1px solid #999',
    color: '#666',
    padding: '12px 25px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1rem',
  },
  boutonValider: {
    backgroundColor: '#c0392b',
    color: 'white',
    border: 'none',
    padding: '12px 25px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: 'bold',
  },
  boutonAnnuler: {
    backgroundColor: 'transparent',
    border: '1px solid #c0392b',
    color: '#c0392b',
    padding: '10px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.95rem',
    marginTop: '10px',
  },
  boutonGarde: {
    backgroundColor: '#3b2f2f',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.95rem',
    marginTop: '10px',
  },
  boutonRetour: {
    backgroundColor: '#3b2f2f',
    color: 'white',
    border: 'none',
    padding: '12px 25px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1rem',
    marginTop: '10px',
  },
  codeRetrait: {
  backgroundColor: '#faf7f2',
  border: '2px solid #c8b49c',
  borderRadius: '12px',
  padding: '15px 25px',
  textAlign: 'center',
  width: '100%',
  boxSizing: 'border-box',
},
codeRetraitValeur: {
  fontSize: '2.5rem',
  fontWeight: 'bold',
  color: '#c0392b',
  letterSpacing: '8px', // Espacement pour que le code soit facile à lire
},
};

export default Checkout;