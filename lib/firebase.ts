// ✅ Firebase Configuración modular y segura para Mundero v2.2.1

import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDyLnGq9zr5aBOgZx2b6HZCRaX2Z_PQp1Y",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "mundero-app.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "mundero-app",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "mundero-app.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789012:web:abc123def456",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-XXXXXXXXXX",
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const googleProvider = provider; // Alias para compatibilidad
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
