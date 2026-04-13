```mermaid
useCaseDiagram
    actor "Visiteur / Client" as User
    actor "Administrateur (Toi & Ton frère)" as Admin

    package "Site de Tiramisu (Fictif)" {
        usecase "Consulter le catalogue" as UC1
        usecase "Gérer son panier" as UC2
        usecase "Passer une commande (Simulation)" as UC3
        usecase "Annuler une commande (Délai 30min)" as UC4
        usecase "S'authentifier (Pseudo/MDP)" as UC5
        usecase "Suivre sa fidélité" as UC6
        usecase "Gérer le catalogue (CRUD)" as UC7
        usecase "Suivre et modifier le statut des commandes" as UC8
        usecase "Recevoir notification (Bot Discord/Telegram)" as UC9
    }

    User --> UC1
    User --> UC2
    User --> UC3
    User --> UC4
    User --> UC5
    User --> UC6

    UC9 <-- Admin : Reçoit
    Admin --> UC5
    Admin --> UC7
    Admin --> UC8