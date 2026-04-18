// src/pages/Commande.jsx
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
  const { ajouterAuPanier, utilisateur, commandeValidee } = useAuthStore();
  const navigate = useNavigate();

  const getImage = (nom) => {
    if (nom.toLowerCase().includes('crêpe')) return '/tira-crepes.jpg';
    return '/tiramisu.jpg';
  };

  useEffect(() => {
    if (!utilisateur) { navigate('/login'); return; }

    // Si une commande est en cours et en attente, on redirige vers le checkout
  if (commandeValidee && commandeValidee.statut === 'EN_ATTENTE') {
    navigate('/checkout');
    return;
  }

    api.get('/api/menu')
      .then(reponse => setMenu(reponse.data))
      .catch(erreur => console.error("Erreur chargement menu :", erreur));
  }, []);

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

  const calculerPrix = () => {
    if (!selection.taille) return 0;
    const prixSupplements = selection.supplements.reduce((total, s) => total + s.prix, 0);
    return ((selection.taille.prix + prixSupplements) * selection.quantite).toFixed(2);
  };

  const ajouterAuPanierHandler = () => {
    if (!utilisateur) { navigate('/login'); return; }

    // Le goût est obligatoire
    if (!selection.tiramisu || !selection.gout || !selection.taille) {
      setConfirmation('⚠️ Choisis un tiramisu, un goût et une taille !');
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
    setConfirmation(`✅ ${selection.tiramisu.nom} (${selection.gout.nom}) ajouté au panier !`);
    setTimeout(() => setConfirmation(''), 3000);
    setSelection({ tiramisu: null, gout: null, taille: null, supplements: [], quantite: 1 });
  };

  if (!menu) return <Chargement texte="Chargement de la carte..." />;

  return (
    <div className="app-container">
      <main className="main-content">

        <h1 style={{ textAlign: 'center', fontSize: '1.8rem', marginBottom: '10px' }}>
          Passe ta commande 🍰
        </h1>

        <div style={{
          backgroundColor: '#ffe6e6', color: '#cc0000', padding: '12px',
          textAlign: 'center', borderRadius: '8px', marginBottom: '25px',
          fontWeight: 'bold', border: '1px solid #ffcccc'
        }}>
          ⚠️ Simulation uniquement - aucune vraie commande ne sera traitée.
        </div>

        {confirmation && (
          <div style={{
            backgroundColor: confirmation.includes('⚠️') ? '#ffe6e6' : '#e6ffe6',
            color: confirmation.includes('⚠️') ? '#cc0000' : '#006600',
            padding: '12px', textAlign: 'center', borderRadius: '8px',
            marginBottom: '20px', fontWeight: 'bold',
            border: confirmation.includes('⚠️') ? '1px solid #ffcccc' : '1px solid #ccffcc'
          }}>
            {confirmation}
          </div>
        )}

        {/* CHOIX DU TIRAMISU */}
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

        {/* CHOIX DU GOUT */}
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
                  </span>
                );
              })}
            </div>
          </section>
        )}

        {/* CHOIX DE LA TAILLE */}
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
                    {taille.nom} - <strong>{taille.prix}€</strong>
                  </span>
                );
              })}
            </div>
          </section>
        )}

        {/* CHOIX DES SUPPLEMENTS */}
        {selection.taille && (
          <section className="category-section">
            <h2 className="category-title">Une petite garniture ?</h2>
            <p className="optionnel-text">Optionnel - +0,80€ par garniture, tu peux en prendre plusieurs !</p>
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
                    {supp.nom} (+{supp.prix}€)
                  </span>
                );
              })}
            </div>
          </section>
        )}

        {/* QUANTITE ET AJOUT AU PANIER */}
        {selection.taille && (
          <section className="category-section" style={{ textAlign: 'center' }}>
            <h2 className="category-title">Combien tu en veux ?</h2>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', margin: '20px 0' }}>
              <button
                onClick={() => setSelection(prev => ({ ...prev, quantite: Math.max(1, prev.quantite - 1) }))}
                style={styles.boutonQuantite}
              >
                −
              </button>
              <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{selection.quantite}</span>
              <button
                onClick={() => setSelection(prev => ({ ...prev, quantite: prev.quantite + 1 }))}
                style={styles.boutonQuantite}
              >
                +
              </button>
            </div>

            <p style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#3b2f2f' }}>
              Total : <span style={{ color: '#c0392b' }}>{calculerPrix()}€</span>
            </p>

            <button onClick={ajouterAuPanierHandler} style={styles.boutonAjouter}>
              🛒 Ajouter au panier
            </button>
          </section>
        )}

      </main>
    </div>
  );
}

const styles = {
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
};

export default Commande;