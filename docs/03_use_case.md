```mermaid
graph TD
    %% Acteurs
    User((Visiteur / Client))
    Admin((Administrateur))

    subgraph "Site de Tiramisu (Fictif)"
        UC1(Consulter le catalogue)
        UC2(Gérer son panier)
        UC3(Passer une commande simulation)
        UC4(Annuler une commande -30min)
        UC5(S'authentifier)
        UC6(Suivre sa fidélité)
        UC7(Gérer le catalogue CRUD)
        UC8(Suivre les commandes)
        UC9(Recevoir notification Bot)
    end

    %% Liens Client
    User --- UC1
    User --- UC2
    User --- UC3
    User --- UC4
    User --- UC5
    User --- UC6

    %% Liens Admin
    Admin --- UC5
    Admin --- UC7
    Admin --- UC8
    UC9 -.-> Admin