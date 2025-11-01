import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_MUNDERO_API_KEY || "AIzaSyDH36xJWH3Xxmv7BsIrrHHP9ts3EOmOtK0",
  authDomain: "mundero360.firebaseapp.com",
  projectId: "mundero360",
  storageBucket: "mundero360.firebasestorage.app",
  messagingSenderId: "599385299146",
  appId: "1:599385299146:web:2f1ac9b1cab370e6a4fc33",
  measurementId: "G-X736D9JQGX"
};

const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;