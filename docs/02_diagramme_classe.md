```mermaid
classDiagram
    class Utilisateur {
        +int id_utilisateur
        +String pseudo
        +String motDePasse
        +String role
        +int pointsFidelite
        +boolean estBanni
    }

    class Tiramisu {
        +int id_tiramisu
        +String nom
        +String description
        +String listeIngredients
        +float prix
    }

    class Commande {
        +int id_commande
        +int id_utilisateur
        +Date dateCreation
        +String statut
        +float prixTotal
    }

    class LigneCommande {
        +int id_ligne
        +int id_commande
        +int id_tiramisu
        +int quantite
        +String supplement
    }

    Utilisateur "1" -- "*" Commande : passe
    Commande "1" *-- "1..*" LigneCommande : contient
    LigneCommande "*" -- "1" Tiramisu : correspond à