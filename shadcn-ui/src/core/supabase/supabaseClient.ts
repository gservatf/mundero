import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are required",
  );
}

// Debug: Log Supabase connection in development only
if (import.meta.env.DEV) {
  console.log("🔧 Supabase Client Initialized");
  console.log("URL:", supabaseUrl);
  console.log(
    "Key:",
    supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : "NOT_LOADED",
  );
  console.log("✅ Conexión establecida correctamente");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// ✅ Actualizado con todos los campos de tu tabla real
export interface UserProfile {
  id: string; // UUID interno de Supabase
  auth_user_id: string; // UID de Firebase
  email: string;
  full_name: string | null;
  role: "admin" | "analyst" | "lawyer" | "client" | "pending";
  company_id?: string | null;
  avatar_url?: string | null;
  phone?: string | null;
  position?: string | null;
  department?: string | null;
  is_active?: boolean;
  last_login?: string | null;
  preferences?: Record<string, any> | null;
  created_at?: string;
  updated_at?: string;
  is_approved?: boolean;
}

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: UserProfile;
        Insert: Omit<UserProfile, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<UserProfile, "id" | "created_at" | "updated_at">>;
      };
    };
  };
}

export default supabase;
