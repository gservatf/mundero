import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

// Debug environment variables
const envDebug = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ? '✅ Present' : '❌ Missing',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ? '✅ Present' : '❌ Missing',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ? '✅ Present' : '❌ Missing',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ? '✅ Present' : '❌ Missing',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ? '✅ Present' : '❌ Missing',
  appId: import.meta.env.VITE_FIREBASE_APP_ID ? '✅ Present' : '❌ Missing',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID ? '✅ Present' : '❌ Missing',
  mode: import.meta.env.MODE,
  dev: import.meta.env.DEV
}

console.log('🔍 Environment Debug:', envDebug)

// Your web app's Firebase configuration (mundero360)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDH36xJWH3Xxmv7BsIrrHHP9ts3EOmOtK0",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "mundero360.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "mundero360",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "mundero360.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "599385299146",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:599385299146:web:2f1ac9b1cab370e6a4fc33",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-X736D9JQGX"
}

// Validate Firebase configuration
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error('❌ Firebase configuration missing! Check your .env file')
  console.error('📋 Current config:', firebaseConfig)
  throw new Error('Firebase configuration incomplete - check your .env file')
}

// Initialize Firebase
export const firebaseApp = initializeApp(firebaseConfig)
export const auth = getAuth(firebaseApp)
export const firestore = getFirestore(firebaseApp)
export const storage = getStorage(firebaseApp)

// Initialize Analytics (only in production)
let analytics = null
if (typeof window !== 'undefined' && !import.meta.env.DEV) {
  try {
    const { getAnalytics } = await import('firebase/analytics')
    analytics = getAnalytics(firebaseApp)
  } catch (error) {
    console.warn('Analytics not available:', error)
  }
}

export { analytics }

console.log('🔥 Firebase initialized successfully for project:', firebaseConfig.projectId)