import { useState, useEffect } from "react";
import {
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut as firebaseSignOut,
  User,
} from "firebase/auth";
import { auth } from "@/core/firebase/firebaseClient";
import { syncFirebaseWithSupabase } from "@/core/auth/firebaseSupabaseSync";

export interface UseHybridAuthReturn {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<any>;
  logout: () => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

export function useHybridAuth(): UseHybridAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Legacy login method (kept for compatibility)
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      console.log("Legacy login not implemented - use Google Sign-In");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Legacy register method (kept for compatibility)
  const register = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      console.log("Legacy register not implemented - use Google Sign-In");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async (): Promise<any> => {
    try {
      setLoading(true);
      setError(null);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const loggedUser = result.user;
      setUser(loggedUser);
      setIsAuthenticated(true);
      await syncFirebaseWithSupabase();
      console.log("✅ Usuario autenticado con Google:", loggedUser.email);
      return loggedUser;
    } catch (error: any) {
      console.warn("❌ Error al iniciar sesión con Google:", error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setIsAuthenticated(false);
      console.log("👋 Sesión cerrada.");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  // Alias for logout to maintain compatibility
  const signOut = logout;

  const clearError = () => setError(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setIsAuthenticated(!!firebaseUser);
      setIsLoading(false);
      if (firebaseUser) await syncFirebaseWithSupabase();
    });
    return () => unsubscribe();
  }, []);

  return {
    user,
    isAuthenticated,
    isLoading,
    loading,
    error,
    login,
    register,
    signInWithGoogle,
    logout,
    signOut,
    clearError,
  };
}
