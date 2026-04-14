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
        S->>DB: Vérifie la disponibilité des tiramisus
        activate DB
        DB-->>S: Retourne les données des produits
        deactivate DB
        
        %% Vérification des stocks/disponibilité
        alt Un produit est indisponible
            S-->>C: Erreur 400 (Produit indisponible)
        else Tous les produits sont dispos
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
            
            %% Notification chez vous
            S->>B: POST Webhook (Alerte nouvelle commande simulation)
            
            %% Réponse finale au client
            S-->>C: Code 201 (Succès - Commande créée)
            C->>C: Vide le panier dans l'interface React
            C->>C: Affiche la page de succès (Message : "Ceci est une simulation")
        end
    end
    deactivate S