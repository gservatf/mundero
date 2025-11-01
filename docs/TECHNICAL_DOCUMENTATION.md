# 📚 Documentación Técnica - MUNDERO Hub

## 🏗️ Arquitectura del Sistema

### Visión General

MUNDERO Hub es una aplicación Single Page Application (SPA) construida con React y TypeScript que funciona como centro de identidad empresarial. La arquitectura está diseñada para ser escalable, mantenible y segura.

```
┌─────────────────────────────────────────────────────────────┐
│                    MUNDERO Hub Frontend                     │
├─────────────────────────────────────────────────────────────┤
│  React 18.3.1 + TypeScript 5.6.2 + Tailwind CSS          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │   Landing   │ │  Dashboard  │ │    Admin    │          │
│  │    Page     │ │    Page     │ │   Settings  │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
├─────────────────────────────────────────────────────────────┤
│                Firebase Authentication                      │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │   Google    │ │    Roles    │ │   Session   │          │
│  │   Sign-In   │ │ Management  │ │ Management  │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
├─────────────────────────────────────────────────────────────┤
│                External Integrations                       │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │   Legalty   │ │     We      │ │   Future    │          │
│  │             │ │ Consulting  │ │    Apps     │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

## 🔧 Componentes Principales

### 1. Sistema de Autenticación (`hooks/useAuth.ts`)

**Propósito**: Gestionar el estado de autenticación del usuario usando Firebase Auth.

**Funcionalidades**:

- Login con Google OAuth 2.0
- Gestión de sesiones persistentes
- Manejo de roles de usuario (Super Admin, Admin, Usuario)
- Logout seguro con limpieza de estado

**Implementación**:

```typescript
interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: "super_admin" | "admin" | "user";
}

const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Implementación de login, logout, y gestión de estado
};
```

### 2. Gestión de Logo Dinámico (`hooks/useLogo.ts`)

**Propósito**: Permitir la personalización del logo desde el panel administrativo.

**Funcionalidades**:

- Carga de imágenes (PNG, JPG, SVG)
- Validación de formato y tamaño (máx. 2MB)
- Persistencia en localStorage
- Fallback al logo por defecto

**Flujo de Datos**:

```
Upload Image → Validate → Convert to Base64 → Store in localStorage → Update UI
```

### 3. Panel de Administración (`components/AdminSettings.tsx`)

**Propósito**: Interfaz de configuración para Super Administradores.

**Secciones**:

#### 3.1 Gestión de Logo

- **Upload Component**: Drag & drop con validación
- **Preview System**: Vista previa en tiempo real
- **Storage**: Persistencia en localStorage
- **Integration**: Actualización automática en toda la app

#### 3.2 Configuración SEO

- **Meta Tags Editor**: Título, descripción, keywords
- **Open Graph**: Facebook, LinkedIn optimization
- **Twitter Cards**: Twitter-specific metadata
- **Preview System**: Simulación de Google Search y redes sociales

**Estructura de Datos SEO**:

```typescript
interface SEOConfig {
  title: string;
  description: string;
  keywords: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
}
```

### 4. Landing Page (`components/GoogleOnlyAuth.tsx`)

**Propósito**: Página de entrada con autenticación y branding.

**Características**:

- **Diseño Responsivo**: Mobile-first approach
- **Animaciones**: Framer Motion para micro-interacciones
- **Branding Dinámico**: Logo personalizable desde admin
- **SEO Optimizado**: Meta tags y structured data

**Elementos Visuales**:

- Fondo con gradientes animados
- Efectos glassmorphism
- Patrones geométricos de fondo
- Botones con hover effects

### 5. Dashboard Principal (`pages/Dashboard.tsx`)

**Propósito**: Centro de control post-autenticación.

**Secciones**:

#### 5.1 Estadísticas

- Usuarios totales registrados
- Aplicaciones integradas
- Sesiones activas
- Métricas de uso

#### 5.2 Aplicaciones Integradas

- **Legalty**: Sistema legal
- **We Consulting**: Consultoría empresarial
- **Futuras integraciones**: Escalabilidad

#### 5.3 Gestión de Usuarios (Admin/Super Admin)

- Lista de usuarios registrados
- Cambio de roles
- Estado de usuarios (activo/inactivo)
- Filtros y búsqueda

## 🔐 Sistema de Seguridad

### Autenticación Firebase

**Configuración**:

```typescript
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  // ... más configuración
};
```

**Flujo de Autenticación**:

1. Usuario hace clic en "Iniciar Sesión con Google"
2. Redirección a Google OAuth
3. Google retorna token de autorización
4. Firebase valida y crea sesión
5. Aplicación recibe user object con roles
6. Redirección al dashboard correspondiente

### Gestión de Roles

**Niveles de Acceso**:

- **Super Admin**: Acceso completo (configuración, usuarios, aplicaciones)
- **Admin**: Gestión de usuarios y estadísticas
- **Usuario**: Acceso a aplicaciones integradas

**Implementación**:

```typescript
const checkPermission = (userRole: string, requiredRole: string) => {
  const roleHierarchy = {
    super_admin: 3,
    admin: 2,
    user: 1,
  };

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
};
```

## 📊 Gestión de Estado

### Estado Local (React Hooks)

**useAuth Hook**:

- Estado de usuario autenticado
- Loading states
- Error handling
- Persistencia de sesión

**useLogo Hook**:

- Logo personalizado
- Estado de carga
- Fallback management

### Persistencia de Datos

**localStorage**:

- Logo personalizado (Base64)
- Configuración SEO
- Preferencias de usuario
- Tema de la aplicación

**Estructura de Datos**:

```typescript
// localStorage keys
const STORAGE_KEYS = {
  CUSTOM_LOGO: "mundero_custom_logo",
  SEO_CONFIG: "mundero_seo_config",
  USER_PREFERENCES: "mundero_user_prefs",
  THEME: "mundero_theme",
};
```

## 🎨 Sistema de Estilos

### Tailwind CSS + Shadcn/ui

**Configuración**:

```javascript
// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        mundero: {
          primary: "#3B82F6",
          secondary: "#1E40AF",
          accent: "#F59E0B",
          dark: "#1F2937",
          light: "#F9FAFB",
        },
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "pulse-slow": "pulse 3s infinite",
      },
    },
  },
};
```

### Componentes Reutilizables

**Button Component**:

```typescript
interface ButtonProps {
  variant: "primary" | "secondary" | "outline";
  size: "sm" | "md" | "lg";
  loading?: boolean;
  children: React.ReactNode;
}
```

**Card Component**:

```typescript
interface CardProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}
```

## 🚀 Optimización de Performance

### Bundle Optimization

**Vite Configuration**:

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          firebase: ["firebase/app", "firebase/auth"],
          ui: ["@radix-ui/react-dialog", "@radix-ui/react-dropdown-menu"],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});
```

**Resultados**:

- Bundle principal: 635.25 kB
- Comprimido (gzip): 177.79 kB
- Chunks separados para mejor caching

### Lazy Loading

**Component Splitting**:

```typescript
const AdminSettings = lazy(() => import('./components/AdminSettings'));
const UserManagement = lazy(() => import('./components/UserManagement'));

// Uso con Suspense
<Suspense fallback={<LoadingSpinner />}>
  <AdminSettings />
</Suspense>
```

### Image Optimization

**Logo Management**:

- Compresión automática de imágenes
- Formatos optimizados (WebP fallback)
- Lazy loading de imágenes
- Placeholder mientras carga

## 📱 Responsive Design

### Breakpoints

```css
/* Mobile First Approach */
.container {
  @apply px-4 mx-auto;
}

/* Tablet */
@media (min-width: 768px) {
  .container {
    @apply px-6 max-w-4xl;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .container {
    @apply px-8 max-w-6xl;
  }
}
```

### Mobile Optimization

**Touch Targets**:

- Mínimo 44px para elementos interactivos
- Espaciado adecuado entre botones
- Gestos táctiles optimizados

**Performance Mobile**:

- Imágenes responsive
- Fonts optimizadas
- Reducción de JavaScript no crítico

## 🔍 SEO y Metadata

### Meta Tags Dinámicos

**Implementación**:

```typescript
const updateMetaTags = (seoConfig: SEOConfig) => {
  document.title = seoConfig.title;

  updateMetaTag("description", seoConfig.description);
  updateMetaTag("keywords", seoConfig.keywords);

  // Open Graph
  updateMetaTag("og:title", seoConfig.ogTitle);
  updateMetaTag("og:description", seoConfig.ogDescription);

  // Twitter Cards
  updateMetaTag("twitter:title", seoConfig.twitterTitle);
  updateMetaTag("twitter:description", seoConfig.twitterDescription);
};
```

### Structured Data

**Schema.org Implementation**:

```json
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "MUNDERO Hub",
  "description": "Hub de identidad empresarial",
  "url": "https://hub.mundero.net",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web Browser"
}
```

## 🧪 Testing Strategy

### Unit Tests (Futuro)

**Componentes a Testear**:

- useAuth hook
- useLogo hook
- AdminSettings component
- Authentication flow

**Testing Framework**:

```bash
# Instalación futura
pnpm add -D vitest @testing-library/react @testing-library/jest-dom
```

### E2E Tests (Futuro)

**Flujos Críticos**:

- Login/Logout flow
- Admin panel functionality
- Logo upload process
- SEO configuration

## 🚀 Deployment Pipeline

### Vercel Deployment

**Configuración**:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

### Environment Variables

**Production Setup**:

```bash
# Vercel Dashboard
VITE_FIREBASE_API_KEY=production_key
VITE_FIREBASE_AUTH_DOMAIN=mundero-hub.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=mundero-hub-prod
# ... más variables
```

### CI/CD Pipeline (Futuro)

**GitHub Actions**:

```yaml
name: Deploy to Production
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: pnpm install
      - run: pnpm build
      - run: pnpm test
      - uses: vercel/action@v1
```

## 📈 Monitoring y Analytics

### Performance Monitoring

**Métricas Clave**:

- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Cumulative Layout Shift (CLS)
- First Input Delay (FID)

### Error Tracking (Futuro)

**Sentry Integration**:

```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: process.env.VITE_SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

## 🔧 Troubleshooting

### Problemas Comunes

#### 1. Firebase Authentication Errors

**Error**: "Firebase: Error (auth/unauthorized-domain)"
**Solución**: Agregar dominio a Firebase Console > Authentication > Settings > Authorized domains

#### 2. Build Failures

**Error**: "Module not found" durante build
**Solución**:

```bash
rm -rf node_modules .vite
pnpm install
pnpm build
```

#### 3. Logo Upload Issues

**Error**: Logo no se muestra después de upload
**Solución**: Verificar formato de imagen y tamaño máximo (2MB)

#### 4. SEO Meta Tags No Actualizan

**Error**: Meta tags no se actualizan dinámicamente
**Solución**: Verificar que el componente AdminSettings esté guardando correctamente en localStorage

### Logs y Debugging

**Development Mode**:

```typescript
const DEBUG = process.env.NODE_ENV === "development";

const log = (message: string, data?: any) => {
  if (DEBUG) {
    console.log(`[MUNDERO Hub] ${message}`, data);
  }
};
```

## 📚 Referencias y Recursos

### Documentación Externa

- [React Documentation](https://react.dev/)
- [Firebase Auth Documentation](https://firebase.google.com/docs/auth)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Vite Documentation](https://vitejs.dev/)

### Herramientas de Desarrollo

- [Firebase Console](https://console.firebase.google.com/)
- [Vercel Dashboard](https://vercel.com/dashboard)
- [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)

---

**Última actualización**: 28 de Octubre, 2024
**Versión del documento**: 2.1.0
**Mantenido por**: Equipo MUNDERO
