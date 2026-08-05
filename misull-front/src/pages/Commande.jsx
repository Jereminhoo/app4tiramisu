// src/pages/Commande.jsx
// Page de commande — permet de choisir un tiramisu, son goût, sa taille,
// ses garnitures et sa quantité, puis de l'ajouter au panier.

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import useAuthStore from '../store/useAuthStore';
import '../App.css';
import Chargement from '../components/Chargement';

function Commande() {
  const [menu, setMenu] = useState(null);
  const [selection, setSelection] = useState({
    tiramisu: null,
    gout: null,
    taille: null,
    supplements: [],
    quantite: 1,
  });
  const [confirmation, setConfirmation] = useState('');
  // Réponse du client à la question "es-tu de La Louvière ?"
  // null = pas encore répondu, 'oui' ou 'non' = réponse donnée
  const [reponseLocalite, setReponseLocalite] = useState(null);
  const { ajouterAuPanier, utilisateur, commandeValidee, panier } = useAuthStore();
  const navigate = useNavigate();

  // Retourne l'image selon le nom du tiramisu
  const getImage = (nom) => {
    if (nom.toLowerCase().includes('crêpe')) return '/tira-crepes.jpg';
    return '/tiramisu.jpg';
  };

  useEffect(() => {
    // Si pas connecté, on redirige vers le login
    if (!utilisateur) { navigate('/login'); return; }

    // Si une commande est déjà en cours, on redirige vers le checkout
    if (commandeValidee && commandeValidee.statut === 'EN_ATTENTE') {
      navigate('/checkout');
      return;
    }

    api.get('/api/menu')
      .then(reponse => setMenu(reponse.data))
      .catch(erreur => console.error("Erreur chargement menu :", erreur));
  }, []);

  // ─── HANDLERS DE SÉLECTION ───
  const choisirTiramisu = (tiramisu) => {
    // On réinitialise tout quand on change de tiramisu
    setSelection({ tiramisu, gout: null, taille: null, supplements: [], quantite: 1 });
  };

  const choisirGout = (gout) => {
    setSelection(prev => ({ ...prev, gout, taille: null, supplements: [] }));
  };

  const choisirTaille = (taille) => {
    setSelection(prev => ({ ...prev, taille }));
  };

  const toggleSupplement = (supplement) => {
    setSelection(prev => {
      const dejaChoisi = prev.supplements.find(s => s.id_supplement === supplement.id_supplement);
      if (dejaChoisi) {
        return { ...prev, supplements: prev.supplements.filter(s => s.id_supplement !== supplement.id_supplement) };
      } else {
        return { ...prev, supplements: [...prev.supplements, supplement] };
      }
    });
  };

  // ─── CALCUL DU PRIX ───
 const calculerPrix = () => {
    if (!selection.taille) return 0;
    const prixSupplements = selection.supplements.reduce((total, s) => total + s.prix, 0);
    // Le modificateur du goût (ex: Boudoir = -1€) s'ajoute au prix de base.
    // On utilise 0 par défaut si aucun goût n'est encore choisi.
    const modificateurGout = selection.gout?.modificateurPrix || 0;
    return ((selection.taille.prix + modificateurGout + prixSupplements) * selection.quantite).toFixed(2);
  };

  // ─── TOTAL DU PANIER ───
  // Utilisé pour la barre fixe en bas
  const calculerTotalPanier = () => {
    return panier.reduce((total, ligne) => total + ligne.prix, 0).toFixed(2);
  };

  // ─── AJOUTER AU PANIER ───
  const ajouterAuPanierHandler = () => {
    if (!utilisateur) { navigate('/login'); return; }

    if (!selection.tiramisu || !selection.gout || !selection.taille) {
      setConfirmation('warning');
      return;
    }

    const ligne = {
      id_tiramisu: selection.tiramisu.id_tiramisu,
      nom: selection.tiramisu.nom,
      id_gout: selection.gout.id_gout,
      nomGout: selection.gout.nom,
      id_taille: selection.taille.id_taille,
      nomTaille: selection.taille.nom,
      prix: parseFloat(calculerPrix()),
      quantite: selection.quantite,
      supplements: selection.supplements.map(s => s.id_supplement),
      nomsSupplements: selection.supplements.map(s => s.nom),
    };

    ajouterAuPanier(ligne);
    setConfirmation('success');
    // On cache le message après 3 secondes
    setTimeout(() => setConfirmation(''), 3000);
    // On réinitialise la sélection pour pouvoir recommander
    setSelection({ tiramisu: null, gout: null, taille: null, supplements: [], quantite: 1 });
  };

  if (!menu) return <Chargement texte="Chargement de la carte..." />;

  return (
    // paddingBottom : espace pour que la barre fixe du bas ne cache pas le contenu
    <div className="app-container" style={{ paddingBottom: panier.length > 0 ? '90px' : '0' }}>
      <main className="main-content">

        <h1 style={styles.titre}>Passe ta commande</h1>

        {/* ── Bug 10 : Message délai minimum 1 jour ── */}
        <div style={styles.banniereInfo}>
          Nous sommes étudiants ! Prévois au moins <strong>1 jour</strong> entre
          ta commande et le retrait. Merci pour ta patience !
        </div>

        {/* ── Bannière : zone de livraison ── */}
        {reponseLocalite === null ? (
          <div style={styles.banniereLocalite}>
            <p style={{ margin: '0 0 10px 0' }}>
              On livre uniquement sur La Louvière. Tu es de la région ?
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button onClick={() => setReponseLocalite('oui')} style={styles.boutonOui}>
                Oui
              </button>
              <button onClick={() => setReponseLocalite('non')} style={styles.boutonNon}>
                Non
              </button>
            </div>
          </div>
        ) : reponseLocalite === 'non' && (
          <div style={styles.banniereLocaliteNon}>
            On livre uniquement sur La Louvière. Tu peux quand même commander,
            mais contacte-nous d'abord sur{' '}
            
              <a href="https://www.instagram.com/misulalouviere"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#c0392b', fontWeight: 'bold' }}
            >
              @misulalouviere
            </a>{' '}
            pour vérifier qu'on peut te livrer.
          </div>
        )}

        {/* ── Messages de confirmation / erreur ── */}
        {confirmation === 'success' && (
          <div style={styles.banniereSucces}>
            Ajouté au panier ! Tu peux continuer à commander ou valider ton panier.
          </div>
        )}
        {confirmation === 'warning' && (
          <div style={styles.banniereErreur}>
            Choisis un tiramisu, un goût et une taille !
          </div>
        )}

        {/* ── CHOIX DU TIRAMISU ── */}
        <section className="category-section">
          <h2 className="category-title">Qu'est-ce qui te tente ?</h2>
          <div className="dessert-list">
            {menu.tiramisus.map((tira) => {
              const estSelectionne = selection.tiramisu?.id_tiramisu === tira.id_tiramisu;
              return (
                <div
                  key={tira.id_tiramisu}
                  onClick={() => choisirTiramisu(tira)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '20px',
                    cursor: 'pointer',
                    border: estSelectionne ? '2px solid #c0392b' : '2px solid transparent',
                    borderRadius: '12px', padding: '15px',
                    backgroundColor: estSelectionne ? '#fdf0ee' : 'white',
                    transition: 'all 0.25s ease',
                  }}
                  onMouseEnter={e => {
                    if (!estSelectionne) {
                      e.currentTarget.style.backgroundColor = '#f0ebe3';
                      e.currentTarget.style.transform = 'scale(1.01)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!estSelectionne) {
                      e.currentTarget.style.backgroundColor = 'white';
                      e.currentTarget.style.transform = 'scale(1)';
                    }
                  }}
                >
                  <img
                    src={getImage(tira.nom)}
                    alt={tira.nom}
                    style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '10px', flexShrink: 0 }}
                  />
                  <div>
                    <h3 className="dessert-name">{tira.nom}</h3>
                    <p className="dessert-desc">{tira.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── CHOIX DU GOÛT ── */}
        {selection.tiramisu && (
          <section className="category-section">
            <h2 className="category-title">Quel goût ?</h2>
            <div className="flavors-container">
              {menu.gouts.map((gout) => {
                const estSelectionne = selection.gout?.id_gout === gout.id_gout;
                return (
                  <span
                    key={gout.id_gout}
                    className="supp-badge"
                    onClick={() => choisirGout(gout)}
                    style={{
                      cursor: 'pointer',
                      backgroundColor: estSelectionne ? '#c0392b' : '#f0e6d2',
                      color: estSelectionne ? 'white' : '#3b2f2f',
                      border: estSelectionne ? '2px solid #c0392b' : '2px solid transparent',
                      transition: 'all 0.2s ease',
                      padding: '12px 20px',
                      fontSize: '1rem',
                    }}
                    onMouseEnter={e => {
                      if (!estSelectionne) e.currentTarget.style.backgroundColor = '#e8d9c0';
                    }}
                    onMouseLeave={e => {
                      if (!estSelectionne) e.currentTarget.style.backgroundColor = '#f0e6d2';
                    }}
                  >
                    {gout.nom}
                    {gout.modificateurPrix !== 0 && (
                      <span style={{ marginLeft: '6px', fontSize: '0.85em', opacity: 0.85 }}>
                        ({gout.modificateurPrix > 0 ? '+' : ''}{gout.modificateurPrix.toFixed(2)} €)
                      </span>
                    )}
                  </span>
                );
              })}
            </div>
          </section>
        )}

        {/* ── CHOIX DE LA TAILLE ── */}
        {selection.gout && (
          <section className="category-section">
            <h2 className="category-title">Choisis ta taille</h2>
            <div className="flavors-container">
              {menu.tailles.map((taille) => {
                const estSelectionnee = selection.taille?.id_taille === taille.id_taille;
                return (
                  <span
                    key={taille.id_taille}
                    className="price-badge"
                    onClick={() => choisirTaille(taille)}
                    style={{
                      cursor: 'pointer',
                      border: estSelectionnee ? '2px solid #c0392b' : '2px solid transparent',
                      backgroundColor: estSelectionnee ? '#fdf0ee' : '#f0e6d2',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={e => {
                      if (!estSelectionnee) e.currentTarget.style.backgroundColor = '#e8d9c0';
                    }}
                    onMouseLeave={e => {
                      if (!estSelectionnee) e.currentTarget.style.backgroundColor = '#f0e6d2';
                    }}
                  >
                    {taille.nom} - <strong>{taille.prix} €</strong>
                  </span>
                );
              })}
            </div>
          </section>
        )}

        {/* ── CHOIX DES SUPPLÉMENTS ── */}
        {selection.taille && (
          <section className="category-section">
            <h2 className="category-title">Une petite garniture ?</h2>
            <p className="optionnel-text">Optionnel - +1 € par garniture</p>
            <div className="flavors-container" style={{ marginTop: '15px' }}>
              {menu.supplements.map((supp) => {
                const estChoisi = selection.supplements.find(s => s.id_supplement === supp.id_supplement);
                return (
                  <span
                    key={supp.id_supplement}
                    className="supp-badge"
                    onClick={() => toggleSupplement(supp)}
                    style={{
                      cursor: 'pointer',
                      backgroundColor: estChoisi ? '#c0392b' : '#f0e6d2',
                      color: estChoisi ? 'white' : '#3b2f2f',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={e => {
                      if (!estChoisi) e.currentTarget.style.backgroundColor = '#e8d9c0';
                    }}
                    onMouseLeave={e => {
                      if (!estChoisi) e.currentTarget.style.backgroundColor = '#f0e6d2';
                    }}
                  >
                    {supp.nom} (+{supp.prix} €)
                  </span>
                );
              })}
            </div>
          </section>
        )}

        {/* ── QUANTITÉ ET AJOUT AU PANIER ── */}
        {selection.taille && (
          <section className="category-section" style={{ textAlign: 'center' }}>
            <h2 className="category-title">Combien tu en veux ?</h2>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', margin: '20px 0' }}>
              {/* Bug 9 : minimum 1 */}
              <button
                onClick={() => setSelection(prev => ({ ...prev, quantite: Math.max(1, prev.quantite - 1) }))}
                style={styles.boutonQuantite}
              >
                -
              </button>
              <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{selection.quantite}</span>
              {/* Bug 9 : maximum 10 */}
              <button
                onClick={() => setSelection(prev => ({ ...prev, quantite: Math.min(10, prev.quantite + 1) }))}
                style={styles.boutonQuantite}
              >
                +
              </button>
            </div>

            {/* Petit avertissement si on atteint 10 */}
            {selection.quantite === 10 && (
              <p style={{ fontSize: '0.85rem', color: '#c0392b', marginBottom: '10px' }}>
                Maximum 10 par article.
              </p>
            )}

            <p style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#3b2f2f' }}>
              Total article : <span style={{ color: '#c0392b' }}>{calculerPrix()} €</span>
            </p>

            <button onClick={ajouterAuPanierHandler} style={styles.boutonAjouter}>
              Ajouter au panier
            </button>
          </section>
        )}

      </main>

      {/* ── Bug 13 : BARRE PANIER FIXE EN BAS (style Uber Eats) ──
          Visible uniquement si le panier contient au moins 1 article.
          position: fixed = reste visible même en scrollant.
          Elle permet d'accéder au panier sans remonter en haut. */}
      {panier.length > 0 && (
        <div style={styles.barrePanier} onClick={() => navigate('/checkout')}>
          <div style={styles.barrePanierGauche}>
            {/* Badge avec le nombre d'articles */}
            <span style={styles.badge}>{panier.length}</span>
            <span>Voir mon panier</span>
          </div>
          <span style={styles.barrePanierPrix}>{calculerTotalPanier()} €</span>
        </div>
      )}

    </div>
  );
}

// ─────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────
const styles = {
  titre: {
    textAlign: 'center',
    fontSize: '1.8rem',
    marginBottom: '10px',
  },
  banniereInfo: {
    backgroundColor: '#fff8e6',
    color: '#7a5c00',
    border: '1px solid #f0c040',
    borderRadius: '8px',
    padding: '12px 20px',
    textAlign: 'center',
    marginBottom: '25px',
    fontSize: '0.95rem',
  },
  banniereSucces: {
    backgroundColor: '#e6ffe6',
    color: '#006600',
    border: '1px solid #ccffcc',
    borderRadius: '8px',
    padding: '12px',
    textAlign: 'center',
    marginBottom: '20px',
    fontWeight: 'bold',
  },
  banniereErreur: {
    backgroundColor: '#ffe6e6',
    color: '#cc0000',
    border: '1px solid #ffcccc',
    borderRadius: '8px',
    padding: '12px',
    textAlign: 'center',
    marginBottom: '20px',
    fontWeight: 'bold',
  },
  boutonQuantite: {
    backgroundColor: '#3b2f2f',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    fontSize: '1.3rem',
    cursor: 'pointer',
  },
  boutonAjouter: {
    backgroundColor: '#c0392b',
    color: 'white',
    border: 'none',
    padding: '14px 35px',
    borderRadius: '8px',
    fontSize: '1.1rem',
    cursor: 'pointer',
    marginTop: '10px',
    fontWeight: 'bold',
  },

  // ── Barre panier fixe (style Uber Eats) ──
  barrePanier: {
    position: 'fixed',       // Reste en bas même en scrollant
    bottom: '0',
    left: '0',
    right: '0',
    backgroundColor: '#c0392b',
    color: 'white',
    padding: '16px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
    zIndex: 1000,             // Au-dessus de tout le reste
    boxShadow: '0 -4px 12px rgba(0,0,0,0.15)',
  },
  barrePanierGauche: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontWeight: 'bold',
    fontSize: '1rem',
  },
  // Badge rond avec le nombre d'articles
  badge: {
    backgroundColor: 'white',
    color: '#c0392b',
    borderRadius: '50%',
    width: '26px',
    height: '26px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '0.9rem',
  },
  barrePanierPrix: {
    fontWeight: 'bold',
    fontSize: '1.1rem',
  },
  banniereLocalite: {
    backgroundColor: '#faf7f2',
    border: '1px solid #c8b49c',
    borderRadius: '8px',
    padding: '15px 20px',
    textAlign: 'center',
    marginBottom: '25px',
    fontSize: '0.95rem',
    color: '#3b2f2f',
  },
  banniereLocaliteNon: {
    backgroundColor: '#ffe6e6',
    color: '#cc0000',
    border: '1px solid #ffcccc',
    borderRadius: '8px',
    padding: '12px 20px',
    textAlign: 'center',
    marginBottom: '25px',
    fontSize: '0.9rem',
  },
  boutonOui: {
    backgroundColor: '#27ae60',
    color: 'white',
    border: 'none',
    padding: '8px 20px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  boutonNon: {
    backgroundColor: '#c0392b',
    color: 'white',
    border: 'none',
    padding: '8px 20px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
};

export default Commande;