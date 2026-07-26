// src/pages/Admin.jsx
// Page d'administration — accessible uniquement aux utilisateurs avec le rôle ADMIN.
// Divisée en 4 onglets : Commandes, Utilisateurs, Catalogue, Configuration.

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import useAuthStore from '../store/useAuthStore';
import '../App.css';

function Admin() {
  const { utilisateur } = useAuthStore();
  const navigate = useNavigate();

  // Onglet actif : 'commandes', 'utilisateurs', ou 'catalogue'
  const [onglet, setOnglet] = useState('commandes');

  // Données
  const [commandes, setCommandes] = useState([]);
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [tiramisus, setTiramisus] = useState([]);

  // Formulaire d'ajout/modification tiramisu
  const [formulaire, setFormulaire] = useState({ nom: '', description: '', listeIngredients: '' });
  const [tiramisuEnEdition, setTiramisuEnEdition] = useState(null); // null = mode ajout

  // État pour la configuration des horaires
const [config, setConfig] = useState({
    heureOuverture: '15',
    heureFermeture: '23',
    livraisonActive: 'false',
    livraisonHeureDebut: '18',
    livraisonHeureFin: '22',
    livraisonDureeCreneau: '20',
    delaiMaxJours: '7',
  });  // Messages
  const [message, setMessage] = useState('');

  // ─────────────────────────────────────────────
  // PROTECTION — redirige si pas admin
  // ─────────────────────────────────────────────
  useEffect(() => {
    if (!utilisateur) { navigate('/login'); return; }
    if (utilisateur.role !== 'ADMIN') { navigate('/'); return; }

    // On charge toutes les données au démarrage
    chargerCommandes();
    chargerUtilisateurs();
    chargerCatalogue();
    chargerConfig();
  }, []);

  // ─────────────────────────────────────────────
  // CHARGEMENT DES DONNÉES
  // ─────────────────────────────────────────────
  const chargerCommandes = async () => {
    try {
      const rep = await api.get('/api/admin/commandes');
      setCommandes(rep.data.commandes);
    } catch (e) { console.error(e); }
  };

  const chargerUtilisateurs = async () => {
    try {
      const rep = await api.get('/api/admin/utilisateurs');
      setUtilisateurs(rep.data.utilisateurs);
    } catch (e) { console.error(e); }
  };

  const chargerCatalogue = async () => {
    try {
      const rep = await api.get('/api/menu');
      setTiramisus(rep.data.tiramisus);
    } catch (e) { console.error(e); }
  };

  // Charge la configuration depuis l'API
  const chargerConfig = async () => {
    try {
      const rep = await api.get('/api/config');
      setConfig(rep.data.config);
    } catch (e) { console.error(e); }
  };

  // Sauvegarde la configuration
  const sauvegarderConfig = async () => {
    try {
      await api.put('/api/config', config);
      afficherMessage('Configuration sauvegardée !');
    } catch (e) {
      afficherMessage(e.response?.data?.message || 'Erreur.', true);
    }
  };

  // ─────────────────────────────────────────────
  // ACTIONS COMMANDES
  // ─────────────────────────────────────────────
  const changerStatut = async (id_commande, statut) => {
    try {
      await api.put(`/api/admin/commandes/${id_commande}/statut`, { statut });
      // On recharge les commandes pour avoir les données à jour
      chargerCommandes();
      afficherMessage('Statut mis à jour !');
    } catch (e) {
      afficherMessage(e.response?.data?.message || 'Erreur.', true);
    }
  };

  // ─────────────────────────────────────────────
  // ACTIONS UTILISATEURS
  // ─────────────────────────────────────────────
  const toggleBannissement = async (id_utilisateur) => {
    try {
      const rep = await api.put(`/api/admin/utilisateurs/${id_utilisateur}/bannir`);
      afficherMessage(rep.data.message);
      chargerUtilisateurs();
    } catch (e) {
      afficherMessage(e.response?.data?.message || 'Erreur.', true);
    }
  };

  // ─────────────────────────────────────────────
  // ACTIONS CATALOGUE
  // ─────────────────────────────────────────────
  const soumettreFormulaire = async () => {
    try {
      if (tiramisuEnEdition) {
        // Mode modification
        await api.put(`/api/admin/tiramisus/${tiramisuEnEdition}`, formulaire);
        afficherMessage('Tiramisu modifié !');
      } else {
        // Mode ajout
        await api.post('/api/admin/tiramisus', formulaire);
        afficherMessage('Tiramisu ajouté !');
      }
      // On remet le formulaire à zéro
      setFormulaire({ nom: '', description: '', listeIngredients: '' });
      setTiramisuEnEdition(null);
      chargerCatalogue();
    } catch (e) {
      afficherMessage(e.response?.data?.message || 'Erreur.', true);
    }
  };

  const commencerEdition = (tira) => {
    // On remplit le formulaire avec les données existantes
    setFormulaire({
      nom: tira.nom,
      description: tira.description || '',
      listeIngredients: tira.listeIngredients
    });
    setTiramisuEnEdition(tira.id_tiramisu);
  };

  const supprimerTiramisu = async (id) => {
    // On demande confirmation avant de supprimer
    if (!window.confirm('Supprimer ce tiramisu ? Cette action est irréversible.')) return;
    try {
      await api.delete(`/api/admin/tiramisus/${id}`);
      afficherMessage('Tiramisu supprimé.');
      chargerCatalogue();
    } catch (e) {
      afficherMessage(e.response?.data?.message || 'Erreur.', true);
    }
  };

  // ─────────────────────────────────────────────
  // UTILITAIRES
  // ─────────────────────────────────────────────
  const afficherMessage = (texte, estErreur = false) => {
    setMessage({ texte, estErreur });
    setTimeout(() => setMessage(''), 3000);
  };

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

  const formaterDate = (date) => new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  // ─────────────────────────────────────────────
  // AFFICHAGE
  // ─────────────────────────────────────────────
  return (
    <div className="app-container">
      <main className="main-content">

        <h1 style={{ textAlign: 'center', fontSize: '1.8rem', marginBottom: '25px' }}>
          Dashboard Admin 🛠️
        </h1>

        {/* Message flash */}
        {message && (
          <div style={{
            padding: '12px', borderRadius: '8px', marginBottom: '20px',
            textAlign: 'center', fontWeight: 'bold',
            backgroundColor: message.estErreur ? '#ffe6e6' : '#e6ffe6',
            color: message.estErreur ? '#cc0000' : '#006600',
            border: `1px solid ${message.estErreur ? '#ffcccc' : '#ccffcc'}`,
          }}>
            {message.texte}
          </div>
        )}

        {/* Onglets */}
        <div style={styles.onglets}>
          {['commandes', 'utilisateurs', 'catalogue', 'configuration'].map((o) => (
            <button
              key={o}
              onClick={() => setOnglet(o)}
              style={{
                ...styles.onglet,
                backgroundColor: onglet === o ? '#3b2f2f' : '#f0e6d2',
                color: onglet === o ? 'white' : '#3b2f2f',
              }}
            >
              {o === 'commandes' && 'Commandes'}
              {o === 'utilisateurs' && 'Utilisateurs'}
              {o === 'catalogue' && 'Catalogue'}
              {o === 'configuration' && 'Configuration'}
            </button>
          ))}
        </div>

        {/* ── ONGLET COMMANDES ── */}
        {onglet === 'commandes' && (
          <section className="category-section">
            <h2 className="category-title">
              Toutes les commandes ({commandes.length})
            </h2>

            {commandes.length === 0 ? (
              <p style={{ color: '#888', textAlign: 'center' }}>Aucune commande pour l'instant.</p>
            ) : (
              commandes.map((commande) => (
                <div key={commande.id_commande} style={styles.carteCommande}>

                  {/* En-tête */}
                  <div style={styles.enTete}>
                    <div>
                      <strong>Commande #{commande.id_commande}</strong>
                      <span style={{ color: '#888', fontSize: '0.85rem', marginLeft: '10px' }}>
                        par {commande.utilisateur.pseudo}
                      </span>
                      <p style={{ margin: '3px 0 0 0', fontSize: '0.8rem', color: '#aaa' }}>
                        {formaterDate(commande.dateCreation)}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{
                        backgroundColor: couleurStatut(commande.statut),
                        color: 'white', padding: '4px 10px',
                        borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold',
                      }}>
                        {commande.statut.replace('_', ' ')}
                      </span>
                      <p style={{ margin: '5px 0 0 0', fontWeight: 'bold', color: '#c0392b' }}>
                        {commande.prixTotal}€
                      </p>
                    </div>
                  </div>

                  {/* Détail des lignes */}
                  <div style={{ margin: '10px 0', fontSize: '0.9rem', color: '#555' }}>
                    {commande.lignes.map((ligne) => (
                      <div key={ligne.id_ligne}>
                        {ligne.tiramisu.nom} - {ligne.taille.nom} - {ligne.gout.nom} x{ligne.quantite}
                        {ligne.supplements.length > 0 && (
                          <span style={{ color: '#c0392b' }}>
                            {' '}(+ {ligne.supplements.map(s => s.nom).join(', ')})
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Sélecteur de statut */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                    <label style={{ fontSize: '0.85rem', color: '#666' }}>Changer le statut :</label>
                    <select
                      defaultValue={commande.statut}
                      onChange={(e) => changerStatut(commande.id_commande, e.target.value)}
                      style={styles.select}
                    >
                      <option value="EN_ATTENTE">En attente</option>
                      <option value="EN_PREPARATION">En préparation</option>
                      <option value="PRETE">Prête</option>
                      <option value="LIVREE">Livrée</option>
                      <option value="ANNULEE">Annulée</option>
                    </select>
                  </div>

                </div>
              ))
            )}
          </section>
        )}

        {/* ── ONGLET UTILISATEURS ── */}
        {onglet === 'utilisateurs' && (
          <section className="category-section">
            <h2 className="category-title">
              Tous les comptes ({utilisateurs.length})
            </h2>

            {utilisateurs.map((user) => (
              <div key={user.id_utilisateur} style={{
                ...styles.carteCommande,
                opacity: user.estBanni ? 0.6 : 1,
              }}>
                <div style={styles.enTete}>
                  <div>
                    <strong style={{ color: '#3b2f2f' }}>{user.pseudo}</strong>
                    <span style={{
                      marginLeft: '10px', fontSize: '0.8rem',
                      backgroundColor: user.role === 'ADMIN' ? '#f0a500' : '#f0e6d2',
                      color: user.role === 'ADMIN' ? 'white' : '#3b2f2f',
                      padding: '2px 8px', borderRadius: '10px',
                    }}>
                      {user.role}
                    </span>
                    {user.estBanni && (
                      <span style={{
                        marginLeft: '8px', fontSize: '0.8rem',
                        backgroundColor: '#c0392b', color: 'white',
                        padding: '2px 8px', borderRadius: '10px',
                      }}>
                        BANNI
                      </span>
                    )}
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#888' }}>
                      {user.pointsFidelite} point{user.pointsFidelite > 1 ? 's' : ''} de fidélité
                    </p>
                  </div>

                  {/* On ne peut pas se bannir soi-même ni bannir un admin */}
                  {user.role !== 'ADMIN' && user.id_utilisateur !== utilisateur.id && (
                    <button
                      onClick={() => toggleBannissement(user.id_utilisateur)}
                      style={{
                        ...styles.boutonBannir,
                        backgroundColor: user.estBanni ? '#27ae60' : '#c0392b',
                      }}
                    >
                      {user.estBanni ? 'Débannir' : 'Bannir'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </section>
        )}

        {/* ── ONGLET CATALOGUE ── */}
        {onglet === 'catalogue' && (
          <section className="category-section">
            <h2 className="category-title">Gérer le catalogue</h2>

            {/* Formulaire ajout/modification */}
            <div style={styles.formulaire}>
              <h3 style={{ margin: '0 0 15px 0', color: '#3b2f2f' }}>
                {tiramisuEnEdition ? '✏️ Modifier un tiramisu' : '➕ Ajouter un tiramisu'}
              </h3>

              <input
                placeholder="Nom *"
                value={formulaire.nom}
                onChange={e => setFormulaire(prev => ({ ...prev, nom: e.target.value }))}
                style={styles.input}
              />
              <input
                placeholder="Description"
                value={formulaire.description}
                onChange={e => setFormulaire(prev => ({ ...prev, description: e.target.value }))}
                style={styles.input}
              />
              <textarea
                placeholder="Liste des ingrédients *"
                value={formulaire.listeIngredients}
                onChange={e => setFormulaire(prev => ({ ...prev, listeIngredients: e.target.value }))}
                style={{ ...styles.input, height: '80px', resize: 'vertical' }}
              />

              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={soumettreFormulaire} style={styles.boutonValider}>
                  {tiramisuEnEdition ? 'Sauvegarder' : 'Ajouter'}
                </button>
                {tiramisuEnEdition && (
                  <button
                    onClick={() => {
                      setTiramisuEnEdition(null);
                      setFormulaire({ nom: '', description: '', listeIngredients: '' });
                    }}
                    style={styles.boutonAnnuler}
                  >
                    Annuler
                  </button>
                )}
              </div>
            </div>

            {/* Liste des tiramisus */}
            <div style={{ marginTop: '25px' }}>
              {tiramisus.map((tira) => (
                <div key={tira.id_tiramisu} style={styles.carteCommande}>
                  <div style={styles.enTete}>
                    <div>
                      <strong style={{ color: '#3b2f2f' }}>{tira.nom}</strong>
                      <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#888' }}>
                        {tira.description}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => commencerEdition(tira)}
                        style={styles.boutonEditer}
                      >
                        ✏️ Modifier
                      </button>
                      <button
                        onClick={() => supprimerTiramisu(tira.id_tiramisu)}
                        style={styles.boutonSupprimer}
                      >
                        🗑️ Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}


        {/* ── ONGLET CONFIGURATION ── */}
        {onglet === 'configuration' && (
          <section className="category-section">
            <h2 className="category-title">Configuration</h2>

            <div style={styles.formulaire}>
              <p style={{ margin: '0 0 15px 0', fontSize: '0.9rem', color: '#666' }}>
                Ces horaires s'appliquent aux retraits.
                En dehors de ces heures, les clients ne pourront pas valider une commande.
              </p>

              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                {/* Heure d'ouverture */}
                <div style={{ flex: 1 }}>
                  <label style={styles.label}>Heure d'ouverture</label>
                  <input
                    type="number"
                    min="0"
                    max="23"
                    value={config.heureOuverture}
                    onChange={e => setConfig(prev => ({ ...prev, heureOuverture: e.target.value }))}
                    style={styles.input}
                  />
                  <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '4px' }}>
                    Ex: 15 pour 15h00
                  </p>
                </div>

                {/* Heure de fermeture */}
                <div style={{ flex: 1 }}>
                  <label style={styles.label}>Heure de fermeture</label>
                  <input
                    type="number"
                    min="0"
                    max="23"
                    value={config.heureFermeture}
                    onChange={e => setConfig(prev => ({ ...prev, heureFermeture: e.target.value }))}
                    style={styles.input}
                  />
                  <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '4px' }}>
                    Ex: 23 pour 23h00
                  </p>
                </div>
              </div>

              {/* Toggle livraison — la livraison */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: 'white',
                border: '1px solid #c8b49c',
                borderRadius: '8px',
                padding: '15px',
              }}>
                <div>
                  <strong style={{ color: '#3b2f2f' }}>Livraison</strong>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#666' }}>
                    {config.livraisonActive === 'true'
                      ? 'Disponible pour les clients'
                      : 'Désactivée pour les clients'}
                  </p>
                </div>
                {/*
                  Ce bouton toggle change la valeur entre 'true' et 'false'
                  On stocke en string car la table Config ne stocke que des strings
                */}
                <button
                  onClick={() => setConfig(prev => ({
                    ...prev,
                    livraisonActive: prev.livraisonActive === 'true' ? 'false' : 'true'
                  }))}
                  style={{
                    backgroundColor: config.livraisonActive === 'true' ? '#27ae60' : '#c0392b',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    minWidth: '120px',
                  }}
                >
                  {config.livraisonActive === 'true' ? 'Active' : 'Inactive'}
                </button>
                </div>
                {/* Paramètres des créneaux de livraison — visibles seulement si la livraison est active */}
              {config.livraisonActive === 'true' && (
                <div style={{
                  backgroundColor: 'white',
                  border: '1px solid #c8b49c',
                  borderRadius: '8px',
                  padding: '15px',
                }}>
                  <strong style={{ color: '#3b2f2f', display: 'block', marginBottom: '12px' }}>
                    Créneaux de livraison
                  </strong>

                  <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                    {/* Heure de début de la plage de livraison */}
                    <div style={{ flex: 1, minWidth: '120px' }}>
                      <label style={styles.label}>Début</label>
                      <input
                        type="number"
                        min="0"
                        max="23"
                        value={config.livraisonHeureDebut}
                        onChange={e => setConfig(prev => ({ ...prev, livraisonHeureDebut: e.target.value }))}
                        style={styles.input}
                      />
                    </div>

                    {/* Heure de fin de la plage de livraison */}
                    <div style={{ flex: 1, minWidth: '120px' }}>
                      <label style={styles.label}>Fin</label>
                      <input
                        type="number"
                        min="0"
                        max="23"
                        value={config.livraisonHeureFin}
                        onChange={e => setConfig(prev => ({ ...prev, livraisonHeureFin: e.target.value }))}
                        style={styles.input}
                      />
                    </div>

                    {/* Durée d'un créneau en minutes */}
                    <div style={{ flex: 1, minWidth: '120px' }}>
                      <label style={styles.label}>Durée créneau (min)</label>
                      <input
                        type="number"
                        min="5"
                        max="120"
                        step="5"
                        value={config.livraisonDureeCreneau}
                        onChange={e => setConfig(prev => ({ ...prev, livraisonDureeCreneau: e.target.value }))}
                        style={styles.input}
                      />
                    </div>
                  </div>

                  <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '8px' }}>
                    Ex: Début 18, Fin 22, Durée 20 → génère des créneaux de 18h00 à 21h40, par tranches de 20 minutes.
                  </p>
                </div>
              )}

              {/* Fenêtre de réservation maximale — s'applique au retrait ET à la livraison */}
              <div style={{
                backgroundColor: 'white',
                border: '1px solid #c8b49c',
                borderRadius: '8px',
                padding: '15px',
              }}>
                <label style={styles.label}>Réservation possible jusqu'à (jours à l'avance)</label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={config.delaiMaxJours}
                  onChange={e => setConfig(prev => ({ ...prev, delaiMaxJours: e.target.value }))}
                  style={styles.input}
                />
                <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '4px' }}>
                  Ex: 7 → un client ne peut pas choisir une date au-delà de 7 jours à partir d'aujourd'hui.
                </p>
              </div>

              <button onClick={sauvegarderConfig} style={styles.boutonValider}>
                Sauvegarder
              </button>
            </div>

            {/* Aperçu des horaires actuels */}
            <div style={{
              marginTop: '20px',
              backgroundColor: '#e6ffe6',
              border: '1px solid #ccffcc',
              borderRadius: '10px',
              padding: '15px',
              textAlign: 'center',
            }}>
              <p style={{ margin: 0, color: '#006600', fontWeight: 'bold' }}>
                Horaires actuels : {config.heureOuverture}h00 - {config.heureFermeture}h00
              </p>
              <p style={{ margin: '8px 0 0 0', color: config.livraisonActive === 'true' ? '#006600' : '#c0392b', fontWeight: 'bold' }}>
                Livraison : {config.livraisonActive === 'true' ? 'Active' : 'Inactive'}
              </p>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

// ─────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────
const styles = {
  onglets: {
    display: 'flex',
    gap: '10px',
    marginBottom: '25px',
    flexWrap: 'wrap',
  },
  onglet: {
    padding: '10px 20px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '0.95rem',
    transition: 'all 0.2s ease',
  },
  carteCommande: {
    border: '1px solid #f0e6d2',
    borderRadius: '10px',
    padding: '15px',
    marginBottom: '15px',
  },
  enTete: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  select: {
    padding: '6px 10px',
    borderRadius: '6px',
    border: '1px solid #c8b49c',
    backgroundColor: '#faf7f2',
    fontSize: '0.9rem',
    cursor: 'pointer',
  },
  boutonBannir: {
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '0.9rem',
  },
  formulaire: {
    backgroundColor: '#faf7f2',
    border: '1px solid #f0e6d2',
    borderRadius: '10px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  input: {
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid #c8b49c',
    fontSize: '0.95rem',
    backgroundColor: 'white',
    width: '100%',
    boxSizing: 'border-box',
  },
  boutonValider: {
    backgroundColor: '#c0392b',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  boutonAnnuler: {
    backgroundColor: 'transparent',
    border: '1px solid #999',
    color: '#666',
    padding: '10px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  boutonEditer: {
    backgroundColor: '#f0e6d2',
    border: '1px solid #c8b49c',
    color: '#3b2f2f',
    padding: '6px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.85rem',
  },
  boutonSupprimer: {
    backgroundColor: 'transparent',
    border: '1px solid #c0392b',
    color: '#c0392b',
    padding: '6px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.85rem',
  },
  label: {
    display: 'block',
    marginBottom: '6px',
    fontWeight: 'bold',
    color: '#3b2f2f',
    fontSize: '0.9rem',
  },
};

export default Admin;