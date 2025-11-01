# Landing Module - MUNDERO v2.1

## 📋 Propósito General

El módulo Landing de MUNDERO es la puerta de entrada principal al ecosistema profesional del Grupo Servat. Diseñado con un enfoque corporativo moderno inspirado en LinkedIn, proporciona una experiencia de usuario elegante y profesional que refleja la identidad visual de la marca.

**Versión actual:** 2.1 (Octubre 2025)

## 🏗️ Estructura de Carpetas y Componentes

```
src/modules/landing/
├── components/
│   ├── HeroSection.tsx      # Sección principal con CTA y header sticky
│   ├── ValueSection.tsx     # Constelación interactiva y beneficios
│   ├── CTASection.tsx       # Testimonios y llamada a la acción final
│   └── Footer.tsx           # Footer corporativo tipo LinkedIn v2.1
├── index.tsx                # Componente principal que orquesta todas las secciones
└── README.md               # Documentación del módulo
```

### Descripción de Componentes

#### `HeroSection.tsx`

- **Header sticky** con blur y transparencia backdrop-blur-md
- **Hero principal** con layout de dos columnas optimizado
- **CTA principal** "Entrar con Google" con autenticación preservada
- **Métricas profesionales** (500+ Profesionales, 50+ Empresas, 10+ Países)
- **Tipografía moderna** con jerarquía LinkedIn-style

#### `ValueSection.tsx`

- **Constelación interactiva** con MUNDERO como hub central
- **Empresas satélite**: LEGALTY, WE CONSULTING, PITAHAYA, PORTALES
- **Grid de beneficios** con iconos (FiUsers, FiShield, FiTrendingUp, FiZap)
- **Animaciones sutiles** con partículas de fondo y rotación

#### `CTASection.tsx`

- **Sección de testimonios** con valoraciones reales de usuarios
- **CTA final emocional** con doble botón de acción
- **Banner oscuro** con gradiente azul corporativo
- **Llamada a la acción** aspiracional y profesional

#### `Footer.tsx` v2.1

- **Footer tipo LinkedIn** con 5 columnas organizadas
- **Soporte completo** para modo oscuro/claro con transiciones
- **Enlaces corporativos** (General, Explorar, Empresa, Recursos, Legal)
- **Branding actualizado** con logo y copyright Grupo Servat
- **Versión 2.1** indicada en el footer

## 🔧 Dependencias Utilizadas

### Principales

- **React** ^18.0.0 - Framework base
- **TypeScript** ^5.0.0 - Tipado estático
- **TailwindCSS** ^3.0.0 - Framework de estilos utilitarios
- **Framer Motion** ^10.0.0 - Animaciones y transiciones
- **React Icons** ^4.0.0 (Fi) - Iconografía consistente

### Hooks Personalizados

- **useAuth** - Gestión de autenticación con Google (⚠️ NO MODIFICAR)

## 🎨 Notas de Diseño

### Paleta de Colores Corporativa

```css
/* Colores principales Grupo Servat */
--blue-primary: #0e1e64; /* Azul corporativo principal */
--blue-600: #2563eb; /* Azul LinkedIn-style */
--blue-700: #1d4ed8; /* Azul hover states */
--white: #ffffff; /* Fondo principal */
--gray-50: #f9fafb; /* Fondo secciones alternativas */
--gray-900: #111827; /* Texto principal */
--gray-600: #4b5563; /* Texto secundario */

/* Modo oscuro */
--slate-900: #0f172a; /* Fondo oscuro */
--slate-700: #334155; /* Bordes modo oscuro */
```

### Tipografía LinkedIn-Inspired

```css
/* Jerarquía tipográfica profesional */
h1: text-5xl md:text-6xl font-semibold leading-tight    /* Títulos hero */
h2: text-4xl font-bold mb-4                             /* Títulos de sección */
h3: text-xl font-semibold mb-3                          /* Subtítulos */
p: text-lg text-gray-600 leading-relaxed                /* Párrafos principales */
small: text-sm text-gray-500                            /* Texto auxiliar */
```

### Convenciones de Botones

#### Botón Primario (CTA Principal)

```css
.btn-primary {
  @apply bg-blue-600 hover:bg-blue-700 text-white 
         px-8 py-4 text-lg font-medium rounded-full 
         shadow-lg hover:shadow-xl transition-all duration-200 
         transform hover:scale-105;
}
```

#### Botón Secundario (Outline)

```css
.btn-secondary {
  @apply !bg-transparent !hover:bg-blue-50 
         border-2 border-blue-600 text-blue-600 
         px-8 py-4 text-lg font-medium rounded-full 
         transition-all duration-200;
}
```

#### Botón Ghost (Header)

```css
.btn-ghost {
  @apply text-gray-600 hover:text-gray-900 hover:bg-gray-100 
         px-4 py-2 text-sm font-medium transition-colors duration-200;
}
```

### Convenciones de Layout

```css
/* Contenedores principales */
.container-main {
  @apply max-w-6xl mx-auto px-6;
}

/* Secciones con espaciado consistente */
.section-padding {
  @apply py-20;
}

/* Grid layouts responsivos */
.grid-hero {
  @apply grid grid-cols-1 lg:grid-cols-2 gap-12 items-center;
}

.grid-benefits {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8;
}
```

### Animaciones Optimizadas

```typescript
// Fade in desde abajo (estándar)
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

// Slide desde la derecha (hero)
const slideInRight = {
  initial: { opacity: 0, x: 30 },
  animate: { opacity: 1, x: 0 },
  transition: { delay: 0.2, duration: 0.8 },
};

// Rotación continua (constelación)
const continuousRotation = {
  animate: { rotate: 360 },
  transition: { duration: 30, repeat: Infinity, ease: "linear" },
};
```

## 📱 Convenciones Responsive

### Breakpoints TailwindCSS

- **sm**: 640px+ (móviles grandes)
- **md**: 768px+ (tablets)
- **lg**: 1024px+ (desktop)
- **xl**: 1280px+ (desktop grande)

### Grid Adaptativo

```css
/* Hero section responsive */
.hero-grid {
  @apply grid grid-cols-1 lg:grid-cols-2 gap-12;
}

/* Benefits responsive */
.benefits-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8;
}

/* Footer responsive */
.footer-grid {
  @apply grid grid-cols-2 md:grid-cols-5 gap-8;
}
```

## ⚠️ Notas Importantes

### NO MODIFICAR

- **Hook useAuth**: Mantener intacta la lógica de autenticación
- **Rutas globales**: No alterar el sistema de routing existente
- **Estructura base**: Conservar la arquitectura de componentes

### Consideraciones de Rendimiento

- Animaciones con `viewport={{ once: true }}` para optimización
- Lazy loading implementado para componentes fuera del viewport inicial
- Imágenes optimizadas en formato WebP cuando sea posible

### Accesibilidad WCAG 2.1 AA

- Contraste de colores verificado
- Navegación por teclado implementada
- Etiquetas ARIA apropiadas
- Texto alternativo en imágenes

## 🔄 Versión Actual: 2.1 (Octubre 2025)

### Cambios en v2.1

- ✅ Footer.tsx actualizado con modo oscuro completo
- ✅ Transiciones suaves entre temas claro/oscuro
- ✅ Versión 2.1 indicada en footer
- ✅ Compilación sin errores verificada
- ✅ README documentado completamente

### Cambios en v2.0

- ✅ Rediseño completo LinkedIn-style
- ✅ Header sticky con backdrop-blur
- ✅ Constelación interactiva de empresas
- ✅ Testimonios y CTA emocional
- ✅ Animaciones optimizadas con Framer Motion

### Próximas Mejoras v2.2

- [ ] Integración con CMS para contenido dinámico
- [ ] A/B testing para optimización de conversión
- [ ] Métricas avanzadas con analytics
- [ ] Soporte para múltiples idiomas

## 🚀 Uso e Integración

### Importación

```typescript
import { LandingPage } from '@/modules/landing';

// En tu router principal
<Route path="/" component={LandingPage} />
```

### Personalización Segura

1. **Textos**: Editar directamente en cada componente
2. **Colores**: Modificar variables en `tailwind.config.js`
3. **Animaciones**: Ajustar propiedades de Framer Motion
4. **Layout**: Cambiar clases de grid de TailwindCSS

---

**Desarrollado por el equipo Grupo Servat**  
_Landing v2.1 - Coherencia total con la identidad visual corporativa_  
_Octubre 2025_
