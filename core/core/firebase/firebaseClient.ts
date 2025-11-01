import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// 🔧 Configuración Firebase
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// 🧩 Validación de entorno
for (const [key, value] of Object.entries(firebaseConfig)) {
  if (!value)
    throw new Error(
      `Missing Firebase configuration: ${key}. Please check your environment variables.`,
    );
}

// 🔒 Evita duplicaciones (fix del error "app/duplicate-app")
const firebaseApp =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const firebaseAuth = getAuth(firebaseApp);

// 🧠 Debug solo en entorno de desarrollo
if (import.meta.env.DEV) {
  console.log("🔥 Firebase Config Loaded:", {
    projectId: firebaseConfig.projectId,
    authDomain: firebaseConfig.authDomain,
    apiKey: firebaseConfig.apiKey
      ? `${firebaseConfig.apiKey.substring(0, 15)}...`
      : "NOT_LOADED",
  });
  console.log(
    `✅ Firebase App initialized safely (project: ${firebaseConfig.projectId})`,
  );
}

export { firebaseApp, firebaseAuth };
export default firebaseApp;
