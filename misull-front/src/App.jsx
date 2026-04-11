import { useState, useEffect } from 'react'
import './App.css' // <-- On n'oublie pas d'importer le fichier CSS !

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
        <h1>MISULL</h1>
        <p>Tiramisus et Tira-crêpes</p>
      </header>

      <main className="main-content">
        
        {menu.categories.map((categorie) => (
          <section key={categorie.id} className="category-section">
            <h2 className="category-title">{categorie.nom}</h2>
            
            <div className="flavors-container">
              {categorie.gouts.map((gout) => (
                <span key={gout} className="flavor-badge">
                  {gout}
                </span>
              ))}
            </div>
          </section>
        ))}

        <section className="info-section">
          <h3>Infos utiles</h3>
          <p>{menu.infos.avertissement}</p>
          <p>{menu.infos.paiement} | {menu.infos.livraison}</p>
        </section>

      </main>

    </div>
  )
}

export default App