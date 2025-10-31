import { getAuth, signInWithPopup, GoogleAuthProvider, signOut as firebaseSignOut } from 'firebase/auth'
import { supabase } from '../supabase/supabaseClient'
import { app } from '../firebase/firebaseClient'

export interface GoogleAuthResult {
  user: any
  profile?: any
  error?: string
}

export async function loginWithGoogle(): Promise<GoogleAuthResult> {
  try {
    const auth = getAuth(app)
    const provider = new GoogleAuthProvider()
    
    // Request additional scopes for profile information
    provider.addScope('profile')
    provider.addScope('email')
    
    const result = await signInWithPopup(auth, provider)
    const user = result.user
    
    if (!user) {
      throw new Error('No user returned from Google authentication')
    }

    // Get Firebase ID token
    const token = await user.getIdToken(true)
    
    // Sign in to Supabase using the Firebase token
    const { data: supabaseData, error: supabaseError } = await supabase.auth.signInWithIdToken({
      provider: 'firebase',
      token: token,
      access_token: token
    })

    if (supabaseError) {
      console.error('Supabase sign-in error:', supabaseError)
      throw supabaseError
    }

    // Create or update user profile
    const profileData = {
      id: user.uid,
      email: user.email,
      full_name: user.displayName,
      avatar_url: user.photoURL,
      username: user.email?.split('@')[0] || user.uid.substring(0, 8),
      public_profile: true
    }

    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .upsert(profileData, { 
        onConflict: 'id',
        ignoreDuplicates: false 
      })
      .select()
      .single()

    if (profileError && profileError.code !== '23505') { // Ignore unique constraint violations
      console.error('Profile creation error:', profileError)
    }

    return {
      user: user,
      profile: profile || profileData
    }
  } catch (error: any) {
    console.error('Google authentication error:', error)
    return {
      user: null,
      error: error.message || 'Authentication failed'
    }
  }
}

export async function signOut(): Promise<void> {
  try {
    const auth = getAuth(app)
    
    // Sign out from both Firebase and Supabase
    await Promise.all([
      firebaseSignOut(auth),
      supabase.auth.signOut()
    ])
  } catch (error) {
    console.error('Sign out error:', error)
    throw error
  }
}

export async function getCurrentUser() {
  const auth = getAuth(app)
  const firebaseUser = auth.currentUser
  
  if (!firebaseUser) return null

  // Get user profile from Supabase
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', firebaseUser.uid)
    .single()

  return {
    ...firebaseUser,
    profile
  }
}