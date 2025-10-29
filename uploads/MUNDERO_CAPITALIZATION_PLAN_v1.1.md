# 🧩 MUNDERO_CAPITALIZATION_PLAN.md
**Versión:** v1.1 — “Ecosistema Plug‑and‑Play”  
**Objetivo:** Capitalizar el auth híbrido existente (Firebase + Supabase) y montar **MUNDERO** como red profesional + portal universal de apps del Grupo Servat.

---

## 0) Resumen ejecutivo
- **No empezar de cero.** Se **encapsula** el auth actual como **Servat Core Auth** y se construye MUNDERO encima.
- **SSO con Google** (sin contraseñas) + **perfiles públicos** + **mensajería realtime** + **momentos efímeros** + **App Grid**.
- **Inyección dinámica de nuevas apps** vía manifest + API key + roles administrables.

---

## 1) Estructura de carpetas final
```
/workspace/
├─ core/
│  ├─ auth/            # Firebase + Supabase Sync (existente, movido aquí)
│  ├─ env/             # persistEnv, backups .env
│  ├─ database/        # schemas SQL, policies RLS
│  └─ utils/
└─ apps/
   ├─ mundero/         # nueva app (red profesional + portal)
   ├─ legality360/
   ├─ weconsulting/
   ├─ studio41/
   └─ pitahaya/
```

---

## 2) Consolidar Auth Core (reutilizar avance)
- Mover a `/core/auth/`: `firebaseClient.ts`, `supabaseClient.ts`, `useHybridAuth.ts`/`useGoogleAuth.ts`, `syncFirebaseWithSupabase.ts`.
- Imports: `@core/*` → alias Vite `resolve.alias`.
- `prebuild`: ejecutar `purify` + `persistEnv` (backups `.env` / `.env.local`).

```jsonc
// package.json (raíz)
{
  "scripts": {
    "purify": "node ./scripts/purifyRadixImports.js",
    "prebuild": "pnpm run purify && node ./core/env/persistEnv.js",
    "build": "tsc -b && vite build"
  }
}
```

---

## 3) Nueva app: MUNDERO (React + Vite + Tailwind + shadcn/ui)
- Crear en `/apps/mundero/` con plantilla `react-ts`.
- Dependencias: `firebase`, `supabase-js`, `react-router-dom`, `@radix-ui/react-slot`, `tailwindcss`.
- Alias Vite: `@core -> /core`

---

## 4) Login universal (Google‑only)
```ts
// /core/auth/useGoogleAuth.ts
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth"
import { supabase } from "@core/database/supabaseClient"

export async function loginWithGoogle() {
  const auth = getAuth()
  const provider = new GoogleAuthProvider()
  const { user } = await signInWithPopup(auth, provider)
  const token = await user.getIdToken(true)
  await supabase.auth.signInWithIdToken({ provider: "custom", token })
  return user
}
```

---

## 5) Base de datos (Supabase)
```sql
-- Perfiles
create table if not exists user_profiles (
  id uuid primary key references auth.users on delete cascade,
  email text unique,
  full_name text,
  avatar_url text,
  title text,
  bio text,
  location text,
  username text unique,
  skills text[],
  public_profile boolean default true,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Apps registradas en el ecosistema
create table if not exists apps (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  identifier text unique not null,  -- ej: 'legality360'
  description text,
  icon_url text,
  app_url text,
  roles text[] default '{}',        -- roles válidos de la app
  api_key_hash text,                -- hash de la API KEY asignada por el core
  version text,
  created_at timestamp default now()
);

-- Roles por usuario y app
create table if not exists user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  app_id uuid references apps(id) on delete cascade,
  role text not null,
  status text default 'approved',   -- pending|approved|revoked
  assigned_by uuid references auth.users,
  created_at timestamp default now(),
  unique (user_id, app_id)
);
```

---

## 6) Perfil profesional (+ URL pública)
- Rutas: `/u/:username`, `/profile/edit`
- Componentes: `ProfileHeader`, `ProfileAbout`, `ProfileFeed`, `ProfileEditForm`

---

## 7) Feed de publicaciones
- Tabla `posts (id, user_id, content, image_url, created_at)`
- Componente `FeedPost`, caja “Comparte tu idea/experiencia”.

---

## 8) Momentos efímeros (Estados)
- Firestore:
```
user_stories (collection)
 ┗ { userId, items: [{url, type, created_at, expires_at}] }
```
- Storage: bucket `mundero-stories` (TTL 72h).
- Cloud Function: limpia historias vencidas cada hora.

---

## 9) Mensajería en tiempo real (Firestore)
```
chats
 ┗ chatId
    ┣ members: [uid1, uid2, ...]
    ┗ messages (subcollection)
       ┗ { sender_id, text, type, file_url, timestamp, read_by[] }
```
- Reglas: solo miembros leen/escriben.
- UI: `ChatList`, `ChatWindow`, `MessageBubble`, `ChatInput`.
- Notificaciones push: FCM.

---

## 10) App Grid (portal universal)
- Componentes: `AppGrid`, `AppTile`, `AccessModal`, `RoleBadge`.
- Lógica: si el usuario tiene `user_roles` para `apps.id` → “Entrar”; si no → “Solicitar acceso”.

---

## 11) **Inyección de nuevas apps (Plug‑and‑Play)**
**Objetivo:** registrar apps externas en el core y habilitar accesos por roles, de forma dinámica.

### 11.1 Requisitos para la app hija
1. **Firebase**: registrada en el mismo proyecto (comparten Auth).
2. **Supabase**: usa `VITE_SUPABASE_URL`; no expone service role en front.
3. **Manifest JSON público** (`/servat-app.json`) con metadatos.
4. **Endpoint de salud opcional** (`/manifest` o `/health`) que retorne el manifest.
5. **Declaración de roles** que la app reconoce (ej: `["client","lawyer","admin"]`).

**Ejemplo `servat-app.json`:**
```json
{
  "name": "LEGALITY360°",
  "identifier": "legality360",
  "description": "Plataforma LegalTech para riesgos y casos",
  "icon_url": "https://cdn.servat.app/icons/legalty.png",
  "app_url": "https://legality360.app",
  "roles": ["client","lawyer","admin"],
  "version": "1.0.0"
}
```

### 11.2 Flujo de registro en el Core (Admin)
1) **Panel → “Registrar nueva app”**  
   Campo: URL del manifest (`https://app.com/servat-app.json`).
2) **Fetch & preview** del manifest en UI.
3) **Guardar** → se inserta en `apps` y se **genera API KEY** única.
4) Se muestra al admin la **API KEY** para que el equipo de la app la ponga en su `.env`:
   - `VITE_SERVAT_API_KEY=<KEY>`
5) La app hija valida acceso con el Core usando esa key + UID del usuario.

**Inserción (ejemplo pseudo‑código):**
```ts
const apiKey = generateKey()                // random + timestamp
const apiKeyHash = await bcrypt.hash(apiKey, 10)
await supabase.from('apps').insert({
  name, identifier, description, icon_url, app_url, roles, version, api_key_hash: apiKeyHash
})
// Mostrar API KEY una sola vez al admin.
```

### 11.3 Validación de acceso desde la app hija
**Hija (p.ej., Legality):**
```ts
// servatAuth.ts
export async function validateServatAccess(userId: string) {
  const res = await fetch("https://mundero.app/api/validate-access", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-servat-api-key": import.meta.env.VITE_SERVAT_API_KEY
    },
    body: JSON.stringify({ userId, appIdentifier: "legality360" })
  })
  return await res.json()  // { allowed: boolean, role?: string }
}
```

**Core:**
```ts
// /api/validate-access
import bcrypt from "bcrypt"
app.post("/api/validate-access", async (req, res) => {
  const { userId, appIdentifier } = req.body
  const apiKey = req.headers["x-servat-api-key"] as string

  const { data: appRow, error } = await supabase
    .from("apps")
    .select("id, api_key_hash")
    .eq("identifier", appIdentifier)
    .single()

  if (error || !appRow) return res.status(404).json({ allowed: false })
  const ok = await bcrypt.compare(apiKey, appRow.api_key_hash || "")
  if (!ok) return res.status(401).json({ allowed: false })

  const { data: role } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("app_id", appRow.id)
    .maybeSingle()

  return res.json({ allowed: !!role, role: role?.role ?? null })
})
```

### 11.4 Gestión de roles por Admin
- Ruta admin: `/admin/core/apps` y `/admin/core/roles`
- Componentes:
  - `AppRegistryForm` (ingreso de manifest URL, preview, alta con API KEY)
  - `AppCard` (listado de apps registradas)
  - `AppRolesManager` (asignación de roles: user → app → role)
  - `AppHealthCheck` (ping al manifest/health)

**Notas RLS / seguridad:**
- `apps.api_key_hash` **nunca** se expone al front (solo via servidor/Core).
- Endpoints Core verifican key con **bcrypt.compare** (no string plano).
- Logs de auditoría en `app_logs` (alta/baja app, cambio de roles).

### 11.5 Aparición automática en App Grid
- Al aprobar la app, el **App Grid** de MUNDERO la muestra automáticamente con `name`, `icon_url`, `app_url`.
- Si el usuario **no** tiene rol → botón: “Solicitar acceso” (genera notificación al admin).

---

## 12) Panel Admin Core
- CRUD Apps, asignación de roles, ver solicitudes, revocar accesos, rotar API KEY.
- Logs de auditoría (`app_logs`): actor, acción, timestamp, entidad.

---

## 13) CI/CD + persistencia de .env
- `core/env/persistEnv.js` copia `.env` y `.env.local` a backups antes de cada build.
- Build falla si faltan `VITE_FIREBASE_*` o `VITE_SUPABASE_*`.
- Purificador de imports Radix evita paquetes fantasma.

---

## 14) Despliegue MGX
1. Deploy Core (Auth + API).
2. Deploy `/apps/mundero/`.
3. Probar flujo: login Google → perfil → App Grid → validación acceso en app hija.

---

## 15) Checklist de aceptación (v1.1)
- [ ] Login Google operativo y sync con Supabase.
- [ ] Perfil público editable + URL `/u/:username`.
- [ ] Feed y Momentos efímeros (72h).
- [ ] Mensajería realtime 1:1.
- [ ] App Grid con apps registradas desde `apps`.
- [ ] Registro de apps por manifest + API KEY generada.
- [ ] `validate-access` funcionando (Core ↔ App hija).
- [ ] Panel admin: asignar y revocar roles.
- [ ] Backups `.env` OK + purificador Radix OK.

---

## 16) Mensaje para el equipo
> “Implementar **MUNDERO v1.1** capitalizando el Auth Core actual.  
> Activar inyección de apps por manifest + API KEY y gobernar roles desde el panel admin.  
> Sin contraseñas, solo Google. Menos fricción, más control.”
