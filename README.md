# 📂 OPÉRATION 06:45 — Dossier Confidentiel

Bienvenue dans le dépôt secret de l'**Opération 06:45**. Ce projet est une application web statique (HTML/CSS/JS) conçue sur mesure pour célébrer les 18 ans de **Nalya**. Elle intègre un système d'énigmes à déverrouillage temporel progressif menant à l'annonce d'un voyage surprise à Paris pendant les vacances de la Toussaint 2026.

---

## 🛠️ Vue d'Ensemble & Fonctionnalités

* **Design Immersif (Style "Dossier Classifié") :** Ambiance rétro/militaire haut de gamme avec scanlines, effet de vignette, police d'écriture machine à écrire (`Special Elite`) et un tampon rouge animé *Top Secret*.
* **Compte à Rebours Global :** Un décompte précis en temps réel synchronisé jusqu'au jour du grand départ fixé au **19 Octobre 2026 à 06:45**.
* **Système de 13 Énigmes Temporisées :** Les énigmes s'ouvrent automatiquement à une date et heure précises sans nécessiter de base de données. Tant qu'une énigme est verrouillée, son texte est flouté par un filtre CSS (`blur`) et affiche un compte à rebours individuel.
* **Grille de Polaroids :** Un espace dédié pour afficher 4 photos de groupe mémorables avec des légendes personnalisables.

---

## 🔐 La Logique du Chiffrement (La Phrase Secrète)

Pour rendre la destination (Paris) totalement impossible à deviner de manière précoce, les mots-clés distillés à chaque énigme forment une phrase métaphorique hyper-complexe :

> **« Le triumvirat cycloïde précipite la stryge métallurgique au vortex des sédiments lutéciens. »**

### Décodage de la Solution (Pour les Organisateurs)
* **Le triumvirat cycloïde :** Le trio d'amis (Ethan, Lise, Antonin) liés par la géométrie d'une roue (référence subtile au championnat de VTT d'Antonin).
* **Précipite :** Entraîne / propulse vers l'avant.
* **La stryge métallurgique :** La Tour Eiffel (mélange entre les célèbres sculptures de monstres ailés de Paris et sa structure en fer).
* **Au vortex des sédiments lutéciens :** La Seine (Lutèce étant le nom antique de Paris, "sédiments" fait écho au fleuve et à ses origines marécageuses).

---

## 📅 Calendrier de Publication des Énigmes (JavaScript `Date()`)

En JavaScript, l'objet `new Date(année, mois, jour, heure, minute)` utilise un index à base zéro pour les mois (**0 = Janvier, 6 = Juillet, 7 = Août, 8 = Septembre, 9 = Octobre**). Le code est configuré pour l'année **2026** de la façon suivante :

| Id | Titre du Fragment | Date de Déblocage (Heure) | Mot-clé |
| :--- | :--- | :--- | :--- |
| **1** | Le Double Jeu | Samedi 18 Juillet (23h23) | `LE TRIUMVIRAT` |
| **2** | Les Retrouvailles du Sphinx | Mercredi 29 Juillet (18h04) | `CYCLOÏDE` |
| **3** | La Trajectoire Courbe | Samedi 8 Août (11h11) | `PRÉCIPITE` |
| **4** | L'Ombre sur la Ville | Mardi 18 Août (14h00) | `LA STRYGE` |
| **5** | La Forge d’Héphaïstos | Vendredi 28 Août (20h00) | `MÉTALLURGIQUE` |
| **6** | Le Point de Non-Retour | Lundi 7 Septembre (08h00) | `AU` |
| **7** | Le Maître des Courants | Jeudi 17 Septembre (17h17) | `VORTEX` |
| **8** | Le Miroir Inversé | Dimanche 27 Septembre (19h00) | `DES` |
| **9** | Les Secrets Ensevelis | Vendredi 2 Octobre (16h30) | `SÉDIMENTS` |
| **10** | L'Ancienne Cité | Mercredi 7 Octobre (12h00) | `LUTÉCIENS` |
| **11** | Le Grand Assemblage | Dimanche 11 Octobre (21h00) | *(Consigne de tri)* |
| **12** | L'Outil des Sages | Mercredi 14 Octobre (18h30) | *(Indice historique)* |
| **13** | L'Ultime Sommation | Vendredi 16 Octobre (22h22) | *(Départ imminent)* |

---

## 🚀 Personnalisation des Médias

Pour lier les images physiques aux Polaroids de la page Web, place les fichiers photos dans le même dossier que `index.html` en respectant exactement ces noms de fichiers :
1.  `nalyaanto.jpg` (Polaroid n°1 - Antonin & Nalya)
2.  `nalyalise.jpg` (Polaroid n°2 - Lise & Nalya)
3.  `nalyaethan.jpg` (Polaroid n°3 - Ethan & Nalya)
4.  `groupe.jpg` (Polaroid n°4 - Photo d'équipe)

Pour modifier les petits mots manuscrits sous les photos, édite le tableau `POLAROID_NOTES` présent à la ligne 480 du fichier `index.html`.

---

## 📱 Optimisation Mobile iOS
L'application inclut des balises `apple-mobile-web-app` spécifiques permettant à Nalya d'ajouter le site directement sur son écran d'accueil iPhone via Safari (Action *Partager* -> *Sur l'écran d'accueil*). Cela transforme le site en une véritable application indépendante avec sa propre icône (`iconeenigmes.png`).