// src/pages/Checkout.jsx
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
  // Statut actuel de la commande — mis à jour par le polling
  const [statutActuel, setStatutActuel] = useState(commandeValidee?.statut || null);
  const navigate = useNavigate();

  // Protection
  useEffect(() => {
    if (!utilisateur) navigate('/login');
  }, []);

  // Chrono + Polling du statut toutes les 10 secondes
  useEffect(() => {
    if (!commandeValidee) return;

    // On calcule le vrai temps restant
    const dateCreation = new Date(commandeValidee.dateCreation);
    const secondesEcoulees = Math.floor((new Date() - dateCreation) / 1000);
    const secondesRestantes = 1800 - secondesEcoulees;

    setStatutActuel(commandeValidee.statut);

    if (secondesRestantes <= 0 || commandeValidee.statut !== 'EN_ATTENTE') {
      setTempsRestant(0);
    } else {
      setTempsRestant(secondesRestantes);
    }

    // Chrono
    const intervalChrono = setInterval(() => {
      setTempsRestant(prev => {
        if (prev <= 1) { clearInterval(intervalChrono); return 0; }
        return prev - 1;
      });
    }, 1000);

    // Polling : on vérifie le statut toutes les 10 secondes
    // Si l'admin passe la commande en EN_PREPARATION, le chrono s'arrête
    const intervalPolling = setInterval(async () => {
      try {
        const rep = await api.get(`/api/orders/${commandeValidee.id_commande}/statut`);
        const nouveauStatut = rep.data.commande.statut;
        setStatutActuel(nouveauStatut);

        // Si la commande est en préparation ou plus → on arrête le chrono
        if (nouveauStatut !== 'EN_ATTENTE') {
          setTempsRestant(0);
          clearInterval(intervalChrono);
          // On met à jour la commande dans le store avec le nouveau statut
          setCommandeValidee({ ...commandeValidee, statut: nouveauStatut });
        }
      } catch (e) {
        console.error('Erreur polling statut :', e);
      }
    }, 10000); // toutes les 10 secondes

    return () => {
      clearInterval(intervalChrono);
      clearInterval(intervalPolling);
    };
  }, [commandeValidee?.id_commande]);

  const calculerTotal = () => {
    return panier.reduce((total, ligne) => total + ligne.prix, 0).toFixed(2);
  };

  const formaterTemps = (secondes) => {
    const minutes = Math.floor(secondes / 60);
    const secs = secondes % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const validerCommande = async () => {
    if (panier.length === 0) return;
    try {
      const body = {
        prixTotal: parseFloat(calculerTotal()),
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

  const annulerCommande = async () => {
    try {
      await api.put(`/api/orders/${commandeValidee.id_commande}/annuler`);
      clearCommandeValidee();
      setTempsRestant(null);
      setStatutActuel(null);
      setMessage('Commande annulée avec succès.');
    } catch (error) {
      setMessage(error.response?.data?.message || "Erreur lors de l'annulation.");
    }
  };

  // ── Affichage après validation ──
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
          </div>

          <div style={styles.banniereSim}>
            ⚠️ Ceci est une simulation - aucune vraie préparation n'aura lieu.
          </div>

          {/* Statut EN_ATTENTE → on montre le chrono */}
          {statutActuel === 'EN_ATTENTE' && tempsRestant > 0 && (
            <div style={styles.banniereAnnulation}>
              <p style={{ margin: '0 0 10px 0' }}>
                Tu peux annuler ta commande pendant encore :
              </p>
              <span style={styles.timer}>{formaterTemps(tempsRestant)}</span>
              <button onClick={annulerCommande} style={styles.boutonAnnuler}>
                Annuler ma commande
              </button>
            </div>
          )}

          {/* Statut EN_ATTENTE mais délai écoulé */}
          {statutActuel === 'EN_ATTENTE' && tempsRestant === 0 && (
            <p style={{ textAlign: 'center', color: '#888' }}>
              Le délai d'annulation est écoulé.
            </p>
          )}

          {/* Statut EN_PREPARATION → plus d'annulation possible */}
          {statutActuel === 'EN_PREPARATION' && (
            <div style={{
              backgroundColor: '#e6f3ff',
              border: '1px solid #a0c4e8',
              borderRadius: '10px',
              padding: '20px',
              textAlign: 'center',
              width: '100%',
              boxSizing: 'border-box',
            }}>
              <p style={{ margin: 0, fontWeight: 'bold', color: '#1a5fa8' }}>
                👨‍🍳 Ta commande est en préparation !
              </p>
              <p style={{ margin: '8px 0 0 0', fontSize: '0.9rem', color: '#555' }}>
                Tu ne peux plus l'annuler.
              </p>
            </div>
          )}

          {/* Statut PRETE */}
          {statutActuel === 'PRETE' && (
            <div style={{
              backgroundColor: '#e6ffe6',
              border: '1px solid #ccffcc',
              borderRadius: '10px',
              padding: '20px',
              textAlign: 'center',
              width: '100%',
              boxSizing: 'border-box',
            }}>
              <p style={{ margin: 0, fontWeight: 'bold', color: '#006600' }}>
                Ta commande est prête ! 🎉
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

  // ── Panier vide ──
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

  // ── Panier avec articles ──
  return (
    <div className="app-container">
      <main className="main-content">

        <h1 style={{ textAlign: 'center', fontSize: '1.8rem', marginBottom: '25px' }}>
          Ton panier 🛒
        </h1>

        <div style={styles.banniereSim}>
          ⚠️ Simulation uniquement - aucune vraie commande ne sera traitée.
        </div>

        {message && (
          <div style={styles.banniereErreur}>{message}</div>
        )}

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
                  {ligne.prix}€
                </span>
                <button onClick={() => supprimerDuPanier(index)} style={styles.boutonSupprimer}>
                  Retirer
                </button>
              </div>
            </div>
          ))}
        </section>

        <section className="category-section" style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#3b2f2f' }}>
            Total : <span style={{ color: '#c0392b' }}>{calculerTotal()}€</span>
          </p>
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={viderPanier} style={styles.boutonVider}>
              Vider le panier
            </button>
            <button onClick={validerCommande} style={styles.boutonValider}>
              Valider la commande ✅
            </button>
          </div>
        </section>

      </main>
    </div>
  );
}

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
  banniereSim: {
    backgroundColor: '#ffe6e6',
    color: '#cc0000',
    padding: '12px',
    textAlign: 'center',
    borderRadius: '8px',
    marginBottom: '20px',
    fontWeight: 'bold',
    border: '1px solid #ffcccc',
    width: '100%',
    boxSizing: 'border-box',
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
};

export default Checkout;