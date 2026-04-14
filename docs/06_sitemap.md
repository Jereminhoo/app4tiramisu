# Sitemap - Interface React (misull-front)

Voici l'arborescence des pages prévues pour le site front-end.

## 🌍 Espace Public (Visiteurs)
- `/` : Page d'accueil (Présentation du concept)
- `/boutique` : Catalogue complet des tiramisus
- `/boutique/:id` : Fiche détail d'un tiramisu (ingrédients, prix, bouton ajouter au panier)
- `/panier` : Récapitulatif du panier actuel
- `/login` : Page de connexion et d'inscription

## 👤 Espace Client (Nécessite d'être connecté)
- `/checkout` : Page de validation de la commande (Simulation)
- `/profil` : Tableau de bord du client (points de fidélité, infos perso)
- `/profil/commandes` : Historique de ses commandes passées

## 🛠️ Espace Administration (Accès restreint)
- `/admin` : Dashboard d'accueil admin (statistiques rapides)
- `/admin/commandes` : Liste de toutes les commandes à préparer (avec bouton pour changer le statut)
- `/admin/catalogue` : Liste des tiramisus (pour pouvoir ajouter/modifier le catalogue)
- `/admin/utilisateurs` : Liste des comptes (avec le fameux bouton pour bannir)