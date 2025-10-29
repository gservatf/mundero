# LEGALITY360° - Sistema Híbrido Firebase + Supabase - MVP Implementation

## Core Files to Create:

### 1. Configuration & Environment
- `.env` - Variables de entorno para Firebase y Supabase
- `src/core/firebase/firebaseClient.ts` - Cliente Firebase Auth
- `src/core/supabase/supabaseClient.ts` - Cliente Supabase

### 2. Core Services
- `src/core/auth/hybridAuthService.ts` - Servicio híbrido principal
- `src/core/profile/hybridProfile.ts` - Gestión de perfiles Supabase
- `src/core/store/auth.store.ts` - Store Zustand para estado auth

### 3. Features & UI
- `src/features/auth/hooks/useAuth.ts` - Hook personalizado auth
- `src/features/auth/pages/LoginPage.tsx` - Página login con glassmorphism
- `src/features/auth/pages/RegisterPage.tsx` - Página registro
- `src/features/auth/pages/ResetPasswordPage.tsx` - Recuperación contraseña

### 4. Dependencies to Add:
- firebase
- @supabase/supabase-js
- zustand

### 5. Implementation Flow:
1. Setup environment variables
2. Configure Firebase and Supabase clients
3. Create hybrid auth service with sync logic
4. Implement profile management
5. Create Zustand store
6. Build auth hook
7. Design auth pages with modern UI
8. Update routing and main app

### 6. Key Features:
- Firebase Auth (email/password, reset)
- Supabase user_profiles table sync
- Role-based access with fallback
- Modern glassmorphism UI
- Error handling and loading states