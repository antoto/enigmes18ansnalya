/* ================================================================
   firebase-config.js
   ----------------------------------------------------------------
   Configuration Firebase PARTAGÉE entre index.html et admin.html.
   Ce fichier initialise l'application Firebase une seule fois et
   exporte les instances (base de données + authentification) afin
   que les autres scripts n'aient qu'à les importer.

   Aucune donnée sensible n'est ajoutée ici au-delà de la config
   Firebase elle-même (qui est publique par nature : la sécurité
   réelle se fait via les règles Firebase, voir README-FIREBASE.md).
   ================================================================ */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-database.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAQxvD78Z4Uqs7dK3netZih7RtMuW0nWlg",
  authDomain: "enigmes-18-ans-nalya-1f5c5.firebaseapp.com",
  databaseURL: "https://enigmes-18-ans-nalya-1f5c5-default-rtdb.firebaseio.com",
  projectId: "enigmes-18-ans-nalya-1f5c5",
  storageBucket: "enigmes-18-ans-nalya-1f5c5.firebasestorage.app",
  messagingSenderId: "144744702779",
  appId: "1:144744702779:web:03f1a1351c9e655466cd1e"
};

// Initialisation unique de l'app Firebase
export const app = initializeApp(firebaseConfig);

// Base de données temps réel (Realtime Database)
export const db = getDatabase(app);

// Authentification (utilisée uniquement par admin.html)
export const auth = getAuth(app);
