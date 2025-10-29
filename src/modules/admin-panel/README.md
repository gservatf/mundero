# Admin Panel Module - MUNDERO Hub

## Descripción
Panel administrativo centralizado para gestionar usuarios, empresas, referidos, comisiones, integraciones, seguridad y métricas del ecosistema MUNDERO.

## Estructura del Módulo
```
/src/modules/admin-panel/
├── components/          # Componentes específicos del admin
├── pages/              # Páginas principales del panel
├── hooks/              # Hooks personalizados para admin
├── services/           # Servicios de Firebase para admin
├── layout/             # Layout específico del admin
├── index.ts            # Exportaciones del módulo
└── README.md           # Esta documentación
```

## Rutas
- `/admin` - Dashboard principal
- `/admin/users` - Gestión de usuarios y roles
- `/admin/companies` - Empresas y perfiles
- `/admin/apps` - API Manager
- `/admin/referrals` - Referidos y comisiones
- `/admin/leads` - Sistema CRM
- `/admin/security` - Seguridad y auditoría
- `/admin/config` - Configuraciones globales
- `/admin/notifications` - Centro de notificaciones
- `/admin/analytics` - Métricas y analítica

## Permisos por Rol
- **super_admin**: Acceso completo
- **admin**: Usuarios, empresas, referidos, comisiones, leads
- **auditor**: Solo lectura en seguridad y métricas
- **soporte**: Usuarios y notificaciones
- **dev**: API Manager y logs técnicos

## Colecciones Firebase
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

## Storage Paths
- `logos/` - Logos de empresas
- `backups/` - Respaldos del sistema
- `docs/` - Documentos varios

## Realtime Database
- `/logs/` - Logs en tiempo real
- `/alerts/` - Alertas del sistema
- `/notifications/` - Notificaciones push