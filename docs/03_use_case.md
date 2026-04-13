```mermaid
usecaseDiagram
    actor User as Visiteur / Client
    actor Admin as Administrateur

    package "Site de Tiramisu (Fictif)" {
        usecase UC1 as Consulter le catalogue
        usecase UC2 as Gérer son panier
        usecase UC3 as Passer une commande (Simulation)
        usecase UC4 as Annuler une commande (30min)
        usecase UC5 as S'authentifier
        usecase UC6 as Suivre sa fidélité
        usecase UC7 as Gérer le catalogue (CRUD)
        usecase UC8 as Suivre les commandes
        usecase UC9 as Recevoir notification
    }

    User --> UC1
    User --> UC2
    User --> UC3
    User --> UC4
    User --> UC5
    User --> UC6

    Admin --> UC5
    Admin --> UC7
    Admin --> UC8
    UC9 --> Admin