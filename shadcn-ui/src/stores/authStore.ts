import { create } from 'zustand';
import { User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoadingAuth: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoadingAuth: true,
  isLoading: true,
  
  setUser: (user) => {
    set({ 
      user, 
      isAuthenticated: !!user,
      isLoadingAuth: false,
      isLoading: false
    });
  },
  
  setLoading: (loading) => {
    set({ isLoading: loading, isLoadingAuth: loading });
  },
  
  initializeAuth: () => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      get().setUser(user);
    });
    
    return unsubscribe;
  },
}));