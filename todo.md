# MUNDERO v2.1 - Plan de Desarrollo con Mockups

## Objetivo
Crear mockups interactivos completos del sistema MUNDERO antes de la implementación técnica final, validando todos los flujos UX/UI y la arquitectura de integración.

## Archivos a Crear (Máximo 8 archivos)

### 1. App.tsx
- Router principal con rutas protegidas
- Integración de autenticación híbrida
- Manejo de estados globales con Zustand

### 2. pages/Dashboard.tsx
- Panel principal post-autenticación
- Grid de aplicaciones disponibles
- Navegación a módulos principales

### 3. pages/AdminPanel.tsx
- Panel administrativo completo
- Gestión de usuarios, empresas y aplicativos
- Aprobación de accesos y roles
- Auditoría y logs

### 4. components/AuthFlow.tsx
- Flujo completo de autenticación Google SSO
- Integración Firebase + Supabase
- Estados de carga y error

### 5. components/ReferralSystem.tsx
- Sistema de referidos mockup
- Registro de referidos
- Visualización de comisiones
- Estados de aprobación

### 6. components/IntegrationHub.tsx
- Panel de integraciones con apps externas
- Visualización de conexiones activas
- Configuración de webhooks
- Estados de sincronización

### 7. hooks/useMockData.ts
- Hook para datos mockeados
- Simulación de APIs
- Estados de carga y respuestas
- Datos de ejemplo para todos los módulos

### 8. lib/mockApi.ts
- API simulada para desarrollo
- Endpoints mockeados
- Simulación de respuestas de Firebase/Supabase
- Datos de prueba estructurados

## Relación entre Archivos

- **App.tsx** → Router principal que conecta todas las páginas
- **Dashboard.tsx** → Página principal que usa componentes de integración
- **AdminPanel.tsx** → Panel administrativo independiente
- **AuthFlow.tsx** → Componente usado en todas las rutas protegidas
- **ReferralSystem.tsx** → Componente usado en Dashboard
- **IntegrationHub.tsx** → Componente usado en Dashboard y AdminPanel
- **useMockData.ts** → Hook usado por todos los componentes
- **mockApi.ts** → API simulada usada por el hook

## Funcionalidades Mockup a Implementar

### Autenticación
- [x] Login con Google (simulado)
- [x] Registro automático en Supabase (simulado)
- [x] Estados de carga y error
- [x] Redirección post-autenticación

### Panel Principal
- [x] Grid de aplicaciones disponibles
- [x] Perfil de usuario con empresa asociada
- [x] Navegación a módulos principales
- [x] Estados de carga de datos

### Panel Administrativo
- [x] Lista de usuarios pendientes de aprobación
- [x] Gestión de empresas y roles
- [x] Panel de integraciones activas
- [x] Logs de auditoría

### Sistema de Referidos
- [x] Formulario de registro de referidos
- [x] Lista de referidos con estados
- [x] Cálculo de comisiones
- [x] Visualización de acuerdos

### Hub de Integraciones
- [x] Lista de apps conectadas
- [x] Estados de sincronización
- [x] Configuración de webhooks
- [x] Logs de eventos

## Implementación
Cada archivo será desarrollado con datos mockeados para simular el comportamiento real del sistema, permitiendo validar la UX completa antes de la integración con Firebase y Supabase.