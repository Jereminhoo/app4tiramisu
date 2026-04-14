```mermaid
graph LR
    %% Acteurs et leur hiérarchie
    V((Visiteur))
    C((Client))
    A((Admin))

    %% Généralisation (Héritage)
    C -- "est un" --> V
    A -- "est un" --> C

    subgraph "Application Tiramisu"
        %% Actions de base (Visiteur)
        UC1(Consulter le catalogue)
        UC2(Gérer son panier)
        UC_Auth(S'authentifier)

        %% Actions spécifiques (Client)
        UC3(Passer commande simulation)
        UC4(Annuler commande -30min)
        UC5(Suivre sa fidélité)

        %% Actions spécifiques (Admin)
        UC6(Gérer le catalogue CRUD)
        UC7(Suivre les commandes globales)
        UC8(Recevoir notification Bot)
        UC9(Consulter la liste des utilisateurs)
        UC10(Bannir un utilisateur)
    end

    %% Liens Visiteur (Le client et l'admin en héritent)
    V --- UC1
    V --- UC2
    V --- UC_Auth

    %% Liens Client uniquement
    C --- UC3
    C --- UC5
    
    %% Relations internes (Include / Extend)
    UC3 -.->|include| UC_Auth
    UC4 -.->|extend| UC3
    UC10 -.->|extend| UC9

    %% Liens Admin uniquement
    A --- UC6
    A --- UC7
    A --- UC9
    UC7 -.-> UC8