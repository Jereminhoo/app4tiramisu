# Contrat d'API - Application Tiramisu

Ce document liste toutes les routes (URL) que le front-end React peut appeler sur le serveur Express.

## 🔐 1. Authentification (Utilisateurs)

| Méthode | Route | Description | Ce que React envoie (Body) | Ce que Express répond |
| :--- | :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/inscription` | Crée un nouveau compte | `{ pseudo, motDePasse }` | `201 Created` + Message |
| **POST** | `/api/auth/connexion` | Connecte l'utilisateur | `{ pseudo, motDePasse }` | `200 OK` + **Token JWT** |

## 🍰 2. Catalogue (Tiramisus)

| Méthode | Route | Description | Ce que React envoie (Body) | Ce que Express répond |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/api/tiramisus` | Récupère la liste de tous les tiramisus pour la vitrine | *Rien* | `200 OK` + Tableau JSON des tiramisus |

*(Note : Seul l'admin aura les routes POST, PUT, DELETE pour modifier le catalogue)*

## 🛒 3. Commandes (Simulation)

> ⚠️ **Important :** Pour toutes ces routes, React doit envoyer le **Token JWT** dans les headers (en-têtes) de la requête pour prouver l'identité du client.

| Méthode | Route | Description | Ce que React envoie (Body) | Ce que Express répond |
| :--- | :--- | :--- | :--- | :--- |
| **POST** | `/api/commandes` | Passe une nouvelle commande | `{ panier: [ {id_tiramisu, quantite, supplement} ] }` | `201 Created` + Message simulation |
| **GET** | `/api/commandes/historique`| Récupère les anciennes commandes du client connecté | *Rien* | `200 OK` + Tableau des commandes |
| **PUT** | `/api/commandes/:id/annuler`| Annule une commande (si - de 30 min) | *Rien* (l'ID est dans l'URL) | `200 OK` + Nouveau statut |

## 🛠️ 4. Administration (Toi & Ton Frère)

> ⚠️ **Important :** Express vérifiera que le Token envoyé appartient bien à un compte avec le rôle "Admin".

| Méthode | Route | Description | Ce que React envoie (Body) | Ce que Express répond |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/api/admin/commandes` | Récupère TOUTES les commandes en cours | *Rien* | `200 OK` + Tableau global |
| **PUT** | `/api/admin/commandes/:id/statut` | Passe une commande en "Préparation" ou "Prête" | `{ statut: "PRETE" }` | `200 OK` |
| **GET** | `/api/admin/utilisateurs` | Liste tous les comptes pour repérer les trolls | *Rien* | `200 OK` + Tableau users |
| **PUT** | `/api/admin/utilisateurs/:id/bannir`| Banni un troll (passe estBanni à true) | *Rien* (l'ID est dans l'URL) | `200 OK` + Confirmation |