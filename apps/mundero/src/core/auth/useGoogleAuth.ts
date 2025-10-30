import { signInWithPopup, GoogleAuthProvider, signOut as firebaseSignOut, User } from 'firebase/auth'
import { doc, getDoc, setDoc, getFirestore } from 'firebase/firestore'
import { auth, firebaseApp } from '../firebase/firebaseClient'
import { UserProfile } from '@/types'

const db = getFirestore(firebaseApp)

interface AuthResult {
  user?: User
  profile?: UserProfile
  error?: string
}

export async function loginWithGoogle(): Promise<AuthResult> {
  try {
    const provider = new GoogleAuthProvider()
    provider.addScope('email')
    provider.addScope('profile')
    
    const result = await signInWithPopup(auth, provider)
    const user = result.user
    
    if (!user) {
      return { error: 'No se pudo obtener información del usuario' }
    }

    // Try to sync with Firestore (optional)
    try {
      const userDocRef = doc(db, 'users', user.uid)
      const existingProfile = await getDoc(userDocRef)

      if (!existingProfile.exists()) {
        const newProfile: Partial<UserProfile> = {
          email: user.email!,
          full_name: user.displayName || '',
          avatar_url: user.photoURL || '',
          username: user.email!.split('@')[0],
          skills: [],
          public_profile: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }

        await setDoc(userDocRef, newProfile)
      }
    } catch (firestoreError) {
      // Firestore sync failed, but Firebase auth succeeded
      console.warn('Firestore sync failed:', firestoreError)
    }

    return { user }
  } catch (error) {
    console.error('Login error:', error)
    return { error: error instanceof Error ? error.message : 'Error de autenticación' }
  }
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(auth)
}

export async function getCurrentUser(): Promise<AuthResult> {
  const user = auth.currentUser
  
  if (!user) {
    return { error: 'No hay usuario autenticado' }
  }

  try {
    const userDocRef = doc(db, 'users', user.uid)
    const profileDoc = await getDoc(userDocRef)
    const profile = profileDoc.exists() ? profileDoc.data() as UserProfile : undefined

    return { user, profile }
  } catch (error) {
    return { user }
  }
}