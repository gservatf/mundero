import { useState, useEffect } from 'react';
import { User as FirebaseUser, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import toast from 'react-hot-toast';

export interface UserProfile {
  id: string;
  email: string;
  display_name: string;
  photo_url: string;
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
  status: 'active' | 'inactive';
  provider: string;
  email_verified: boolean;
  created_at: string;
  integrations_access: string[];
}

export const useAuth = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Escuchar cambios en Firebase Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        // Crear perfil basado en Firebase Auth únicamente
        const userProfile: UserProfile = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          display_name: firebaseUser.displayName || 'Usuario',
          photo_url: firebaseUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(firebaseUser.displayName || 'Usuario')}&background=3b82f6&color=fff`,
          role: firebaseUser.email === 'gservat@angloamericana.edu.pe' ? 'SUPER_ADMIN' : 'USER',
          status: 'active',
          provider: 'google',
          email_verified: firebaseUser.emailVerified,
          created_at: new Date().toISOString(),
          integrations_access: firebaseUser.email === 'gservat@angloamericana.edu.pe' ? ['legalty', 'we-consulting'] : []
        };
        
        setUser(userProfile);
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      
      toast.success(`¡Bienvenido ${result.user.displayName}!`);
      
      return result.user;
    } catch (error: any) {
      console.error('Error en autenticación con Google:', error);
      
      // Manejo específico de errores
      if (error.code === 'auth/unauthorized-domain') {
        toast.error('Dominio no autorizado. Contacta al administrador.');
      } else if (error.code === 'auth/popup-blocked') {
        toast.error('Popup bloqueado. Permite popups para este sitio.');
      } else if (error.code === 'auth/cancelled-popup-request') {
        toast.error('Inicio de sesión cancelado.');
      } else {
        toast.error('Error al iniciar sesión con Google');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setFirebaseUser(null);
      toast.success('Sesión cerrada correctamente');
    } catch (error: any) {
      console.error('Error al cerrar sesión:', error);
      toast.error('Error al cerrar sesión');
    }
  };

  return {
    user,
    firebaseUser,
    loading,
    signInWithGoogle,
    loginWithGoogle: signInWithGoogle, // Alias para compatibilidad
    logout,
    isAuthenticated: !!user,
    isSuperAdmin: user?.role === 'SUPER_ADMIN',
    isAdmin: user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN'
  };
};