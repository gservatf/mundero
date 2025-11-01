import { initializeApp, getApps } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || import.meta.env.VITE_MUNDERO_API_KEY || "AIzaSyDH36xJWH3Xxmv7BsIrrHHP9ts3EOmOtK0",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "mundero360.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "mundero360",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "mundero360.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "599385299146",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:599385299146:web:2f1ac9b1cab370e6a4fc33",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-X736D9JQGX"
};

// Evitar doble inicialización
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;