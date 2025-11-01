import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDyLnGq9zr5aBOgZx2b6HZCRaX2Z_PQp1Y",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "mundero-app.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "mundero-app",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "mundero-app.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789012:web:abc123def456",
};

// Firebase configuration loaded with fallback values for projectId
// All required values now have defaults

// 🧩 Inicialización segura — evita duplicados
const firebaseApp =
  getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// 🧠 Autenticación
export const auth = getAuth(firebaseApp);
export default firebaseApp;

// 🔍 Log en modo desarrollo
if (import.meta.env.DEV) {
  console.log("🔥 Firebase Config Loaded:", {
    projectId: firebaseConfig.projectId,
    authDomain: firebaseConfig.authDomain,
    apiKey: firebaseConfig.apiKey
      ? `${firebaseConfig.apiKey.substring(0, 12)}...`
      : "NOT_LOADED",
  });
  console.log("✅ Firebase App initialized safely (no duplicates)");
}
