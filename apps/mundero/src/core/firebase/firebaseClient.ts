import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDH36xJWH3Xxmv7BsIrrHHP9ts3EOmOtK0",
  authDomain: "mundero360.firebaseapp.com",
  projectId: "mundero360",
  storageBucket: "mundero360.appspot.com",
  messagingSenderId: "599385299146",
  appId: "1:599385299146:web:2f1ac9b1cab370e6a4fc33",
  measurementId: "G-X736D9JQGX",
};

// Prevent double initialization (important for React + Vite)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

let analytics: any = null;
isSupported().then((yes) => {
  if (yes) analytics = getAnalytics(app);
});

const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);
const storage = getStorage(app);

export { app, analytics, auth, provider, db, storage };