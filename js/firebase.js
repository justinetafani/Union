// Initialisation Firebase (SDK modulaire v10, chargé depuis le CDN Google).
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  connectFirestoreEmulator,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

export const configured = firebaseConfig.apiKey && !firebaseConfig.apiKey.startsWith("REMPLACER");

let app = null;
let db = null;

if (configured) {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
}

export { db };
