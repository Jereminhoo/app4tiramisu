// src/pages/MesCommandes.jsx
// Page qui liste toutes les commandes passées par le client connecté.
// Extraite de Profil.jsx pour séparer les responsabilités.

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import useAuthStore from '../store/useAuthStore';
import Chargement from '../components/Chargement';
import '../App.css';

function MesCommandes() {
  const { utilisateur } = useAuthStore();
  const navigate = useNavigate();

  const [commandes, setCommandes] = useState([]);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    if (!utilisateur) { navigate('/login'); return; }

    api.get('/api/orders/historique')
      .then(reponse => setCommandes(reponse.data.commandes))
      .catch(erreur => console.error("Erreur chargement commandes :", erreur))
      .finally(() => setChargement(false));
  }, []);

  // ── Formate la date en français lisible ──
  const formaterDate = (dateString) => {
    if (!dateString) return 'Non précisée';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // ── Couleur selon le statut ──
  const couleurStatut = (statut) => {
    const couleurs = {
      'EN_ATTENTE': '#f0a500',
      'EN_PREPARATION': '#2980b9',
      'PRETE': '#27ae60',
      'LIVREE': '#888',
      'ANNULEE': '#c0392b',
    };
    return couleurs[statut] || '#888';
  };

  // ── Texte lisible du statut ──
  const texteStatut = (statut) => {
    const textes = {
      'EN_ATTENTE': 'En attente',
      'EN_PREPARATION': 'En préparation',
      'PRETE': 'Prête',
      'LIVREE': 'Livrée',
      'ANNULEE': 'Annulée',
    };
    return textes[statut] || statut;
  };

  if (chargement) return <Chargement texte="Chargement de tes commandes..." />;

  return (
    <div className="app-container">
      <main className="main-content">

        <h1 style={{ textAlign: 'center', fontSize: '1.8rem', marginBottom: '25px' }}>
          Mes commandes
        </h1>

        {commandes.length === 0 ? (
          <div style={styles.vide}>
            <span style={{ fontSize: '3rem' }}>🛒</span>
            <p style={{ color: '#888', marginTop: '15px' }}>
              Tu n'as pas encore passé de commande.
            </p>
            <button onClick={() => navigate('/commande')} style={styles.boutonCommander}>
              Commander maintenant
            </button>
          </div>
        ) : (
          commandes.map((commande) => (
            <div key={commande.id_commande} style={styles.carteCommande}>

              {/* ── En-tête de la commande ── */}
              <div style={styles.enTete}>
                <div>
                  <span style={{ fontWeight: 'bold', color: '#3b2f2f', fontSize: '1rem' }}>
                    Commande #{commande.id_commande}
                  </span>
                  {/* Code de retrait affiché si disponible */}
                  {commande.codeRetrait && (
                    <p style={styles.code}>
                      Code : <strong style={{ letterSpacing: '3px' }}>{commande.codeRetrait}</strong>
                    </p>
                  )}
                  <p style={styles.date}>
                    Passée le {formaterDate(commande.dateCreation)}
                  </p>
                  {commande.dateRetrait && (
                    <p style={styles.date}>
                      Retrait prévu le {formaterDate(commande.dateRetrait)}
                    </p>
                  )}
                  {commande.livraison && (
                    <p style={{ ...styles.date, color: '#c0392b' }}>
                      Livraison demandée
                    </p>
                  )}
                </div>
                <div style={{ textAlign: 'right' }}>
                  {/* Badge statut coloré */}
                  <span style={{
                    backgroundColor: couleurStatut(commande.statut),
                    color: 'white',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    fontWeight: 'bold',
                  }}>
                    {texteStatut(commande.statut)}
                  </span>
                  <p style={{ margin: '8px 0 0 0', fontWeight: 'bold', color: '#c0392b' }}>
                    {commande.prixTotal} €
                  </p>
                </div>
              </div>

              {/* ── Détail des lignes ── */}
              <div style={{ marginTop: '10px' }}>
                {commande.lignes.map((ligne) => (
                  <div key={ligne.id_ligne} style={styles.ligneDetail}>
                    <span>
                      {ligne.tiramisu.nom} - {ligne.taille.nom} - {ligne.gout.nom}
                      {ligne.supplements.length > 0 && (
                        <span style={{ color: '#c0392b', fontSize: '0.85rem' }}>
                          {' '}(+ {ligne.supplements.map(s => s.nom).join(', ')})
                        </span>
                      )}
                    </span>
                    <span style={{ color: '#666', fontSize: '0.85rem' }}>
                      x{ligne.quantite}
                    </span>
                  </div>
                ))}
              </div>

            </div>
          ))
        )}

      </main>
    </div>
  );
}

// ─────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────
const styles = {
  vide: {
    textAlign: 'center',
    padding: '40px 20px',
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
    marginTop: '15px',
  },
  carteCommande: {
    border: '1px solid #f0e6d2',
    borderRadius: '10px',
    padding: '15px',
    marginBottom: '15px',
    backgroundColor: 'white',
  },
  enTete: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottom: '1px solid #f0e6d2',
    paddingBottom: '10px',
  },
  code: {
    margin: '4px 0 0 0',
    fontSize: '0.9rem',
    color: '#3b2f2f',
  },
  date: {
    margin: '3px 0 0 0',
    fontSize: '0.8rem',
    color: '#888',
  },
  ligneDetail: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '5px 0',
    fontSize: '0.9rem',
    color: '#3b2f2f',
    borderBottom: '1px solid #faf7f2',
  },
};

export default MesCommandes;