# 👨‍💼 Guía de Administración - MUNDERO Hub

## 📋 Introducción

Esta guía está dirigida a Super Administradores y Administradores del sistema MUNDERO Hub. Aquí encontrarás instrucciones detalladas sobre cómo utilizar todas las funcionalidades administrativas disponibles.

## 🔐 Niveles de Acceso

### Super Administrador

- ✅ Acceso completo al panel de administración
- ✅ Gestión de logo personalizado
- ✅ Configuración SEO avanzada
- ✅ Gestión de usuarios y roles
- ✅ Visualización de estadísticas completas

### Administrador

- ✅ Gestión de usuarios (sin cambio de roles de Super Admin)
- ✅ Visualización de estadísticas
- ✅ Acceso a aplicaciones integradas
- ❌ No acceso a configuración de logo y SEO

### Usuario

- ✅ Acceso a aplicaciones integradas
- ✅ Dashboard personal
- ❌ No acceso a funciones administrativas

## 🚀 Acceso al Panel de Administración

### 1. Iniciar Sesión

1. Ve a [hub.mundero.net](https://hub.mundero.net)
2. Haz clic en "Iniciar Sesión con Google"
3. Autoriza el acceso con tu cuenta Google corporativa
4. Serás redirigido al dashboard principal

### 2. Acceder a Administración

1. En el dashboard, busca las pestañas superiores
2. Haz clic en la pestaña **"Administración"**
   - ⚠️ **Nota**: Solo visible para Super Administradores
3. Se abrirá el panel de configuración avanzada

## 🎨 Gestión de Logo Personalizado

### Subir un Nuevo Logo

#### Paso 1: Acceder a la Sección

1. En el panel de administración, busca la sección **"Gestión de Logo"**
2. Verás el logo actual (por defecto es la letra "M")

#### Paso 2: Seleccionar Imagen

**Opción A - Drag & Drop**:

1. Arrastra tu archivo de imagen directamente al área de subida
2. Suelta el archivo cuando veas el indicador visual

**Opción B - Selector de Archivos**:

1. Haz clic en **"Seleccionar archivo"**
2. Navega y selecciona tu imagen
3. Haz clic en "Abrir"

#### Paso 3: Validación Automática

El sistema validará automáticamente:

- ✅ **Formatos soportados**: PNG, JPG, JPEG, SVG
- ✅ **Tamaño máximo**: 2MB
- ✅ **Dimensiones**: Recomendado 200x200px o superior

#### Paso 4: Vista Previa

1. Verás una vista previa del logo en tiempo real
2. El logo se mostrará como se verá en la aplicación
3. Revisa que se vea correctamente

#### Paso 5: Aplicar Cambios

1. Si estás satisfecho con la vista previa, haz clic en **"Aplicar Logo"**
2. El logo se actualizará automáticamente en toda la aplicación
3. Verás una confirmación de éxito

### Restaurar Logo Original

1. En la sección de gestión de logo
2. Haz clic en **"Restaurar Logo Original"**
3. Confirma la acción
4. El logo volverá a la "M" por defecto

### Mejores Prácticas para Logos

- **Formato recomendado**: PNG con fondo transparente
- **Dimensiones**: 200x200px mínimo, preferiblemente cuadrado
- **Tamaño de archivo**: Menos de 500KB para mejor rendimiento
- **Diseño**: Simple y legible, que funcione en fondos claros y oscuros

## 🔍 Configuración SEO

### Acceder a la Configuración SEO

1. En el panel de administración, busca **"Configuración SEO"**
2. Verás un formulario con múltiples campos

### Configurar Meta Tags Básicos

#### Título de la Página

```
Campo: Título
Ejemplo: MUNDERO Hub - Centro de Control Empresarial
Límite: 60 caracteres recomendados
Uso: Aparece en la pestaña del navegador y resultados de Google
```

#### Descripción

```
Campo: Descripción
Ejemplo: Hub de identidad empresarial para el ecosistema MUNDERO. Acceso seguro a Legalty, We Consulting y más aplicaciones integradas.
Límite: 160 caracteres recomendados
Uso: Aparece en los resultados de búsqueda de Google
```

#### Palabras Clave

```
Campo: Keywords
Ejemplo: mundero, hub, identidad, empresarial, legalty, we consulting
Formato: Separadas por comas
Uso: Ayuda a los motores de búsqueda a entender el contenido
```

### Configurar Open Graph (Redes Sociales)

#### Para Facebook y LinkedIn

```
Título OG: MUNDERO Hub - Ecosistema Empresarial
Descripción OG: Tu centro de autenticación único para acceder a todas las aplicaciones del ecosistema MUNDERO
Imagen OG: URL de imagen (1200x630px recomendado)
```

#### Para Twitter

```
Título Twitter: MUNDERO Hub - Ecosistema Empresarial
Descripción Twitter: Centro de autenticación único para el ecosistema MUNDERO
Imagen Twitter: URL de imagen (1200x600px recomendado)
```

### Vista Previa SEO

1. Después de llenar los campos, verás dos vistas previas:
   - **Google Search**: Cómo se verá en los resultados de búsqueda
   - **Redes Sociales**: Cómo se verá al compartir en Facebook/LinkedIn

2. Revisa que toda la información se vea correcta
3. Ajusta los campos si es necesario

### Guardar Configuración SEO

1. Haz clic en **"Guardar Configuraciones SEO"**
2. Los cambios se aplicarán inmediatamente
3. Verás una confirmación de éxito

### Mejores Prácticas SEO

- **Títulos únicos**: Cada página debe tener un título único y descriptivo
- **Descripciones atractivas**: Escribe descripciones que inviten a hacer clic
- **Keywords relevantes**: Usa palabras clave que realmente describan el contenido
- **Imágenes optimizadas**: Usa imágenes de alta calidad para Open Graph

## 👥 Gestión de Usuarios

### Ver Lista de Usuarios

1. En el dashboard, ve a la pestaña **"Usuarios"**
2. Verás una tabla con todos los usuarios registrados:
   - Foto de perfil
   - Nombre completo
   - Email
   - Rol actual
   - Estado (Activo/Inactivo)

### Cambiar Roles de Usuario

#### Para Super Administradores:

1. Localiza el usuario en la lista
2. Haz clic en el dropdown de "Rol"
3. Selecciona el nuevo rol:
   - **Super Admin**: Acceso completo
   - **Admin**: Gestión de usuarios y estadísticas
   - **Usuario**: Acceso básico a aplicaciones

4. El cambio se aplica inmediatamente
5. El usuario verá los nuevos permisos en su próximo login

#### Para Administradores:

- Pueden cambiar roles entre "Admin" y "Usuario"
- No pueden crear o modificar Super Administradores
- No pueden cambiar su propio rol

### Activar/Desactivar Usuarios

1. Localiza el usuario en la lista
2. Haz clic en el toggle de "Estado"
3. **Activo**: Usuario puede acceder normalmente
4. **Inactivo**: Usuario no puede iniciar sesión

### Filtrar y Buscar Usuarios

- **Buscar**: Usa el campo de búsqueda para encontrar usuarios por nombre o email
- **Filtrar por rol**: Selecciona un rol específico para ver solo esos usuarios
- **Filtrar por estado**: Muestra solo usuarios activos o inactivos

## 📊 Estadísticas y Métricas

### Panel de Estadísticas

En el dashboard principal verás:

#### Métricas Principales

- **Usuarios Totales**: Número total de usuarios registrados
- **Aplicaciones Integradas**: Cantidad de apps disponibles
- **Sesiones Activas**: Usuarios conectados actualmente
- **Nuevos Usuarios**: Registros del último mes

#### Gráficos y Tendencias

- **Registros por mes**: Crecimiento de usuarios
- **Uso de aplicaciones**: Apps más utilizadas
- **Actividad por día**: Patrones de uso

### Exportar Datos

1. En la sección de estadísticas
2. Haz clic en **"Exportar Datos"**
3. Selecciona el formato (CSV, Excel)
4. Elige el rango de fechas
5. Descarga el archivo generado

## 🔗 Gestión de Aplicaciones Integradas

### Aplicaciones Actuales

- **Legalty**: Sistema de gestión legal
- **We Consulting**: Plataforma de consultoría empresarial

### Agregar Nueva Aplicación (Futuro)

1. Ve a la pestaña **"Aplicaciones"**
2. Haz clic en **"Agregar Aplicación"**
3. Completa la información:
   - Nombre de la aplicación
   - URL de acceso
   - Descripción
   - Icono/Logo
   - Roles permitidos

4. Configura permisos de acceso
5. Guarda la configuración

### Configurar Permisos de Aplicación

- **Super Admin**: Acceso a todas las aplicaciones
- **Admin**: Acceso según configuración específica
- **Usuario**: Acceso a aplicaciones asignadas

## 🔧 Configuración Avanzada

### Variables de Entorno

Solo Super Administradores pueden modificar:

- URLs de aplicaciones integradas
- Configuración de Firebase
- Parámetros de seguridad

### Backup y Restauración

1. **Backup automático**: Se realiza diariamente
2. **Backup manual**: Disponible en configuración avanzada
3. **Restauración**: Solo en caso de emergencia, contactar soporte

### Logs del Sistema

- **Accesos**: Registro de inicios de sesión
- **Cambios**: Modificaciones en configuración
- **Errores**: Problemas técnicos reportados

## 🚨 Solución de Problemas

### Problemas Comunes

#### Usuario No Puede Iniciar Sesión

1. Verificar que el usuario esté "Activo"
2. Comprobar que el email esté en la lista de usuarios
3. Revisar configuración de Firebase Auth
4. Verificar dominios autorizados

#### Logo No Se Actualiza

1. Verificar formato de imagen (PNG, JPG, SVG)
2. Comprobar tamaño de archivo (máx. 2MB)
3. Limpiar caché del navegador
4. Intentar con otra imagen

#### SEO No Se Aplica

1. Verificar que se guardaron los cambios
2. Comprobar vista previa antes de guardar
3. Limpiar caché del navegador
4. Esperar 24-48h para indexación en buscadores

### Contactar Soporte

- **Email**: admin@mundero.net
- **Teléfono**: +1 (555) 123-4567
- **Horario**: Lunes a Viernes, 9:00 - 18:00 (GMT-5)

## 📚 Recursos Adicionales

### Documentación Técnica

- [Documentación Completa](./TECHNICAL_DOCUMENTATION.md)
- [Guía de Deployment](./DEPLOYMENT_GUIDE.md)
- [API Reference](./API_REFERENCE.md)

### Tutoriales en Video

- [Configuración Inicial del Hub](https://videos.mundero.net/setup)
- [Gestión de Usuarios Avanzada](https://videos.mundero.net/users)
- [Optimización SEO](https://videos.mundero.net/seo)

### Mejores Prácticas

- [Seguridad en el Hub](https://docs.mundero.net/security)
- [Optimización de Performance](https://docs.mundero.net/performance)
- [Guía de Branding](https://docs.mundero.net/branding)

---

**Última actualización**: 28 de Octubre, 2024
**Versión**: 2.1.0
**Soporte**: admin@mundero.net
