classDiagram
    class Utilisateur {
        +int id_utilisateur
        +String pseudo
        +String motDePasse
        +String role
        +int pointsFidelite
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

    Utilisateur &quot;1&quot; -- &quot;*&quot; Commande : passe
    Commande &quot;1&quot; *-- &quot;1..*&quot; LigneCommande : contient
    LigneCommande &quot;*&quot; -- &quot;1&quot; Tiramisu : correspond à