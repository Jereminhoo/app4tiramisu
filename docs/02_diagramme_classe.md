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
    }

    class Taille {
        +int id_taille
        +String nom
        +float prix
    }

    class Supplement {
        +int id_supplement
        +String nom
        +float prix
    }

    class Gout {
        +int id_gout
        +String nom
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
        +int id_taille
        +int id_gout
        +int quantite
    }

    Utilisateur "1" -- "*" Commande : passe
    Commande "1" *-- "1..*" LigneCommande : contient
    LigneCommande "*" -- "1" Tiramisu : correspond à
    LigneCommande "*" -- "1" Taille : a pour format
    LigneCommande "*" -- "1" Gout : a pour goût
    LigneCommande "*" -- "*" Supplement : inclut