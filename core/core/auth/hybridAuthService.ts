import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";
import { auth } from "../firebase/firebaseClient";
import { supabase } from "../supabase/supabaseClient";
import { syncFirebaseWithSupabase } from "./firebaseSupabaseSync";

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface UserProfile {
  id: string;
  auth_user_id: string;
  email: string;
  full_name: string | null;
  role: string;
  created_at: string;
  updated_at: string;
  metadata: Record<string, any> | null;
}

class HybridAuthService {
  private authStateListeners: ((user: AuthUser | null) => void)[] = [];

  constructor() {
    this.initAuthListener();
  }

  private initAuthListener() {
    onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // Sincronizar con Supabase inmediatamente después del login
        await syncFirebaseWithSupabase();
        console.log("Sesión híbrida lista");

        const authUser: AuthUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        };
        this.notifyAuthStateChange(authUser);
      } else {
        // Cerrar sesión en Supabase también
        await supabase.auth.signOut();
        this.notifyAuthStateChange(null);
      }
    });
  }

  private notifyAuthStateChange(user: AuthUser | null) {
    this.authStateListeners.forEach((listener) => listener(user));
  }

  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    this.authStateListeners.push(callback);
    return () => {
      const index = this.authStateListeners.indexOf(callback);
      if (index > -1) {
        this.authStateListeners.splice(index, 1);
      }
    };
  }

  async signIn(email: string, password: string): Promise<AuthUser> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );

      // La sincronización se ejecutará automáticamente en onAuthStateChanged

      return {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName,
        photoURL: userCredential.user.photoURL,
      };
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async signUp(
    email: string,
    password: string,
    fullName?: string,
  ): Promise<AuthUser> {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      // La sincronización se ejecutará automáticamente en onAuthStateChanged

      // Crear perfil en Supabase después de la sincronización
      setTimeout(async () => {
        await this.createUserProfile(userCredential.user.uid, email, fullName);
      }, 1000); // Pequeño delay para asegurar que la sincronización se complete

      return {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName,
        photoURL: userCredential.user.photoURL,
      };
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async signOut(): Promise<void> {
    try {
      await firebaseSignOut(auth);
      await supabase.auth.signOut();
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  getCurrentUser(): AuthUser | null {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) return null;

    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
    };
  }

  private async createUserProfile(
    authUserId: string,
    email: string,
    fullName?: string,
  ): Promise<void> {
    try {
      const { error } = await supabase.from("user_profiles").insert({
        auth_user_id: authUserId,
        email: email,
        full_name: fullName || null,
        role: "user",
        metadata: {},
      });

      if (error) {
        console.error("Error creando perfil de usuario:", error);
      } else {
        console.log("✅ Perfil de usuario creado exitosamente");
      }
    } catch (error) {
      console.error("Error general creando perfil:", error);
    }
  }

  async getUserProfile(authUserId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("auth_user_id", authUserId)
        .single();

      if (error) {
        console.error("Error obteniendo perfil de usuario:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error general obteniendo perfil:", error);
      return null;
    }
  }

  async updateUserProfile(
    authUserId: string,
    updates: Partial<UserProfile>,
  ): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("auth_user_id", authUserId)
        .select()
        .single();

      if (error) {
        console.error("Error actualizando perfil de usuario:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error general actualizando perfil:", error);
      return null;
    }
  }
}

export const hybridAuthService = new HybridAuthService();
