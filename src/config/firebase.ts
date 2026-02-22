// src/config/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// 1. On importe tout le module pour contourner l'erreur de définition TS
import * as AuthModule from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCYnkP1BL5tJBvKWp-jC-_mTNsYcbBMVGY",
  authDomain: "habtrack-a63a9.firebaseapp.com",
  projectId: "habtrack-a63a9",
  storageBucket: "habtrack-a63a9.firebasestorage.app",
  messagingSenderId: "295557763309",
  appId: "1:295557763309:web:9f21fa1454e47e8a783ce4",
  measurementId: "G-ZMDS8Y3MPM"
};

// 2. Initialiser l'app
const app = initializeApp(firebaseConfig);

// 3. Initialiser l'Auth de manière blindée
// On déclare la variable pour l'export
let auth: AuthModule.Auth;

try {
  // On tente d'utiliser la persistance native (pour rester connecté)
  // @ts-ignore : On dit à TS de se taire sur cette ligne spécifique
  const persistence = AuthModule.getReactNativePersistence(ReactNativeAsyncStorage);

  auth = AuthModule.initializeAuth(app, {
    persistence: persistence
  });
} catch (e) {
  // Si ça échoue, on utilise la méthode standard (Web)
  console.log("Persistence failed or not available, fallback to getAuth");
  auth = AuthModule.getAuth(app);
}

// 4. Initialiser la DB
const db = getFirestore(app);

// 5. On exporte. Maintenant 'auth' est garanti d'être défini.
export { auth, db };