// src/pages/Profil.jsx
// Page profil du client connecté.
// Affiche uniquement les points de fidélité avec une jauge visuelle.
// L'historique des commandes est dans MesCommandes.jsx

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import useAuthStore from '../store/useAuthStore';
import '../App.css';
import Chargement from '../components/Chargement';

function Profil() {
  const { utilisateur } = useAuthStore();
  const navigate = useNavigate();

  const [profil, setProfil] = useState(null);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    if (!utilisateur) { navigate('/login'); return; }

    // On n'a plus besoin de l'historique ici — il est dans MesCommandes.jsx
    api.get('/api/users/profil')
      .then(reponse => setProfil(reponse.data.profil))
      .catch(erreur => console.error("Erreur chargement profil :", erreur))
      .finally(() => setChargement(false));
  }, []);

  // ── Calcul de la jauge de fidélité ──
  // Règle : 5 points = 1 tiramisu gratuit
  const calculerJauge = (points) => {
    const tiramisusGratuits = Math.floor(points / 5);
    // Si multiple exact de 5, on affiche 5/5 plutôt que 0/5
    const pointsDansCycle = points % 5 === 0 && points > 0 ? 5 : points % 5;
    const pourcentage = (pointsDansCycle / 5) * 100;
    return { pointsDansCycle, tiramisusGratuits, pourcentage };
  };

  if (chargement) return <Chargement texte="Chargement du profil..." />;

  const { pointsDansCycle, tiramisusGratuits, pourcentage } = calculerJauge(profil?.pointsFidelite || 0);

  return (
    <div className="app-container">
      <main className="main-content">

        <h1 style={{ textAlign: 'center', fontSize: '1.8rem', marginBottom: '25px' }}>
          Ton profil
        </h1>

        {/* ── CARTE FIDÉLITÉ ── */}
        <section className="category-section">
          <h2 className="category-title">Carte de fidélité</h2>

          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <p style={{ fontSize: '1.1rem', color: '#3b2f2f', marginBottom: '5px' }}>
              Bonjour <strong>{profil?.pseudo}</strong> !
            </p>
            <p style={{ color: '#666', marginBottom: '20px' }}>
              Tu as <strong style={{ color: '#c0392b' }}>
                {profil?.pointsFidelite} point{profil?.pointsFidelite > 1 ? 's' : ''}
              </strong> au total.
            </p>

            {/* ── Jauge visuelle ── */}
            <div style={{ marginBottom: '10px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.85rem',
                color: '#666',
                marginBottom: '8px'
              }}>
                <span>{pointsDansCycle} / 5 tiramisus</span>
                <span style={{ marginLeft: '8px' }}>
                  {pointsDansCycle === 5
                    ? 'Tiramisu gratuit disponible !'
                    : `Prochain gratuit dans ${5 - pointsDansCycle} commande${5 - pointsDansCycle > 1 ? 's' : ''}`
                  }
                </span>
              </div>

              {/* Barre de progression */}
              <div style={{
                backgroundColor: '#f0e6d2',
                borderRadius: '20px',
                height: '20px',
                overflow: 'hidden',
              }}>
                <div style={{
                  width: `${pourcentage}%`,
                  height: '100%',
                  backgroundColor: '#c0392b',
                  borderRadius: '20px',
                  transition: 'width 0.5s ease',
                }} />
              </div>
            </div>

            {/* Tiramisus gratuits disponibles */}
            {tiramisusGratuits > 0 && (
              <div style={{
                backgroundColor: '#e6ffe6',
                border: '1px solid #ccffcc',
                borderRadius: '10px',
                padding: '15px',
                marginTop: '15px',
                color: '#006600',
                fontWeight: 'bold',
              }}>
                Tu as {tiramisusGratuits} tiramisu{tiramisusGratuits > 1 ? 's' : ''} gratuit{tiramisusGratuits > 1 ? 's' : ''} disponible{tiramisusGratuits > 1 ? 's' : ''} !
              </div>
            )}

            {/* Icônes de progression (5 cases) */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '10px',
              marginTop: '20px'
            }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} style={{
                  width: '45px',
                  height: '45px',
                  borderRadius: '50%',
                  backgroundColor: i <= pointsDansCycle ? '#c0392b' : '#f0e6d2',
                  border: '2px solid #c0392b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem',
                  transition: 'all 0.3s ease',
                }}>
                  {i <= pointsDansCycle ? '🍰' : ''}
                </div>
              ))}
            </div>

            <p style={{ fontSize: '0.8rem', color: '#999', marginTop: '10px' }}>
              5 tiramisus achetés = 1 Petite tiramisu (3,50 €) offerte
            </p>
          </div>
        </section>

      </main>
    </div>
  );
}

export default Profil;