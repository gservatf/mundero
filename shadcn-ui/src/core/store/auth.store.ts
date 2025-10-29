import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthUser, UserProfile } from '../auth/hybridAuthService';

interface AuthState {
  user: AuthUser | null;
  userProfile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: AuthUser | null) => void;
  setUserProfile: (profile: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      userProfile: null,
      isAuthenticated: false,
      isLoading: true,

      setUser: (user: AuthUser | null) => {
        set({ 
          user, 
          isAuthenticated: !!user,
          isLoading: false
        });
      },

      setUserProfile: (profile: UserProfile | null) => {
        set({ userProfile: profile });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      clearAuth: () => {
        set({
          user: null,
          userProfile: null,
          isAuthenticated: false,
          isLoading: false
        });
      },
    }),
    {
      name: 'legality360-auth',
      partialize: (state) => ({
        user: state.user,
        userProfile: state.userProfile,
        isAuthenticated: state.isAuthenticated
      }),
    }
  )
);