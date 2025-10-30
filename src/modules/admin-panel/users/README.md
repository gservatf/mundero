# Módulo de Usuarios y Roles - Panel Administrativo MUNDERO

## 📋 Descripción General

El módulo de Usuarios y Roles es una pieza fundamental del Panel Administrativo de MUNDERO que permite la gestión completa de usuarios, sus roles y permisos dentro del sistema. Este módulo proporciona una interfaz intuitiva para administradores y super administradores para supervisar y gestionar la base de usuarios de la plataforma.

## 🏗️ Estructura del Módulo

```
src/modules/admin-panel/
├── pages/
│   └── AdminUsers.tsx          # Componente principal de gestión de usuarios
├── services/
│   └── adminFirebase.ts        # Servicio Firebase para operaciones CRUD
├── hooks/
│   └── useAdminAuth.ts         # Hook para autenticación y permisos
└── users/
    ├── README.md               # Esta documentación
    └── AdminUsers.test.tsx     # Pruebas de integración
```

## 🔧 Componentes Principales

### 1. AdminUsers.tsx

**Propósito**: Componente React principal que renderiza la interfaz de gestión de usuarios.

**Características**:
- ✅ Paginación automática (25 usuarios por carga)
- ✅ Búsqueda en tiempo real por email y nombre
- ✅ Filtros por rol y estado
- ✅ Tooltips informativos para roles y estados
- ✅ Confirmación de cambios críticos
- ✅ Exportación a CSV
- ✅ Restricciones por permisos de rol

**Props**: Ninguna (componente autónomo)

**Ejemplo de uso**:
```tsx
import { AdminUsers } from '../pages/AdminUsers';

function AdminPanel() {
  return (
    <div>
      <AdminUsers />
    </div>
  );
}
```

### 2. adminFirebase.ts

**Propósito**: Servicio que maneja todas las operaciones de base de datos relacionadas con usuarios.

**Métodos principales**:

#### `getUsers(limitCount, lastDocument)`
- **Descripción**: Obtiene usuarios con paginación
- **Parámetros**: 
  - `limitCount` (number): Número de usuarios a cargar (default: 25)
  - `lastDocument` (DocumentSnapshot): Último documento para paginación
- **Retorna**: `Promise<PaginatedUsers>`

#### `searchUsers(searchTerm)`
- **Descripción**: Busca usuarios por email o nombre
- **Parámetros**: `searchTerm` (string): Término de búsqueda
- **Retorna**: `Promise<AdminUser[]>`

#### `updateUserRole(userId, newRole, adminUser)`
- **Descripción**: Actualiza el rol de un usuario y registra la acción
- **Parámetros**: 
  - `userId` (string): ID del usuario
  - `newRole` (string): Nuevo rol
  - `adminUser` (object): Datos del administrador que realiza el cambio
- **Retorna**: `Promise<void>`

#### `updateUserStatus(userId, newStatus, adminUser)`
- **Descripción**: Actualiza el estado de un usuario y registra la acción
- **Parámetros**:
  - `userId` (string): ID del usuario
  - `newStatus` (string): Nuevo estado
  - `adminUser` (object): Datos del administrador que realiza el cambio
- **Retorna**: `Promise<void>`

### 3. useAdminAuth.ts

**Propósito**: Hook personalizado para gestión de autenticación y permisos administrativos.

**Funciones principales**:

#### `canAccess(section)`
- **Descripción**: Verifica si el usuario puede acceder a una sección
- **Parámetros**: `section` (keyof AdminPermissions): Sección a verificar
- **Retorna**: `boolean`

#### `canEditRoles()`
- **Descripción**: Verifica si el usuario puede editar roles (solo super_admin)
- **Retorna**: `boolean`

#### `canManageUserStatus()`
- **Descripción**: Verifica si el usuario puede gestionar estados de usuario
- **Retorna**: `boolean`

#### `getRestrictionMessage(action)`
- **Descripción**: Obtiene mensaje descriptivo de restricciones
- **Parámetros**: `action` (string): Acción que se intenta realizar
- **Retorna**: `string`

**Ejemplo de uso**:
```tsx
import { useAdminAuth } from '../hooks/useAdminAuth';

function MyComponent() {
  const { canAccess, canEditRoles, getRestrictionMessage } = useAdminAuth();
  
  if (!canAccess('users')) {
    return <div>Sin permisos</div>;
  }
  
  const handleRoleChange = () => {
    if (!canEditRoles()) {
      alert(getRestrictionMessage('cambiar roles'));
      return;
    }
    // Proceder con el cambio...
  };
  
  return <div>Content</div>;
}
```

## 📊 Schema de Firestore

### Colección: `users`

```typescript
interface AdminUser {
  uid: string;                    // ID único del usuario
  email: string;                  // Email del usuario
  displayName?: string;           // Nombre a mostrar
  photoURL?: string;              // URL de la foto de perfil
  role: AdminRole;                // Rol del usuario
  status: UserStatus;             // Estado del usuario
  companyId?: string;             // ID de la empresa (opcional)
  companyName?: string;           // Nombre de la empresa (calculado)
  country?: string;               // País del usuario
  createdAt?: Timestamp;          // Fecha de creación
  updatedAt?: Timestamp;          // Fecha de última actualización
  lastLogin?: Timestamp;          // Fecha de último login
  isEmailVerified?: boolean;      // Si el email está verificado
}
```

### Tipos de Rol (AdminRole)

```typescript
type AdminRole = 
  | 'super_admin'    // Acceso total, puede cambiar roles
  | 'admin'          // Acceso completo excepto configuración del sistema
  | 'manager'        // Gestión de usuarios y empresas
  | 'analyst'        // Solo lectura de analíticas
  | 'affiliate'      // Acceso limitado como socio
  | 'client';        // Usuario cliente sin permisos administrativos
```

### Estados de Usuario (UserStatus)

```typescript
type UserStatus = 
  | 'active'         // Usuario activo
  | 'suspended'      // Usuario suspendido
  | 'pending';       // Pendiente de activación
```

### Colección: `admin_actions`

```typescript
interface AdminAction {
  id?: string;                    // ID de la acción
  adminUid: string;               // ID del administrador
  adminEmail: string;             // Email del administrador
  action: string;                 // Tipo de acción realizada
  targetUserId?: string;          // ID del usuario objetivo
  targetUserEmail?: string;       // Email del usuario objetivo
  oldValue?: any;                 // Valor anterior
  newValue?: any;                 // Valor nuevo
  timestamp: Timestamp;           // Fecha y hora de la acción
  metadata?: Record<string, any>; // Metadatos adicionales
}
```

## 🔒 Matriz de Permisos

| Rol          | Usuarios | Empresas | Analytics | Settings | Logs | Sistema | Mensajes |
|-------------|----------|----------|-----------|----------|------|---------|----------|
| super_admin | ✅       | ✅       | ✅        | ✅       | ✅   | ✅      | ✅       |
| admin       | ✅       | ✅       | ✅        | ❌       | ✅   | ❌      | ✅       |
| manager     | ✅       | ✅       | ✅        | ❌       | ❌   | ❌      | ✅       |
| analyst     | ❌       | ❌       | ✅        | ❌       | ❌   | ❌      | ❌       |
| affiliate   | ❌       | ❌       | ❌        | ❌       | ❌   | ❌      | ❌       |
| client      | ❌       | ❌       | ❌        | ❌       | ❌   | ❌      | ❌       |

## 🛡️ Reglas de Seguridad de Firestore

```javascript
// Reglas para la colección de usuarios
match /users/{userId} {
  // Lectura: cualquier usuario autenticado
  allow read: if request.auth != null;
  
  // Escritura: solo super_admin puede actualizar roles
  allow update: if request.auth != null && 
    request.auth.token.role == 'super_admin' ||
    (request.auth.token.role == 'admin' && 
     !('role' in resource.data) || 
     resource.data.role == request.resource.data.role);
}

// Reglas para logs de acciones administrativas
match /admin_actions/{actionId} {
  // Solo creación de logs
  allow create: if request.auth != null && 
    request.auth.token.role in ['super_admin', 'admin'];
  
  // Lectura solo para admin y super_admin
  allow read: if request.auth != null && 
    request.auth.token.role in ['super_admin', 'admin'];
}

// Reglas para empresas
match /companies/{companyId} {
  allow read: if request.auth != null;
  allow write: if request.auth != null && 
    request.auth.token.role in ['super_admin', 'admin', 'manager'];
}
```

## 🧪 Pruebas

### Configuración de Pruebas

```bash
# Instalar dependencias de testing
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom

# Ejecutar pruebas
npm run test
```

### Casos de Prueba Principales

1. **Carga de usuarios**: Verificar que los usuarios se cargan correctamente
2. **Búsqueda**: Validar que la búsqueda funciona por email y nombre
3. **Paginación**: Comprobar que la paginación carga más usuarios
4. **Permisos**: Verificar que las restricciones por rol funcionan
5. **Cambio de rol**: Validar que solo super_admin puede cambiar roles
6. **Cambio de estado**: Verificar que admin y super_admin pueden cambiar estados
7. **Logging**: Comprobar que las acciones se registran correctamente

## 📱 UX/UI

### Características de Interfaz

- **Responsive Design**: Adaptable a móviles y tablets
- **Loading States**: Indicadores de carga durante operaciones
- **Error Handling**: Manejo elegante de errores con mensajes informativos
- **Confirmaciones**: Modales de confirmación para acciones críticas
- **Tooltips**: Información contextual para roles y estados
- **Paginación Infinita**: Carga automática de más usuarios al hacer scroll
- **Exportación**: Descarga de datos en formato CSV

### Accesibilidad

- Uso de elementos semánticos HTML
- Contraste de colores adecuado
- Soporte para navegación por teclado
- Labels descriptivos para screen readers

## 🚀 Instalación y Configuración

### 1. Prerrequisitos

```bash
# Firebase configurado en el proyecto
# React 18+ instalado
# TypeScript configurado
```

### 2. Configuración de Firebase

```typescript
// En firebaseConfig.ts
const firebaseConfig = {
  // Tu configuración de Firebase
};

export const firestore = getFirestore(app);
```

### 3. Configuración de Índices

Crear estos índices en Firestore Console:

```
Collection: users
- email (Ascending)
- displayName (Ascending)  
- createdAt (Descending)
- role (Ascending) + status (Ascending)
```

### 4. Uso en el Proyecto

```tsx
// En tu router o layout principal
import { AdminUsers } from '@/modules/admin-panel/pages/AdminUsers';

function AdminLayout() {
  return (
    <div>
      <AdminUsers />
    </div>
  );
}
```

## 🔄 Estados y Flujo de Datos

### Flujo de Carga de Usuarios

1. **Inicialización**: Componente se monta y verifica permisos
2. **Carga inicial**: Solicita primeros 25 usuarios a Firebase
3. **Renderizado**: Muestra usuarios con loading state
4. **Interacción**: Usuario puede buscar, filtrar o cargar más
5. **Actualizaciones**: Cambios se reflejan en tiempo real

### Flujo de Cambio de Rol/Estado

1. **Selección**: Usuario selecciona nuevo rol/estado
2. **Validación**: Hook verifica permisos del usuario actual
3. **Confirmación**: Modal solicita confirmación del cambio
4. **Ejecución**: Servicio actualiza Firebase y registra acción
5. **Actualización**: UI se actualiza con nuevos datos

## 📈 Métricas y Monitoreo

### KPIs del Módulo

- Tiempo de carga inicial de usuarios
- Tasa de éxito en búsquedas
- Frecuencia de cambios de rol por administrador
- Tiempo de respuesta en operaciones CRUD

### Logging de Acciones

Todas las acciones administrativas se registran con:
- Timestamp exacto
- Usuario que realiza la acción
- Usuario objetivo (si aplica)
- Valores antes y después del cambio
- Metadatos adicionales de contexto

## 🤝 Contribución y Mantenimiento

### Agregando Nuevos Roles

1. Actualizar el tipo `AdminRole` en `useAdminAuth.ts`
2. Añadir permisos en la función `getPermissions`
3. Actualizar la descripción en `getRoleDescription`
4. Añadir colores en `getRoleBadgeColor`
5. Actualizar reglas de Firestore
6. Actualizar documentación

### Agregando Nuevos Permisos

1. Añadir propiedad a interface `AdminPermissions`
2. Configurar permisos por rol en `getPermissions`
3. Implementar verificación en componentes
4. Actualizar matriz de permisos en documentación

---

**Última actualización**: 29 de octubre de 2025  
**Versión del módulo**: 2.0.0  
**Compatibilidad**: Firebase v12.4.0, React 18.3.1