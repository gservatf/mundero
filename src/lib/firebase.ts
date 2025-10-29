// -------------------------------------------------------------
// 🌐 Firebase Configuration for MUNDERO360
// -------------------------------------------------------------
// This file initializes Firebase for the Mundero Hub ecosystem.
// It includes Authentication, Firestore, Storage, and Analytics
// with proper configuration for both local and production domains.
// -------------------------------------------------------------

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  setPersistence, 
  browserLocalPersistence 
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

// -------------------------------------------------------------
// 🔧 Firebase Configuration
// -------------------------------------------------------------
const firebaseConfig = {
  apiKey: "AIzaSyDH36xJWH3Xxmv7BsIrrHHP9ts3EOmOtK0",
  authDomain: "mundero360.firebaseapp.com",
  projectId: "mundero360",
  storageBucket: "mundero360.appspot.com", // ✅ corregido (.app → .appspot.com)
  messagingSenderId: "599385299146",
  appId: "1:599385299146:web:2f1ac9b1cab370e6a4fc33",
  measurementId: "G-X736D9JQGX"
};

// -------------------------------------------------------------
// 🚀 Initialize Firebase App
// -------------------------------------------------------------
const app = initializeApp(firebaseConfig);

// -------------------------------------------------------------
// 🔐 Authentication Setup
// -------------------------------------------------------------
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Optional: persist session between reloads
setPersistence(auth, browserLocalPersistence).catch((err) => {
  console.warn("[Firebase Auth] Persistence not set:", err);
});

// -------------------------------------------------------------
// 🧠 Firestore Database
// -------------------------------------------------------------
export const db = getFirestore(app);

// -------------------------------------------------------------
// ☁️ Cloud Storage
// -------------------------------------------------------------
export const storage = getStorage(app);

// -------------------------------------------------------------
// 📊 Analytics (only load in browser)
// -------------------------------------------------------------
let analytics: ReturnType<typeof getAnalytics> | null = null;

if (typeof window !== "undefined") {
  isSupported()
    .then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
        console.log("[Firebase] Analytics initialized for Mundero360");
      } else {
        console.warn("[Firebase] Analytics not supported in this environment");
      }
    })
    .catch((err) => console.error("[Firebase] Analytics init error:", err));
}

export { analytics };

// -------------------------------------------------------------
// ✅ Default Export
// -------------------------------------------------------------
export default app;
