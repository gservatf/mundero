import { useState, useEffect } from 'react'
import { getAuth, onAuthStateChanged, User } from 'firebase/auth'
import { loginWithGoogle, signOut, getCurrentUser } from '../core/auth/useGoogleAuth'
import { firebaseApp } from '../core/firebase/firebaseClient'
import { UserProfile } from '@/types'

export interface AuthState {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  error: string | null
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
    error: null
  })

  useEffect(() => {
    const auth = getAuth(firebaseApp)
    
    console.log('🔐 Configurando auth listener...')
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('👤 Auth state changed:', user ? user.email : 'No user')
      
      if (user) {
        try {
          const currentUser = await getCurrentUser()
          setAuthState({
            user: user,
            profile: currentUser?.profile || null,
            loading: false,
            error: null
          })
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          setAuthState({
            user: user,
            profile: null,
            loading: false,
            error: errorMessage
          })
        }
      } else {
        setAuthState({
          user: null,
          profile: null,
          loading: false,
          error: null
        })
      }
    })

    return () => unsubscribe()
  }, [])

  const login = async () => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const result = await loginWithGoogle()
      
      if (result.error) {
        setAuthState(prev => ({
          ...prev,
          loading: false,
          error: result.error!
        }))
        return { success: false, error: result.error }
      }

      return { success: true }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed'
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }))
      return { success: false, error: errorMessage }
    }
  }

  const logout = async () => {
    try {
      await signOut()
      return { success: true }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Logout failed'
      setAuthState(prev => ({ ...prev, error: errorMessage }))
      return { success: false, error: errorMessage }
    }
  }

  return {
    ...authState,
    login,
    logout,
    isAuthenticated: !!authState.user
  }
}