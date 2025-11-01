# User Panel Module - MUNDERO

**Versión:** 1.0 (Octubre 2025)  
**Estado:** Desarrollo completado  
**Descripción:** Panel de usuario completo para el ecosistema profesional MUNDERO

## 📋 Propósito del Módulo

El módulo User Panel es el núcleo operativo de MUNDERO, diseñado para ser el centro de control profesional donde los usuarios gestionan su identidad, empresas, referidos, comisiones y conexiones dentro del ecosistema Grupo Servat. Funciona como un espacio profesional tipo LinkedIn pero integrado completamente con el sistema de Google (Auth, Drive, YouTube) y Firebase.

### Características principales:

- Dashboard profesional con feed tipo LinkedIn
- Gestión completa de perfil profesional
- Sistema de empresas y equipos
- Programa de referidos con contratos digitales
- Centro de leads y CRM personal
- Chat en tiempo real con Firebase
- Integración con aplicaciones del ecosistema Servat

## 🏗️ Estructura del Módulo

```
src/modules/user-panel/
├── components/           # Componentes reutilizables
├── hooks/               # Hooks personalizados (futuro)
├── pages/               # Páginas principales del panel
│   ├── Dashboard.tsx    # Dashboard principal con feed
│   ├── Profile.tsx      # Perfil profesional completo
│   ├── Companies.tsx    # Gestión de empresas
│   ├── Referrals.tsx    # Sistema de referidos y comisiones
│   ├── Applications.tsx # APP CONNECT - integración SSO
│   ├── LeadCenter.tsx   # Mini CRM personal
│   ├── Messages.tsx     # Chat Firebase Realtime
│   └── Settings.tsx     # Configuración de cuenta
├── services/            # Servicios Firebase (futuro)
├── layout/
│   └── UserPanelLayout.tsx # Layout principal con navegación
├── index.ts             # Exports principales
└── README.md           # Esta documentación
```

## 🎯 Funcionalidades Implementadas

### 1. Dashboard Principal

- **Feed profesional** tipo LinkedIn para publicaciones
- **Estadísticas** en tiempo real (empresas, referidos, comisiones, leads)
- **Acciones rápidas** para funciones principales
- **Actividad reciente** con notificaciones visuales
- **Bienvenida personalizada** con nombre del usuario

### 2. Perfil Profesional

- **Información básica** sincronizada con Google
- **Medidor de completitud** del perfil (0-100%)
- **Habilidades y competencias** editables
- **Experiencia laboral** y educación
- **Distintivos automáticos** (Usuario Verificado, Perfil Completo)
- **Sistema de validación** por campos completados

### 3. Gestión de Empresas

- **Crear empresas** con validación de RUC único
- **Roles diferenciados**: Administrador, Colaborador, Invitado
- **Información completa**: RUC, país, rubro, descripción
- **Gestión de equipos** y miembros
- **Integraciones activas** con apps del ecosistema

### 4. Sistema de Referidos y Comisiones

- **Contrato digital** obligatorio antes del primer referido
- **Gestión de referencias** con validación de RUC único
- **Estados de seguimiento**: Nuevo, Seguimiento, Cliente, Vencido
- **Vigencia automática** de 3 meses por referido
- **Tabla de comisiones** con exportación
- **Apps destino**: LEGALTY, WE CONSULTING, STUDIO41, etc.

### 5. APP CONNECT (Aplicaciones)

- **7 aplicaciones** del ecosistema Servat integradas
- **Autenticación SSO** con Google para cada app
- **Gestión de permisos** y roles por aplicación
- **Estado de conexión** en tiempo real
- **Revocación de acceso** cuando sea necesario

### 6. Centro de Leads (Mini CRM)

- **Gestión completa** de oportunidades de negocio
- **Campos estructurados**: empresa, contacto, email, teléfono, estado
- **Estados de seguimiento** con colores diferenciados
- **Fechas de seguimiento** y recordatorios
- **Vencimiento automático** después de 3 meses de inactividad

### 7. Centro de Mensajes

- **Chat en tiempo real** con Firebase Realtime Database
- **Tipos de chat**: 1:1, grupales, soporte
- **Mensajes efímeros** (eliminación automática en 72h)
- **Adjuntos por enlace** (Drive, YouTube)
- **Estados de conexión** y notificaciones

### 8. Configuración de Cuenta

- **Configuración de idioma** y región
- **Gestión de notificaciones** por categoría
- **Descarga de datos** (cumplimiento GDPR)
- **Eliminación de cuenta** con confirmación
- **Vista de apps conectadas** y permisos

## 🔧 Dependencias Técnicas

### Core Dependencies

```json
{
  "react": "^18.x",
  "typescript": "^5.x",
  "tailwindcss": "^3.x",
  "framer-motion": "^10.x",
  "react-icons": "^4.x"
}
```

### Hooks y Servicios

- **useAuth**: Hook de autenticación (NO MODIFICAR)
- **Firebase**: Firestore, Realtime Database, Auth
- **Google APIs**: Drive, YouTube (para enlaces)

### Componentes UI

- **@/components/ui/button**: Sistema de botones unificado
- **TailwindCSS**: Clases utilitarias para estilos
- **Framer Motion**: Animaciones y transiciones

## 🎨 Sistema de Diseño

### Paleta de Colores

```css
/* Colores principales */
--blue-600: #2563eb; /* Azul principal */
--blue-700: #1d4ed8; /* Azul hover */
--green-600: #16a34a; /* Verde éxito */
--yellow-600: #ca8a04; /* Amarillo advertencia */
--red-600: #dc2626; /* Rojo error */
--purple-600: #9333ea; /* Púrpura acento */
--gray-50: #f9fafb; /* Fondo claro */
--gray-900: #111827; /* Texto principal */
```

### Tipografía

- **Títulos principales**: `text-3xl font-bold text-gray-900`
- **Subtítulos**: `text-xl font-semibold text-gray-900`
- **Texto normal**: `text-gray-700`
- **Texto secundario**: `text-sm text-gray-600`
- **Texto auxiliar**: `text-xs text-gray-500`

### Componentes Estándar

```css
/* Cards principales */
.card-primary {
  @apply bg-white rounded-xl shadow-sm border border-gray-200 p-6;
}

/* Botones principales */
.btn-primary {
  @apply bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors;
}

/* Stats cards */
.stats-card {
  @apply bg-white p-6 rounded-xl shadow-sm border border-gray-200;
}
```

## 🔐 Seguridad y Autenticación

### Principios de Seguridad

- **Autenticación exclusiva** con Google SSO
- **No modificación** de configuración Firebase existente
- **Validación de permisos** por rol y empresa
- **Datos sensibles** solo en Firestore con reglas RLS

### Flujo de Autenticación

1. Usuario inicia sesión con Google
2. Firebase Auth valida credenciales
3. Se crea/actualiza perfil en Firestore
4. Se cargan permisos y roles
5. Acceso a funcionalidades según nivel

## 📱 Responsive Design

### Breakpoints

- **sm**: 640px (móviles grandes)
- **md**: 768px (tablets)
- **lg**: 1024px (desktop)
- **xl**: 1280px (desktop grande)

### Adaptaciones Móviles

- **Navegación**: Sidebar colapsable en móvil
- **Cards**: Stack vertical en pantallas pequeñas
- **Tablas**: Scroll horizontal con datos esenciales
- **Formularios**: Campos apilados verticalmente

## 🚀 Integraciones Futuras

### Firebase Services (Pendiente)

- **Firestore**: Almacenamiento de datos estructurados
- **Realtime Database**: Chat y notificaciones en tiempo real
- **Cloud Functions**: Lógica de negocio serverless
- **Storage**: Archivos y multimedia (si necesario)

### APIs Externas

- **Google Drive**: Enlaces a documentos y archivos
- **Google Calendar**: Integración de recordatorios
- **YouTube**: Enlaces a videos corporativos
- **Apps Servat**: APIs de LEGALTY, WE CONSULTING, etc.

## 📊 Métricas y Analytics

### KPIs del Usuario

- **Completitud del perfil**: Porcentaje de campos completados
- **Actividad de referidos**: Conversión y comisiones generadas
- **Engagement**: Publicaciones, likes, comentarios
- **Uso de aplicaciones**: Frecuencia de acceso a apps conectadas

### Datos para Dashboard

- **Estadísticas en tiempo real**: Empresas, referidos, leads, comisiones
- **Actividad reciente**: Últimas acciones del usuario
- **Notificaciones**: Alertas pendientes por categoría

## 🔄 Estados y Flujos

### Estados de Referidos

- **Nuevo**: Recién creado, pendiente de contacto
- **Seguimiento**: En proceso de negociación
- **Cliente**: Convertido exitosamente
- **Vencido**: Sin actividad por 3+ meses

### Estados de Leads

- **Nuevo**: Lead recién ingresado
- **Calificado**: Lead validado y con potencial
- **Seguimiento**: En proceso de nurturing
- **Cliente**: Convertido a cliente
- **Vencido**: Sin actividad prolongada

### Estados de Aplicaciones

- **Conectado**: SSO activo y permisos válidos
- **Desconectado**: Sin acceso o permisos revocados
- **Pendiente**: En proceso de conexión

## ⚠️ Limitaciones y Consideraciones

### Restricciones Técnicas

- **No modificar**: Configuración Firebase existente
- **Solo Google Auth**: No registro con email/contraseña
- **Enlaces externos**: No subida de archivos, solo enlaces Drive/YouTube
- **Mensajes efímeros**: Eliminación automática en 72h

### Consideraciones de UX

- **Carga progresiva**: Datos mock mientras se implementa Firebase
- **Estados de carga**: Skeletons y spinners apropiados
- **Manejo de errores**: Mensajes claros y acciones de recuperación
- **Accesibilidad**: Cumplimiento WCAG 2.1 AA

## 🛠️ Desarrollo y Mantenimiento

### Estructura de Datos (Firebase)

```typescript
// Estructura sugerida para Firestore
interface UserProfile {
  uid: string;
  email: string;
  display_name: string;
  photo_url: string;
  job_title?: string;
  country?: string;
  description?: string;
  skills: string[];
  created_at: Timestamp;
  updated_at: Timestamp;
}

interface Company {
  id: string;
  name: string;
  ruc: string;
  country: string;
  industry: string;
  owner_uid: string;
  members: CompanyMember[];
  created_at: Timestamp;
}

interface Referral {
  id: string;
  referrer_uid: string;
  company_ruc: string;
  contact_name: string;
  contact_email: string;
  target_app: string;
  status: "Nuevo" | "Seguimiento" | "Cliente" | "Vencido";
  created_at: Timestamp;
  expires_at: Timestamp;
}
```

### Próximos Pasos

1. **Integración Firebase**: Conectar con Firestore y Realtime Database
2. **Sistema de notificaciones**: Push notifications y alertas en tiempo real
3. **Exportación de datos**: PDF/Excel para comisiones y reportes
4. **Métricas avanzadas**: Dashboard de analytics personal
5. **Integración Calendar**: Recordatorios y seguimientos automáticos

---

**Desarrollado por el equipo Grupo Servat**  
_Panel de Usuario v1.0 - Ecosistema profesional MUNDERO_  
_Octubre 2025_
