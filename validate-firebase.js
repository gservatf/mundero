// validate-firebase.js
import { initializeApp } from "firebase/app";

// Carga la configuración base directamente
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "AIzaSyDH36xJWH3Xxmv7BsIrrHHP9ts3EOmOtK0",
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "mundero360.firebaseapp.com",
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || "mundero360",
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || "mundero360.appspot.com",
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "599385299146",
  appId: process.env.VITE_FIREBASE_APP_ID || "1:599385299146:web:2f1ac9b1cab370e6a4fc33",
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID || "G-X736D9JQGX",
};

// Validación directa sin iniciar servicios
if (!firebaseConfig.projectId) {
  console.error("❌ FALTA el projectId en firebaseConfig");
  process.exit(1);
}

try {
  const app = initializeApp(firebaseConfig);
  console.log(`✅ Firebase inicializado correctamente con projectId: ${firebaseConfig.projectId}`);
  process.exit(0);
} catch (error) {
  console.error("🔥 Error al inicializar Firebase:", error.message);
  process.exit(1);
}