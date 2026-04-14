```mermaid
sequenceDiagram
    actor C as Client (Navigateur / React)
    participant S as Serveur (API Express)
    participant DB as Base de Données
    participant B as Bot (Discord/Telegram)

    C->>S: POST /api/commandes {panier, id_utilisateur, token}
    activate S
    
    %% Vérification de la connexion
    S->>S: Vérifie le Token de connexion
    
    alt Token invalide ou absent
        S-->>C: Erreur 401 (Non Autorisé - Redirection Login)
    else Token valide
        %% Récupération des prix (fabrication à la demande, pas de stock !)
        S->>DB: Récupère le prix unitaire des tiramisus du panier
        activate DB
        DB-->>S: Retourne les prix
        deactivate DB
        
        S->>S: Calcule le prix total de la commande
        
        %% Insertion de la commande principale
        S->>DB: INSERT INTO Commande (Statut: "En attente")
        activate DB
        DB-->>S: Retourne le nouvel id_commande
        
        %% Insertion des lignes (les tiramisus et suppléments)
        S->>DB: INSERT INTO LigneCommande (id_commande, id_tiramisu, quantite)
        DB-->>S: Confirmation d'insertion
        
        %% Mise à jour du système de fidélité
        S->>DB: UPDATE Utilisateur (Ajout des points de fidélité)
        DB-->>S: Confirmation mise à jour
        deactivate DB
        
        %% Notification pour lancer la préparation
        S->>B: POST Webhook (Nouvelle commande à préparer !)
        
        %% Réponse finale au client
        S-->>C: Code 201 (Succès - Commande créée)
        C->>C: Vide le panier dans React
        C->>C: Affiche la page de succès
    end
    deactivate S