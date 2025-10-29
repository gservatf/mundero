# Plan de Arquitectura MUNDERO v2.1
## Hub Universal de Identidad y Acceso - Grupo Servat

### 1. Propósito General
Convertir a Mundero en el hub universal de identidad, acceso y sincronización del Grupo Servat. Todas las aplicaciones (Legalty, We Consulting, Portales, Pitahaya) consumen y devuelven datos a Mundero, quien mantiene la trazabilidad de usuarios, empresas, referidos y comisiones.

### 2. Arquitectura Base (Reforzada)
**Core Tecnológico Estable:**
- **Autenticación híbrida**: Firebase Auth (identidad principal Google SSO) + Supabase (perfiles, roles, relaciones)
- **Hooks estables**: useAuth y useHybridAuth como capa base
- **Stack Frontend**: Zustand + React 18 + Tailwind + Vite + TypeScript + Framer Motion

**Principio Clave:**
- Firebase autentica
- Supabase centraliza datos y relaciones
- Mundero orquesta sesión y permisos
- Las demás apps NO autentican directamente

### 3. Estructura Modular Consolidada

#### Core (sin cambios)
- `/core/hooks`: useAuth y useHybridAuth
- `/lib`: Firebase y Supabase config
- `/scripts`: protección y sanación de entorno

#### Módulos Funcionales Existentes
- **Autenticación**: Google SSO + Firebase + Supabase
- **Perfiles de Usuario**: Gestión completa de perfiles
- **Grid de Aplicaciones**: Visualización basada en roles
- **Mensajería**: Chat en tiempo real con Firebase

#### Nuevos Módulos Críticos
- **Panel Administrativo**: Gobernanza de accesos y aprobaciones
- **Sistema de Referidos**: Gestión y trazabilidad
- **API de Integración**: Endpoints estándar para apps externas
- **Gestión de Empresas**: Registro, roles y permisos
- **Sistema de Comisiones**: Cálculo y seguimiento

### 4. Panel Administrativo - Gobernanza Central

#### Funciones Clave:
1. **Gestión de Empresas**
   - Crear/importar empresas (RUC como identificador universal)
   - Asignar roles globales (owner, admin, analyst, referrer)
   - Ver responsables y analistas asociados

2. **Aprobación de Accesos**
   - Visualizar solicitudes usuario → empresa/aplicativo
   - Aprobar/rechazar con flujo de estados
   - Notificaciones automáticas

3. **Gestión de Aplicativos**
   - Panel de integraciones activas
   - Control de roles específicos por app
   - Activar/pausar accesos globales

4. **Auditoría y Logs**
   - Registro completo de accesos y cambios
   - Trazabilidad de aprobaciones
   - Exportación CSV/JSON

### 5. API de Integración Estándar

#### Requisitos de Autenticación:
```
POST https://mundero.app/api/auth/external-login
- Token JWT emitido por Firebase
- Validado por Supabase
- Almacenar solo user_uuid y empresa_id
```

#### Estructura BD de Integración:
```sql
CREATE TABLE mundero_sync (
  user_uuid UUID PRIMARY KEY,
  empresa_id UUID,
  rol_global TEXT,
  last_sync TIMESTAMP,
  sync_status TEXT DEFAULT 'active'
);
```

#### Webhooks Estándar:
- Encabezado: `x-mundero-signature` con HMAC-256
- Payload JSON estructurado
- Eventos: profile.updated, lead.converted, commission.paid

#### Manifest de Integración:
```json
{
  "app_name": "we_consulting",
  "version": "1.1.0",
  "base_url": "https://weconsulting.app",
  "webhooks": ["profile.updated", "lead.converted", "commission.paid"]
}
```

### 6. Flujo de Interoperabilidad

#### A. Autenticación:
1. Usuario → Google SSO en Mundero
2. Mundero → JWT temporal en Supabase
3. Apps externas → Validación token via API
4. Sincronización automática por webhooks

#### B. Flujo de Datos:
- Bidireccional por eventos, no consultas directas
- Mundero como única fuente de verdad
- Apps solo consumen/devuelven, no almacenan identidad

### 7. Fase de Validación UX/UI con Mockups

#### Objetivo:
Visualizar el flujo completo antes del desarrollo técnico final.

#### Qué se validará:
1. **Flujo de ingreso**: Google → Firebase → Supabase → Apps
2. **Navegación centralizada**: Panel, feed, apps disponibles
3. **Sistema de referidos**: Registro, acuerdos, comisiones
4. **Panel de integraciones**: Conexiones entre apps
5. **Ajustes personales**: Idioma, país, moneda, empresa

#### Herramientas:
- Mockups interactivos por módulo
- Mapa de navegación (User Flow)
- Guía visual de componentes UI
- Prototipo navegable para aprobación

#### Criterio de Cierre:
- Cada módulo validado visualmente
- Estados definidos (loading, success, error, empty)
- Aprobación del equipo antes de implementación

### 8. Fases de Implementación

#### Fase 1: Mockups y Validación UX
- [ ] Diseño de flujos de autenticación
- [ ] Panel administrativo mockup
- [ ] Sistema de referidos mockup
- [ ] API de integración mockup
- [ ] Validación y aprobación

#### Fase 2: Core Backend
- [ ] Extensión de hooks de autenticación
- [ ] API endpoints de integración
- [ ] Sistema de webhooks
- [ ] Panel administrativo backend

#### Fase 3: Frontend Avanzado
- [ ] Panel administrativo completo
- [ ] Sistema de referidos UI
- [ ] Dashboard de integraciones
- [ ] Sistema de notificaciones

#### Fase 4: Integración y Testing
- [ ] Conexión con apps existentes
- [ ] Testing de flujos completos
- [ ] Validación de seguridad
- [ ] Deploy y monitoreo

### 9. Principios de Gobernanza Técnica

1. **Mundero = Única fuente de verdad** para usuarios, empresas y referidos
2. **No repetir autenticación**: Una vez en Mundero, acceso universal
3. **Sincronización por eventos**, no consultas directas
4. **Registro formal** de toda integración nueva
5. **Trazabilidad completa** de accesos y cambios

### 10. Entregable Final

Una infraestructura viva donde:
- Usuarios entran una vez (Google → Mundero)
- Mundero orquesta accesos, datos y firmas
- Apps sincronizan automáticamente
- Roles, comisiones y referidos trazables en una sola fuente

---

## Próximos Pasos
1. **Crear mockups interactivos** de todos los módulos
2. **Validar flujos UX** con el equipo
3. **Implementar backend** de integración
4. **Desarrollar frontend** avanzado
5. **Integrar apps existentes** del ecosistema Servat