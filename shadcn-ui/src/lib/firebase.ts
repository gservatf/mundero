import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDyLnGq9zr5aBOgZx2b6HZCRaX2Z_PQp1Y",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "mundero-app.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "mundero-app",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789012:web:abc123def456",
};

// Firebase configuration loaded with fallback values for projectId
// All required values now have defaults

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
