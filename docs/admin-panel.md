# Panel Administrativo MUNDERO

## Descripción General

El Panel Administrativo de MUNDERO es un sistema centralizado para gestionar usuarios, empresas, referidos, comisiones, integraciones, seguridad y métricas del ecosistema empresarial.

## Características Principales

### 🎯 Acceso y Permisos

- **Ruta principal**: `/admin`
- **Autenticación**: Firebase Auth (Google SSO)
- **Roles con acceso**: admin, super_admin, auditor, soporte, dev
- **Validación**: Campo "role" en documento de usuario en Firestore

### 🏗️ Arquitectura del Módulo

```
/src/modules/admin-panel/
├── components/          # Componentes específicos del admin
├── pages/              # Páginas principales del panel
├── hooks/              # Hooks personalizados (useAdminAuth)
├── services/           # Servicios Firebase (adminFirebase.ts)
├── layout/             # Layout específico (AdminLayout.tsx)
├── index.ts            # Exportaciones del módulo
└── README.md           # Documentación del módulo
```

## 📊 Pestañas del Panel

### 1️⃣ Dashboard General (`/admin`)

- **Métricas principales**: Total usuarios, empresas activas, apps integradas, comisiones
- **Actividad en tiempo real**: Logs y alertas del sistema
- **Estado del sistema**: Firebase Auth, Firestore, Storage
- **Acciones rápidas**: Enlaces directos a secciones importantes

### 2️⃣ Usuarios y Roles (`/admin/users`)

- **Gestión completa**: Ver, filtrar, buscar usuarios
- **Edición de roles**: admin, manager, analyst, affiliate, client
- **Control de estado**: Suspender/reactivar usuarios
- **Exportación**: CSV con datos completos
- **Búsqueda avanzada**: Por email, nombre, empresa, país

### 3️⃣ Empresas y Perfiles (`/admin/companies`)

- **Validación**: Aprobar/rechazar empresas registradas
- **Gestión de logos**: Upload a Firebase Storage
- **Estados**: Pendiente, Aprobada, Rechazada
- **Datos completos**: RUC, razón social, sector, país, contacto

### 4️⃣ API Manager (`/admin/apps`)

- **Registro de apps**: Nuevas integraciones
- **Gestión de API keys**: Generación automática con Firebase
- **Control de scopes**: read, write, report
- **Monitoreo**: Logs de errores y conexiones

### 5️⃣ Referidos y Comisiones (`/admin/referrals`)

- **Sistema de referidos**: Tracking completo
- **Gestión de comisiones**: Aprobar/pagar comisiones
- **Estados**: Pendiente, Aprobada, Pagada
- **Exportación**: PDF/Excel con datos de Firestore

### 6️⃣ Sistema CRM (`/admin/leads`)

- **Pipeline completo**: Nuevo → Contactado → Negociación → Cierre
- **Asignación**: Responsables por lead
- **Alertas automáticas**: Realtime Database
- **Vencimiento**: Cloud Functions (>30 días inactivo)

### 7️⃣ Seguridad y Auditoría (`/admin/security`)

- **Monitoreo**: Sesiones e IPs sospechosas
- **Logs de seguridad**: Intentos fallidos, tokens inválidos
- **Alertas**: Notificaciones automáticas
- **Acceso**: Solo super_admin

### 8️⃣ Configuración Global (`/admin/config`)

- **Branding**: Logo, colores, dominio
- **Políticas**: Registro automático/manual
- **Módulos**: Activar/desactivar funcionalidades
- **Backup**: Export JSON a Storage

### 9️⃣ Notificaciones (`/admin/notifications`)

- **Automáticas**: Nuevo usuario, empresa pendiente, error API
- **Manuales**: Por rol, país o empresa
- **Push**: Firebase Messaging

### 🔟 Métricas y Analítica (`/admin/analytics`)

- **Dashboards**: Usuarios activos, nuevas empresas, comisiones
- **Visualización**: Recharts para gráficos
- **Predicciones**: Firebase ML o TensorFlow Lite

## 🔐 Sistema de Permisos

| Rol         | Dashboard | Usuarios | Empresas | Apps | Referidos | Leads | Seguridad | Config | Notif | Analytics |
| ----------- | --------- | -------- | -------- | ---- | --------- | ----- | --------- | ------ | ----- | --------- |
| super_admin | ✅        | ✅       | ✅       | ✅   | ✅        | ✅    | ✅        | ✅     | ✅    | ✅        |
| admin       | ✅        | ✅       | ✅       | ✅   | ✅        | ✅    | ❌        | ❌     | ✅    | ✅        |
| auditor     | ✅        | ❌       | ❌       | ❌   | ❌        | ❌    | ✅        | ❌     | ❌    | ✅        |
| soporte     | ✅        | ✅       | ❌       | ❌   | ❌        | ❌    | ❌        | ❌     | ✅    | ❌        |
| dev         | ✅        | ❌       | ❌       | ✅   | ❌        | ❌    | ❌        | ❌     | ❌    | ❌        |

## 🗄️ Colecciones Firebase

### Firestore Collections

- `/users` - Usuarios del sistema
- `/companies` - Empresas registradas
- `/apps` - Aplicaciones integradas
- `/referrals` - Sistema de referidos
- `/commissions` - Comisiones generadas
- `/leads` - Pipeline CRM
- `/notifications` - Notificaciones
- `/logs` - Logs del sistema
- `/sessions` - Sesiones activas
- `/config` - Configuración global

### Storage Paths

- `logos/` - Logos de empresas
- `backups/` - Respaldos del sistema
- `docs/` - Documentos varios

### Realtime Database

- `/logs/` - Logs en tiempo real
- `/alerts/` - Alertas del sistema
- `/notifications/` - Notificaciones push

## 🚀 Funcionalidades Transversales

### Buscador Global

- Multi-colección Firestore
- Búsqueda por usuario, empresa, app o ID
- Resultados en tiempo real

### Exportación de Datos

- CSV para tablas
- Excel para reportes complejos
- PDF para documentos oficiales

### Modo Oscuro/Claro

- Persistencia en localStorage
- Aplicación automática en toda la interfaz

### Logs en Tiempo Real

- Realtime Database para actividad instantánea
- Notificaciones push automáticas
- Alertas de seguridad

### API Tester Embebido

- Pruebas de conectividad
- Validación de API keys
- Logs de errores automáticos

## 🛠️ Tecnologías Utilizadas

- **Frontend**: React + TypeScript
- **UI**: Tailwind CSS + shadcn/ui
- **Backend**: Firebase (Auth, Firestore, Storage, Realtime DB)
- **Routing**: React Router v6
- **Icons**: React Icons (Feather)
- **Charts**: Recharts (para analítica)
- **Estado**: React Hooks + Context

## 🔧 Configuración e Instalación

### Prerrequisitos

- Proyecto Firebase configurado
- Variables de entorno en `.env`
- Colecciones Firestore creadas
- Reglas de seguridad configuradas

### Integración

El módulo se integra automáticamente con:

- Sistema de autenticación existente (`useAuth`)
- Configuración Firebase (`lib/firebase.ts`)
- Componentes UI base (`components/ui/`)

## 📈 Métricas y Monitoreo

### KPIs Principales

- Usuarios activos diarios/mensuales
- Empresas registradas vs aprobadas
- Comisiones generadas y pagadas
- Uptime de APIs integradas
- Alertas de seguridad

### Alertas Automáticas

- Nuevo usuario registrado
- Empresa pendiente de aprobación
- Error en API externa
- Comisión lista para pago
- Actividad sospechosa detectada

## 🔒 Seguridad

### Validaciones

- Autenticación obligatoria para acceso
- Verificación de roles en cada ruta
- Sanitización de inputs
- Validación de permisos por acción

### Auditoría

- Log de todas las acciones administrativas
- Tracking de cambios en datos críticos
- Monitoreo de accesos sospechosos
- Backup automático de configuraciones

## 🚀 Roadmap

### Fase 1 (Actual)

- ✅ Dashboard principal
- ✅ Gestión de usuarios
- ✅ Gestión de empresas
- 🔄 API Manager
- 🔄 Sistema de referidos

### Fase 2 (Próxima)

- 📋 CRM completo
- 📋 Seguridad avanzada
- 📋 Analítica predictiva
- 📋 Notificaciones push

### Fase 3 (Futuro)

- 📋 Integración con WhatsApp Business
- 📋 Reportes automáticos
- 📋 Dashboard móvil
- 📋 API pública para terceros

---

**Desarrollado para el Grupo Servat - MUNDERO Hub**  
_Panel administrativo 100% Firebase Native_
