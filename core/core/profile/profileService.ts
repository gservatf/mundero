import { supabase, type UserProfile } from "../supabase/supabaseClient";
import type { User } from "firebase/auth";

export class ProfileService {
  private static readonly STORAGE_KEY = "legality360_user_profile";

  /**
   * 🔄 Sincroniza el perfil de Firebase con Supabase
   */
  static async syncProfile(firebaseUser: User): Promise<UserProfile | null> {
    if (!firebaseUser) return this.getLocalProfile();

    const { uid, email, displayName, photoURL } = firebaseUser;

    try {
      // Buscar si ya existe perfil en Supabase (usando auth_user_id)
      const { data: existingProfile, error: fetchError } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("auth_user_id", uid)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") {
        console.error("❌ Error al buscar perfil en Supabase:", fetchError);
        return this.getLocalProfile();
      }

      // Construir datos de perfil (tipado correcto)
      const profileData = {
        auth_user_id: uid,
        email: email || "",
        full_name: displayName || "",
        avatar_url: photoURL || "",
        role: existingProfile?.role || "client",
        is_active: true,
        last_login: new Date().toISOString(),
      } as UserProfile;

      let finalProfile: UserProfile | null = null;

      if (!existingProfile) {
        // Crear nuevo perfil
        const { data: created, error: insertError } = await supabase
          .from("user_profiles")
          .insert([profileData])
          .select()
          .single();

        if (insertError) {
          console.error("❌ Error al crear perfil:", insertError);
          this.saveLocalProfile(profileData);
          return profileData;
        }

        console.log("✅ Perfil creado en Supabase para:", email);
        finalProfile = created;
      } else {
        // Actualizar perfil existente
        const { data: updated, error: updateError } = await supabase
          .from("user_profiles")
          .update(profileData)
          .eq("auth_user_id", uid)
          .select()
          .single();

        if (updateError) {
          console.error("❌ Error al actualizar perfil:", updateError);
          return existingProfile;
        }

        console.log("✅ Perfil actualizado en Supabase para:", email);
        finalProfile = updated;
      }

      // Guardar localmente
      if (finalProfile) this.saveLocalProfile(finalProfile);
      return finalProfile;
    } catch (error) {
      console.error("⚠️ Error general al sincronizar perfil:", error);
      return this.getLocalProfile();
    }
  }

  /**
   * ✏️ Actualiza el perfil en Supabase
   */
  static async updateProfile(
    userId: string,
    updates: Partial<Pick<UserProfile, "full_name" | "role">>,
  ): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .update(updates)
        .eq("auth_user_id", userId)
        .select()
        .single();

      if (error) {
        console.error("❌ Error al actualizar perfil:", error);
        return null;
      }

      this.saveLocalProfile(data);
      return data;
    } catch (error) {
      console.error("⚠️ Error al actualizar perfil:", error);
      return null;
    }
  }

  /**
   * 🔍 Obtiene perfil por auth_user_id
   */
  static async getProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("auth_user_id", userId)
        .single();

      if (error) {
        console.error("❌ Error al obtener perfil:", error);
        return this.getLocalProfile();
      }

      this.saveLocalProfile(data);
      return data;
    } catch (error) {
      console.error("⚠️ Error al obtener perfil:", error);
      return this.getLocalProfile();
    }
  }

  /**
   * 💾 Guarda perfil localmente
   */
  private static saveLocalProfile(profile: UserProfile): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(profile));
    } catch (error) {
      console.error("⚠️ Error guardando perfil local:", error);
    }
  }

  /**
   * 📦 Obtiene perfil local
   */
  private static getLocalProfile(): UserProfile | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error("⚠️ Error obteniendo perfil local:", error);
      return null;
    }
  }

  /**
   * 🧹 Limpia el perfil local
   */
  static clearLocalProfile(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error("⚠️ Error limpiando perfil local:", error);
    }
  }

  /**
   * 🧠 Roles y permisos
   */
  static isAdmin(profile: UserProfile | null): boolean {
    return profile?.role === "admin";
  }

  static isAnalyst(profile: UserProfile | null): boolean {
    return profile?.role === "analyst" || this.isAdmin(profile);
  }

  static isLawyer(profile: UserProfile | null): boolean {
    return profile?.role === "lawyer" || this.isAnalyst(profile);
  }
}

export default ProfileService;
