import { useState, useEffect } from 'react'
import './App.css' 

function App() {
  const [menu, setMenu] = useState(null)

  useEffect(() => {
    fetch('http://localhost:3000/api/menu')
      .then(reponse => reponse.json())
      .then(donnees => setMenu(donnees))
      .catch(erreur => console.error("Erreur avec l'API :", erreur))
  }, [])

  if (!menu) return <div className="loading">Chargement de la carte...</div>

  return (
    <div className="app-container">
      
      <header className="header">
        <img src="/logo.jpg" alt="Logo Misull" className="logo" />
        <p className="subtitle">Tiramisus et Tira-crêpes fait maison</p>
      </header>

      <div className="welcome-banner">
        <img src="/welcome.jpg" alt="Welcome to Misull" style={{ maxWidth: '100%', borderRadius: '10px' }} />
      </div>

      {/* Bannière d'avertissement projet étudiant */}
      <div style={{ backgroundColor: '#ffe6e6', color: '#cc0000', padding: '15px', textAlign: 'center', borderRadius: '8px', maxWidth: '800px', margin: '0 auto 25px auto', fontWeight: 'bold', border: '1px solid #ffcccc' }}>
        ⚠️ Ceci est un projet étudiant de simulation. Aucune vraie commande ne sera traitée sur ce site.
      </div>

      <main className="main-content">
        
        <section className="category-section">
          <h2 className="category-title">Nos Desserts</h2>
          <div className="dessert-list">
            {menu.tiramisus.map((tira) => (
              <div key={tira.id_tiramisu} className="dessert-card">
                <h3 className="dessert-name">{tira.nom}</h3>
                <p className="dessert-desc">{tira.description}</p>
                <p className="dessert-ingredients">Goûts : {tira.listeIngredients}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="category-section">
          <h2 className="category-title">Tailles & Prix</h2>
          <div className="flavors-container">
            {menu.tailles.map((taille) => (
              <span key={taille.id_taille} className="price-badge">
                {taille.nom} : <strong>{taille.prix}€</strong>
              </span>
            ))}
          </div>
        </section>

        <section className="category-section">
          <h2 className="category-title">Garnitures Supplémentaires (0,80€)</h2>
          <p className="optionnel-text">OPTIONNEL : Vous n'êtes pas obligé d'en prendre !!</p>
          <div className="flavors-container">
            {menu.supplements.map((supp) => (
              <span key={supp.id_supplement} className="supp-badge">
                {supp.nom}
              </span>
            ))}
          </div>
        </section>

        <section className="info-grid">
          <div className="info-box">
            <strong>1. Étudiants</strong>
            <p>On fait ça avec passion, mais pas de commandes en urgence.</p>
          </div>
          <div className="info-box">
            <strong>2. Allergies</strong>
            <p>Sans alcool ni café. Contient du lait.</p>
          </div>
          <div className="info-box">
            <strong>3. Livraison</strong>
            <p>Retrait gratuit / Livraison +2€.</p>
          </div>
          <div className="info-box">
            <strong>4. Paiement</strong>
            <p>En espèces si possible.</p>
          </div>
        </section>

      </main>
    </div>
  )
}

export default App