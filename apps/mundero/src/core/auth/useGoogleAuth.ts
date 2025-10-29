import { signInWithPopup, GoogleAuthProvider, signOut as firebaseSignOut, User } from 'firebase/auth'
import { supabase } from '../supabase/supabaseClient'
import { auth } from '../firebase/firebaseClient'
import { UserProfile } from '@/types'

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

    // Try to sync with Supabase (optional)
    try {
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('email', user.email)
        .single()

      if (!existingProfile) {
        const newProfile: Partial<UserProfile> = {
          email: user.email!,
          full_name: user.displayName || '',
          avatar_url: user.photoURL || '',
          username: user.email!.split('@')[0],
          skills: [],
          public_profile: true
        }

        await supabase
          .from('user_profiles')
          .insert([newProfile])
      }
    } catch (supabaseError) {
      // Supabase sync failed, but Firebase auth succeeded
      console.warn('Supabase sync failed:', supabaseError)
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
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('email', user.email)
      .single()

    return { user, profile: profile || undefined }
  } catch (error) {
    return { user }
  }
}