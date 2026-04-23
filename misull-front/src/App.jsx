// src/App.jsx
// Ce fichier est le "chef d'orchestre" du frontend.
// Son seul rôle : définir quelles pages s'affichent selon l'URL.
// Il ne contient AUCUNE logique métier — juste la navigation.

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import NotFound from './pages/NotFound';

// On importe toutes nos pages
import Home from './pages/Home';
import Login from './pages/Login';
import Commande from './pages/Commande';
import Checkout from './pages/Checkout';
import Profil from './pages/Profil';
import Admin from './pages/Admin';
import MesCommandes from './pages/MesCommandes';

// On importe la barre de navigation
import Navbar from './components/Navbar';

function App() {
  return (
    // BrowserRouter active le système de navigation par URL
    <BrowserRouter>

      {/* La Navbar est en dehors des Routes → elle s'affiche sur TOUTES les pages */}
      <Navbar />

      {/* Routes définit l'ensemble des chemins possibles */}
      <Routes>

        {/* Pages publiques — accessibles sans être connecté */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/commande" element={<Commande />} />

        {/* Pages privées — nécessitent d'être connecté */}
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/profil" element={<Profil />} />

        <Route path="/mes-commandes" element={<MesCommandes />} />

        {/* Page admin — réservée aux administrateurs */}
        <Route path="/admin" element={<Admin />} />

        {/* Route attrape-tout — doit toujours être EN DERNIER */}
        {/* Si aucune route au-dessus ne correspond, on affiche le 404 */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;