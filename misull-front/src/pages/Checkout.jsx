// src/pages/Checkout.jsx
// Page panier + validation de commande.
// Gère : choix date de retrait, livraison avec créneaux, validation horaires config, polling statut.

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  const [demandeConfirmation, setDemandeConfirmation] = useState(false);

  // ── Config chargée depuis l'API ──
  // heureOuverture/heureFermeture : horaires de retrait
  // delaiMaxJours : nombre de jours max à l'avance qu'un client peut réserver
  // IMPORTANT : une seule déclaration de ce state dans tout le composant.
  // En avoir deux (comme c'était le cas avant) fait planter React au chargement.
  const [config, setConfig] = useState({
    heureOuverture: '15',
    heureFermeture: '23',
    delaiMaxJours: '7',
  });

  // ── Option livraison ──
  // false = retrait, true = livraison (n'importe quel jour)
  const [livraison, setLivraison] = useState(false);
  const PRIX_LIVRAISON = 2.50;

  // ── Créneaux de livraison ──
  // Liste des créneaux disponibles pour la date choisie, ex:
  // [{ heureDebut: "18:00", heureFin: "18:20", disponible: true }, ...]
  const [creneaux, setCreneaux] = useState([]);
  const [creneauSelectionne, setCreneauSelectionne] = useState(null);
  const [chargementCreneaux, setChargementCreneaux] = useState(false);

  // ── Date minimum : maintenant + 24h ──
  const maintenant = new Date();
  const dateMiniDate = new Date(maintenant.getTime() + 24 * 60 * 60 * 1000);

  // ── Date maximum : maintenant + delaiMaxJours (valeur configurable par l'admin) ──
  // Empêche de réserver trop loin dans le temps, au-delà de la période
  // pour laquelle les disponibilités (horaires, créneaux) ont un sens.
  const dateMaxDate = new Date(
    maintenant.getTime() + parseInt(config.delaiMaxJours) * 24 * 60 * 60 * 1000
  );
  dateMaxDate.setHours(23, 59, 59, 999); // on autorise jusqu'à la fin de la dernière journée

  const formatDatetimeLocal = (date) => {
    const annee = date.getFullYear();
    const mois = String(date.getMonth() + 1).padStart(2, '0');
    const jour = String(date.getDate()).padStart(2, '0');
    const heures = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${annee}-${mois}-${jour}T${heures}:${minutes}`;
  };

  // Pour la livraison on n'a besoin que de la date, l'heure vient du créneau choisi
  const formatDate = (date) => {
    const annee = date.getFullYear();
    const mois = String(date.getMonth() + 1).padStart(2, '0');
    const jour = String(date.getDate()).padStart(2, '0');
    return `${annee}-${mois}-${jour}`;
  };

  const dateMiniString = formatDatetimeLocal(dateMiniDate);
  const dateMiniDateString = formatDate(dateMiniDate);

  // Bornes maximum, au même format que les bornes minimum ci-dessus.
  // dateMaxString (avec l'heure) sert au retrait -> type="datetime-local"
  // dateMaxDateString (date seule) sert à la livraison -> type="date"
  const dateMaxString = formatDatetimeLocal(dateMaxDate);
  const dateMaxDateString = formatDate(dateMaxDate);

  const [dateRetrait, setDateRetrait] = useState(dateMiniString);
  const [dateLivraison, setDateLivraison] = useState(dateMiniDateString);

  const navigate = useNavigate();

  useEffect(() => {
    if (!utilisateur) navigate('/login');

    // On charge la config des horaires au démarrage
    api.get('/api/config')
      .then(rep => setConfig(rep.data.config))
      .catch(e => console.error('Erreur config :', e));
  }, []);

  // ── Chargement des créneaux disponibles ──
  // Se déclenche à chaque fois que le mode "livraison" est actif
  // et que la date choisie change.
  useEffect(() => {
    if (!livraison || !dateLivraison) return;

    setChargementCreneaux(true);
    setCreneauSelectionne(null); // on réinitialise le choix si la date change

    api.get(`/api/orders/creneaux?date=${dateLivraison}`)
      .then(rep => setCreneaux(rep.data.creneaux))
      .catch(e => {
        console.error('Erreur chargement créneaux :', e);
        setCreneaux([]);
      })
      .finally(() => setChargementCreneaux(false));
  }, [livraison, dateLivraison]);

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

    const intervalChrono = setInterval(() => {
      setTempsRestant(prev => {
        if (prev <= 1) { clearInterval(intervalChrono); return 0; }
        return prev - 1;
      });
    }, 1000);

    const intervalPolling = setInterval(async () => {
      try {
        const rep = await api.get(`/api/orders/${commandeValidee.id_commande}/statut`);
        const nouveauStatut = rep.data.commande.statut;
        setStatutActuel(nouveauStatut);

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
    const totalFinal = livraison ? totalArticles + PRIX_LIVRAISON : totalArticles;
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

    let dateFinale;

    if (livraison) {
      // ── Validation livraison ──
      const dateChoisie = new Date(dateLivraison);

      // Vérifier délai minimum 24h
      const dateMiniSansHeure = new Date(dateMiniDate);
      dateMiniSansHeure.setHours(0, 0, 0, 0);
      if (dateChoisie < dateMiniSansHeure) {
        setMessage('La date de livraison doit être au moins 24h après la commande.');
        return;
      }

      // Un créneau doit être sélectionné dans la grille
      if (!creneauSelectionne) {
        setMessage('Choisis un créneau horaire pour ta livraison.');
        return;
      }

      // On combine la date choisie avec l'heure du créneau sélectionné
      // Ex: creneauSelectionne = "18:20" → on découpe en heures/minutes
      const [heureCreneau, minuteCreneau] = creneauSelectionne.split(':').map(Number);
      dateChoisie.setHours(heureCreneau, minuteCreneau, 0, 0);
      dateFinale = dateChoisie;

    } else {
      // ── Validation retrait avec horaires ──
      const dateChoisie = new Date(dateRetrait);

      // Vérifier délai minimum 24h
      if (dateChoisie < dateMiniDate) {
        setMessage('La date de retrait doit être au moins 24h après la commande.');
        return;
      }

      // Vérifier que l'heure est dans les horaires configurés par l'admin
      const heures = dateChoisie.getHours();
      const heureOuverture = parseInt(config.heureOuverture);
      const heureFermeture = parseInt(config.heureFermeture);

      if (heures < heureOuverture || heures >= heureFermeture) {
        setMessage(`Le retrait est possible uniquement entre ${heureOuverture}h et ${heureFermeture}h.`);
        return;
      }

      dateFinale = dateChoisie;
    }

    try {
      const body = {
        prixTotal: parseFloat(calculerTotal()),
        livraison,
        dateRetrait: dateFinale.toISOString(),
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
      // Si le créneau vient d'être pris entre-temps (409), on recharge
      // la grille pour montrer l'état à jour et on informe le client.
      if (error.response?.status === 409) {
        setCreneauSelectionne(null);
        api.get(`/api/orders/creneaux?date=${dateLivraison}`)
          .then(rep => setCreneaux(rep.data.creneaux))
          .catch(e => console.error('Erreur rechargement créneaux :', e));
      }
      setMessage(error.response?.data?.message || 'Erreur lors de la commande.');
    }
  };

  // ── Annulation en deux étapes ──
  const demanderAnnulation = () => setDemandeConfirmation(true);

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

            {/* Code de retrait bien visible */}
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

          {/* Message avancement */}
          {/* Avancement + lien mes commandes */}
          <div style={styles.banniereInfo}>
            Actualise régulièrement{' '}
            <Link to="/mes-commandes" style={{ color: '#c0392b', fontWeight: 'bold' }}>
              mes commandes
            </Link>
            {' '}pour suivre l'avancement. On t'indiquera quand venir chercher !
          </div>

          {/* Où récupérer / livraison */}
          <div style={styles.banniereRetrait}>
            {commandeValidee.livraison ? (
              <>
                <strong>Livraison</strong>
                <p style={{ margin: '8px 0 0 0', fontSize: '0.95rem' }}>
                  Contacte-nous sur Instagram{' '}
                  
                    <a href="https://www.instagram.com/misulalouviere"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#c0392b', fontWeight: 'bold' }}
                  >
                    @misulalouviere
                  </a>{' '}
                  pour donner ton adresse. Mentionne ton pseudo{' '}
                  <strong>{utilisateur?.pseudo}</strong> et le code{' '}
                  <strong>{commandeValidee.codeRetrait}</strong>.
                </p>
              </>
            ) : (
              <>
                <strong>Où récupérer ta commande ?</strong>
                <p style={{ margin: '8px 0 0 0', fontSize: '0.95rem' }}>
                  Contacte-nous sur Instagram{' '}
                  
                    <a href="https://www.instagram.com/misulalouviere"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#c0392b', fontWeight: 'bold' }}
                  >
                    @misulalouviere
                  </a>{' '}
                  en mentionnant ton pseudo <strong>{utilisateur?.pseudo}</strong> et
                  ton code <strong>{commandeValidee.codeRetrait}</strong>.
                </p>
              </>
            )}
          </div>

          {/* EN_ATTENTE : chrono */}
          {statutActuel === 'EN_ATTENTE' && tempsRestant > 0 && (
            <div style={styles.banniereAnnulation}>
              <p style={{ margin: '0 0 10px 0' }}>
                Tu peux annuler ta commande pendant encore :
              </p>
              <span style={styles.timer}>{formaterTemps(tempsRestant)}</span>

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

          {/* EN_ATTENTE délai écoulé */}
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

          {/* Boutons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
            <button
              onClick={() => { clearCommandeValidee(); navigate('/commande'); }}
              style={styles.boutonCommander}
            >
              Commander un autre tiramisu
            </button>
            <button
              onClick={() => navigate('/mes-commandes')}
              style={styles.boutonRetour}
            >
              Voir mes commandes
            </button>
          </div>

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

        <p style={styles.simulation}>
          Aucune transaction d'argent n'a lieu sur ce site.
        </p>

        <p style={styles.rappelLocalite}>
          Rappel : on livre uniquement sur La Louvière.
        </p>

        {/* Liste des articles */}
        <section className="category-section">
          {panier.map((ligne, index) => (
            <div key={index} style={styles.lignePanier}>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 5px 0', color: '#3b2f2f' }}>{ligne.nom}</h3>
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

        {/* ── Choix : retrait ou livraison ── */}
        <section className="category-section">
          <h2 className="category-title">Mode de récupération</h2>

          {/* Boutons radio visuels pour choisir */}
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginBottom: '20px' }}>
            <div
              onClick={() => setLivraison(false)}
              style={{
                ...styles.choixBox,
                border: !livraison ? '2px solid #c0392b' : '2px solid #c8b49c',
                backgroundColor: !livraison ? '#fdf0ee' : '#faf7f2',
              }}
            >
              <strong>Retrait</strong>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#666' }}>
                Gratuit - entre {config.heureOuverture}h et {config.heureFermeture}h
              </p>
            </div>

            {/*
              Si livraisonActive = 'false', la boîte est grisée et non cliquable.
              On stocke en string dans Config donc on compare avec la string 'true'.
            */}
            <div
              onClick={() => config.livraisonActive === 'true' && setLivraison(true)}
              style={{
                ...styles.choixBox,
                border: livraison ? '2px solid #c0392b' : '2px solid #c8b49c',
                backgroundColor: config.livraisonActive !== 'true'
                  ? '#f0f0f0'
                  : livraison ? '#fdf0ee' : '#faf7f2',
                cursor: config.livraisonActive === 'true' ? 'pointer' : 'not-allowed',
                opacity: config.livraisonActive === 'true' ? 1 : 0.6,
              }}
            >
              <strong>Livraison</strong>
              {config.livraisonActive !== 'true' ? (
                <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#c0392b', fontWeight: 'bold' }}>
                  Indisponible pour le moment
                </p>
              ) : (
                <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#666' }}>
                  +{PRIX_LIVRAISON.toFixed(2)} €
                </p>
              )}
            </div>
          </div>

          {/* Sélecteur de date selon le mode choisi */}
          {!livraison ? (
            <div>
              <label style={styles.label}>
                Quand veux-tu venir chercher ta commande ?
              </label>
              <p style={{ fontSize: '0.85rem', color: '#888', marginBottom: '8px' }}>
                Minimum 24h après la commande, entre {config.heureOuverture}h et {config.heureFermeture}h.
              </p>
              <input
                type="datetime-local"
                value={dateRetrait}
                min={dateMiniString}
                max={dateMaxString}
                onChange={e => setDateRetrait(e.target.value)}
                style={styles.inputDate}
              />
            </div>
          ) : (
            <div>
              <label style={styles.label}>
                Quel jour veux-tu être livré ?
              </label>
              <p style={{ fontSize: '0.85rem', color: '#888', marginBottom: '8px' }}>
                Minimum 24h après la commande.
              </p>
              <input
                type="date"
                value={dateLivraison}
                min={dateMiniDateString}
                max={dateMaxDateString}
                onChange={e => setDateLivraison(e.target.value)}
                style={styles.inputDate}
              />

              {/* ── Grille des créneaux horaires ── */}
              <div style={{ marginTop: '20px' }}>
                <label style={styles.label}>
                  Choisis un créneau
                </label>

                {chargementCreneaux ? (
                  <p style={{ fontSize: '0.9rem', color: '#888' }}>
                    Chargement des créneaux...
                  </p>
                ) : creneaux.length === 0 ? (
                  <p style={{ fontSize: '0.9rem', color: '#888' }}>
                    Aucun créneau disponible pour cette date.
                  </p>
                ) : (
                  <div style={styles.grilleCreneaux}>
                    {creneaux.map((creneau) => {
                      const estSelectionne = creneauSelectionne === creneau.heureDebut;
                      return (
                        <button
                          key={creneau.heureDebut}
                          type="button"
                          disabled={!creneau.disponible}
                          onClick={() => setCreneauSelectionne(creneau.heureDebut)}
                          style={{
                            ...styles.caseCreneau,
                            ...(estSelectionne ? styles.caseCreneauSelectionnee : {}),
                            ...(!creneau.disponible ? styles.caseCreneauIndisponible : {}),
                          }}
                        >
                          {creneau.heureDebut}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        {/* Total et boutons */}
        <section className="category-section" style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#3b2f2f' }}>
            Total : <span style={{ color: '#c0392b' }}>{calculerTotal()} €</span>
            {livraison && (
              <span style={{ fontSize: '0.85rem', color: '#888', display: 'block', marginTop: '4px' }}>
                dont {PRIX_LIVRAISON.toFixed(2)} € de livraison
              </span>
            )}
          </p>

          {message && (
            <div style={styles.banniereErreur}>{message}</div>
          )}


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
    color: '#999',
    fontSize: '1rem',
    fontWeight: 'bold',
    marginBottom: '15px',
  },
  rappelLocalite: {
    textAlign: 'center',
    color: '#888',
    fontSize: '0.8rem',
    marginBottom: '15px',
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
    fontSize: '0.9rem',
    marginTop: '10px',
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
  codeRetrait: {
    backgroundColor: '#faf7f2',
    border: '2px solid #c8b49c',
    borderRadius: '12px',
    padding: '15px 25px',
    textAlign: 'center',
    width: '100%',
    boxSizing: 'border-box',
    marginTop: '15px',
  },
  codeRetraitValeur: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: '#c0392b',
    letterSpacing: '8px',
  },
  lignePanier: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '15px 0',
    borderBottom: '1px solid #f0e6d2',
  },
  // Boîtes de choix retrait/livraison — cliquables
  choixBox: {
    flex: 1,
    minWidth: '140px',
    padding: '15px',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  label: {
    display: 'block',
    fontWeight: 'bold',
    color: '#3b2f2f',
    marginBottom: '6px',
    fontSize: '0.95rem',
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
  // ── Grille de créneaux ──
  grilleCreneaux: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
    gap: '10px',
  },
  caseCreneau: {
    padding: '10px 8px',
    borderRadius: '8px',
    border: '2px solid #c8b49c',
    backgroundColor: '#faf7f2',
    color: '#3b2f2f',
    fontSize: '0.9rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  caseCreneauSelectionnee: {
    border: '2px solid #c0392b',
    backgroundColor: '#fdf0ee',
    color: '#c0392b',
  },
  caseCreneauIndisponible: {
    backgroundColor: '#f0f0f0',
    color: '#bbb',
    border: '2px solid #e0e0e0',
    cursor: 'not-allowed',
    textDecoration: 'line-through',
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
    width: '100%',
  },
  boutonCommander: {
    backgroundColor: '#c0392b',
    color: 'white',
    border: 'none',
    padding: '12px 25px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: 'bold',
    marginTop: '10px',
    width: '100%',
  },
};

export default Checkout;