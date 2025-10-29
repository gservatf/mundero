import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// 🚨 Validación de configuración
if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
  throw new Error('Missing Firebase configuration. Please check your environment variables.')
}

// 🧩 Inicialización segura — evita duplicados
const firebaseApp =
  getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)

// 🧠 Autenticación
export const auth = getAuth(firebaseApp)
export default firebaseApp

// 🔍 Log en modo desarrollo
if (import.meta.env.DEV) {
  console.log('🔥 Firebase Config Loaded:', {
    projectId: firebaseConfig.projectId,
    authDomain: firebaseConfig.authDomain,
    apiKey: firebaseConfig.apiKey ? `${firebaseConfig.apiKey.substring(0, 12)}...` : 'NOT_LOADED',
  })
  console.log('✅ Firebase App initialized safely (no duplicates)')
}
