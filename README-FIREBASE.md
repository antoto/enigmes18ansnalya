# Mise en place Firebase — Opération 06:45

Ce document explique tout ce qu'il faut faire **côté console Firebase**
pour que `index.html` et `admin.html` fonctionnent du premier coup.

Projet concerné : `enigmes-18-ans-nalya-1f5c5`

---

## 1. Fichiers livrés

```
index.html          → page publique (déjà modifiée, design 100% conservé)
admin.html           → poste de commandement (nouveau)
admin.css            → styles de l'admin (nouveau)
admin.js             → logique de l'admin (nouveau)
firebase-config.js   → configuration Firebase partagée (nouveau)
README-FIREBASE.md   → ce document
```

Les 5 fichiers doivent être placés **dans le même dossier**, à la racine
du site (là où se trouve déjà `index.html`).

---

## 2. Activer l'authentification (Email/Password)

1. Aller sur [console.firebase.google.com](https://console.firebase.google.com)
   et ouvrir le projet `enigmes-18-ans-nalya-1f5c5`.
2. Menu de gauche → **Build → Authentication**.
3. Onglet **Sign-in method** → cliquer sur **Email/Password**.
4. Activer le premier interrupteur ("Email/Password") → **Enregistrer**.

## 3. Créer ton compte admin

1. Toujours dans **Authentication**, onglet **Users**.
2. Cliquer sur **Add user**.
3. Renseigner l'email et le mot de passe qui te serviront à te connecter
   sur `admin.html`.
4. Valider. C'est ce couple email/mot de passe que tu utiliseras sur
   l'écran de connexion de l'admin.

Tu peux créer plusieurs comptes de la même façon si plusieurs personnes
doivent avoir accès à l'admin.

## 4. Créer la base de données (si ce n'est pas déjà fait)

1. Menu de gauche → **Build → Realtime Database**.
2. Si aucune base n'existe encore, cliquer sur **Create Database**,
   choisir une région, puis démarrer en **mode verrouillé** (les règles
   seront remplacées à l'étape suivante de toute façon).

## 5. Configurer les règles de sécurité

Toujours dans **Realtime Database**, onglet **Rules**, remplace le
contenu par ceci puis clique sur **Publish** :

```json
{
  "rules": {
    "config": {
      ".read": true,
      ".write": "auth != null"
    },
    "enigmes": {
      ".read": true,
      ".write": "auth != null"
    },
    "notifications": {
      ".read": true,
      ".write": "auth != null"
    },
    ".read": false,
    ".write": false
  }
}
```

Ce que font ces règles :
- **Lecture publique** de `config`, `enigmes` et `notifications` :
  n'importe qui visitant `index.html` peut lire ces données (c'est
  nécessaire pour que le site fonctionne sans connexion).
- **Écriture réservée aux comptes authentifiés** (`auth != null`) :
  seule une personne connectée via `admin.html` (avec un compte créé à
  l'étape 3) peut modifier les notifications, les dates des énigmes ou
  la date finale.
- Tout le reste de la base est fermé par défaut (`".read": false,
  ".write": false` au niveau racine).

## 6. Structure des données dans Firebase

```
config/
    targetDate     → string ISO 8601, ex: "2026-10-19T06:45:00.000Z"

enigmes/
    1/date         → string ISO 8601
    2/date         → string ISO 8601
    ...
    13/date        → string ISO 8601

notifications/
    -NxYz.../
        title       → string
        message     → string
        visible     → boolean
        createdAt   → number (timestamp ms, sert au tri et à "republier")
        date        → string ISO 8601 (date de création lisible)
```

Tant qu'une valeur n'existe pas encore dans Firebase (juste après
l'installation, par exemple), `index.html` utilise automatiquement les
valeurs par défaut déjà codées dans le fichier — le site ne peut donc
jamais « casser » à cause d'une base vide.

## 7. Se connecter à l'admin

1. Ouvrir `admin.html` dans un navigateur.
2. Se connecter avec l'email/mot de passe créés à l'étape 3.
3. Utiliser la sidebar pour naviguer entre Tableau de bord, Notifications,
   Énigmes, Compte à rebours et Paramètres.

Toute modification faite dans l'admin (envoi de notification,
changement de date d'énigme, changement de la date finale) apparaît
**immédiatement** sur `index.html` ouvert dans un autre onglet ou par
la personne à qui le site est destiné — sans qu'elle ait besoin de
recharger la page.

## 8. Domaines autorisés (si besoin)

Si tu héberges le site sur un nom de domaine personnalisé (autre que
`*.web.app` / `*.firebaseapp.com`), pense à l'ajouter dans
**Authentication → Settings → Authorized domains**, sinon la connexion
sur `admin.html` sera refusée par Firebase pour des raisons de sécurité.
