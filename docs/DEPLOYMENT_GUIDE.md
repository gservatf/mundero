# 🚀 Guía de Deployment - MUNDERO Hub

## 📋 Preparación para Deployment

### Prerrequisitos

- ✅ Proyecto construido sin errores (`pnpm build`)
- ✅ Lint pasando sin warnings (`pnpm run lint`)
- ✅ Variables de entorno configuradas
- ✅ Firebase proyecto configurado
- ✅ Dominio configurado (opcional)

## 🔧 Configuración de Variables de Entorno

### 1. Crear Proyecto Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un nuevo proyecto o usa uno existente
3. Habilita **Authentication** > **Google Sign-in**
4. Copia la configuración del proyecto

### 2. Variables Requeridas

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

## 🌐 Deployment en Vercel (Recomendado)

### Opción A: Deployment Automático desde GitHub

#### 1. Conectar Repositorio

1. Ve a [vercel.com](https://vercel.com) y crea una cuenta
2. Haz clic en **"New Project"**
3. Conecta tu repositorio de GitHub
4. Selecciona el repositorio `mundero-hub`

#### 2. Configurar Build Settings

Vercel detectará automáticamente:

- **Framework Preset**: Vite
- **Build Command**: `pnpm build`
- **Output Directory**: `dist`
- **Install Command**: `pnpm install`

#### 3. Configurar Variables de Entorno

1. En el dashboard de Vercel, ve a **Settings** > **Environment Variables**
2. Agrega cada variable de Firebase:
   ```
   VITE_FIREBASE_API_KEY = tu_api_key
   VITE_FIREBASE_AUTH_DOMAIN = tu_proyecto.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID = tu_proyecto_id
   VITE_FIREBASE_STORAGE_BUCKET = tu_proyecto.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID = 123456789
   VITE_FIREBASE_APP_ID = 1:123456789:web:abcdef123456
   ```

#### 4. Deploy

1. Haz clic en **"Deploy"**
2. Espera a que termine el build (2-3 minutos)
3. Tu aplicación estará disponible en `https://tu-proyecto.vercel.app`

### Opción B: Deployment Manual con CLI

#### 1. Instalar Vercel CLI

```bash
npm i -g vercel
```

#### 2. Login y Deploy

```bash
# Login en Vercel
vercel login

# Deploy a producción
vercel --prod

# Seguir las instrucciones en pantalla
```

#### 3. Configurar Variables de Entorno

```bash
# Agregar variables una por una
vercel env add VITE_FIREBASE_API_KEY production
vercel env add VITE_FIREBASE_AUTH_DOMAIN production
# ... repetir para todas las variables

# O usar archivo .env
vercel env pull .env.production
```

### Configuración Avanzada Vercel

#### Custom Domain

1. En Vercel Dashboard > **Settings** > **Domains**
2. Agregar dominio personalizado: `hub.mundero.net`
3. Configurar DNS según instrucciones de Vercel
4. Esperar propagación DNS (24-48 horas)

#### Performance Optimization

```json
// vercel.json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

## 🌊 Deployment en Netlify

### Opción A: Drag & Drop Deployment

#### 1. Build Local

```bash
pnpm build
```

#### 2. Deploy Manual

1. Ve a [netlify.com](https://netlify.com) y crea cuenta
2. Arrastra la carpeta `dist/` al área de deployment
3. Tu sitio estará disponible en un subdominio aleatorio

#### 3. Configurar Variables de Entorno

1. Ve a **Site Settings** > **Environment Variables**
2. Agrega todas las variables de Firebase
3. Redeploy el sitio

### Opción B: Git-based Deployment

#### 1. Conectar Repositorio

1. En Netlify, haz clic en **"New site from Git"**
2. Conecta GitHub y selecciona tu repositorio
3. Configura build settings:
   - **Build Command**: `pnpm build`
   - **Publish Directory**: `dist`

#### 2. Deploy Automático

- Cada push a `main` triggereará un nuevo deployment
- Build logs disponibles en tiempo real
- Rollback automático si el build falla

### Opción C: Netlify CLI

#### 1. Instalar CLI

```bash
npm install -g netlify-cli
```

#### 2. Login y Deploy

```bash
# Login
netlify login

# Deploy draft
netlify deploy

# Deploy a producción
netlify deploy --prod --dir=dist
```

### Configuración Avanzada Netlify

#### Custom Domain

1. **Site Settings** > **Domain Management**
2. **Add Custom Domain**: `hub.mundero.net`
3. Configurar DNS records según instrucciones
4. SSL automático con Let's Encrypt

#### Redirects y Headers

```toml
# netlify.toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

## 🔥 Configuración Firebase para Producción

### 1. Dominios Autorizados

En Firebase Console > **Authentication** > **Settings** > **Authorized Domains**:

- Agregar dominio de producción: `hub.mundero.net`
- Agregar dominio de Vercel: `tu-proyecto.vercel.app`
- Mantener `localhost` para desarrollo

### 2. Configuración de Seguridad

```javascript
// Reglas de seguridad recomendadas
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    }
  }
}
```

### 3. Monitoring y Analytics

1. Habilitar **Firebase Analytics**
2. Configurar **Performance Monitoring**
3. Activar **Crashlytics** (opcional)

## 📊 Verificación Post-Deployment

### 1. Checklist Funcional

- ✅ Página carga correctamente
- ✅ Login con Google funciona
- ✅ Dashboard se muestra después del login
- ✅ Panel de administración accesible (Super Admin)
- ✅ Upload de logo funciona
- ✅ Configuración SEO se guarda
- ✅ Gestión de usuarios operativa

### 2. Performance Testing

```bash
# Lighthouse audit
npx lighthouse https://hub.mundero.net --output html

# Métricas esperadas:
# Performance: 90+
# Accessibility: 95+
# Best Practices: 95+
# SEO: 90+
```

### 3. SEO Verification

- ✅ Meta tags se cargan correctamente
- ✅ Open Graph funciona en redes sociales
- ✅ Twitter Cards se muestran
- ✅ Structured Data válido

### 4. Security Testing

- ✅ HTTPS habilitado
- ✅ Headers de seguridad configurados
- ✅ Firebase Auth funcionando
- ✅ Roles y permisos correctos

## 🔧 Troubleshooting Deployment

### Errores Comunes

#### Build Failure

```bash
# Error: "Module not found"
# Solución:
rm -rf node_modules .vite
pnpm install
pnpm build
```

#### Firebase Auth Error

```
Error: Firebase: Error (auth/unauthorized-domain)
Solución: Agregar dominio a Firebase Console > Authorized Domains
```

#### Environment Variables Not Working

```bash
# Verificar que las variables empiecen con VITE_
# Ejemplo correcto:
VITE_FIREBASE_API_KEY=tu_key

# Ejemplo incorrecto:
FIREBASE_API_KEY=tu_key
```

#### 404 on Page Refresh

```bash
# Configurar redirects para SPA
# Vercel: automático con vercel.json
# Netlify: configurar en netlify.toml
```

### Logs y Debugging

#### Vercel Logs

```bash
# Ver logs en tiempo real
vercel logs

# Ver logs específicos
vercel logs --follow
```

#### Netlify Logs

1. Dashboard > **Site** > **Functions** > **Logs**
2. Build logs disponibles en cada deployment
3. Real-time logs durante el build

## 🚀 CI/CD Pipeline (Avanzado)

### GitHub Actions para Vercel

```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "18"
      - run: npm install -g pnpm
      - run: pnpm install
      - run: pnpm build
      - run: pnpm run lint
      - uses: vercel/action@v1
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

### GitHub Actions para Netlify

```yaml
# .github/workflows/netlify.yml
name: Deploy to Netlify
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install -g pnpm
      - run: pnpm install
      - run: pnpm build
      - uses: netlify/actions/cli@master
        with:
          args: deploy --prod --dir=dist
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

## 📈 Monitoring y Mantenimiento

### 1. Uptime Monitoring

- **UptimeRobot**: Monitoring gratuito cada 5 minutos
- **Pingdom**: Monitoring avanzado con alertas
- **StatusPage**: Página de estado público

### 2. Error Tracking

```typescript
// Sentry integration
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: process.env.VITE_SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

### 3. Analytics

```typescript
// Google Analytics 4
import { gtag } from "ga-gtag";

gtag("config", process.env.VITE_GA_MEASUREMENT_ID);
```

### 4. Performance Monitoring

- **Web Vitals**: Core Web Vitals tracking
- **Firebase Performance**: Real user monitoring
- **Lighthouse CI**: Automated performance testing

## 🔄 Rollback Strategy

### Vercel Rollback

1. Dashboard > **Deployments**
2. Seleccionar deployment anterior
3. **Promote to Production**

### Netlify Rollback

1. **Site Overview** > **Production Deploys**
2. Seleccionar deployment anterior
3. **Publish Deploy**

### Git-based Rollback

```bash
# Rollback a commit anterior
git revert HEAD
git push origin main

# O rollback a commit específico
git reset --hard commit_hash
git push --force origin main
```

## 📚 Recursos Adicionales

### Documentación Oficial

- [Vercel Documentation](https://vercel.com/docs)
- [Netlify Documentation](https://docs.netlify.com/)
- [Firebase Hosting](https://firebase.google.com/docs/hosting)

### Herramientas Útiles

- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [WebPageTest](https://www.webpagetest.org/)
- [GTmetrix](https://gtmetrix.com/)

### Comunidad y Soporte

- [Vercel Discord](https://vercel.com/discord)
- [Netlify Community](https://community.netlify.com/)
- [Firebase Support](https://firebase.google.com/support)

---

**Última actualización**: 28 de Octubre, 2024
**Versión**: 2.1.0
**Mantenido por**: Equipo MUNDERO
