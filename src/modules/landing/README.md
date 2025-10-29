# Landing Module - MUNDERO

## 📋 Propósito General

El módulo Landing de MUNDERO es la puerta de entrada principal al ecosistema profesional del Grupo Servat. Diseñado con un enfoque corporativo moderno inspirado en LinkedIn, proporciona una experiencia de usuario elegante y profesional que refleja la identidad visual de la marca.

## 🏗️ Estructura de Carpetas y Componentes

```
src/modules/landing/
├── components/
│   ├── HeroSection.tsx      # Sección principal con CTA y header
│   ├── ValueSection.tsx     # Constelación interactiva y beneficios
│   ├── CTASection.tsx       # Testimonios y llamada a la acción final
│   └── Footer.tsx           # Footer corporativo tipo LinkedIn
├── index.tsx                # Componente principal que orquesta todas las secciones
└── README.md               # Documentación del módulo
```

### Descripción de Componentes

#### `HeroSection.tsx`
- **Header sticky** con blur y transparencia
- **Hero principal** con layout de dos columnas (7:5)
- **CTA principal** "Entrar con Google" con autenticación
- **Métricas** de profesionales, empresas y países
- **Tipografía moderna** con jerarquía clara

#### `ValueSection.tsx`
- **Constelación interactiva** con MUNDERO como hub central
- **Empresas satélite**: LEGALTY, WE CONSULTING, PITAHAYA, PORTALES
- **Grid de beneficios** con iconos (Red, Seguridad, Crecimiento, Integración)
- **Animaciones sutiles** con partículas de fondo

#### `CTASection.tsx`
- **Sección de testimonios** con valoraciones de usuarios
- **CTA final emocional** con doble botón
- **Banner oscuro** con gradiente azul corporativo
- **Llamada a la acción** aspiracional y profesional

#### `Footer.tsx`
- **Footer tipo LinkedIn** con 5 columnas organizadas
- **Soporte para modo oscuro/claro** con transiciones
- **Enlaces corporativos** (General, Explorar, Empresa, Recursos, Legal)
- **Branding** con logo y copyright de Grupo Servat

## 🔧 Dependencias Utilizadas

### Principales
- **React** - Framework base
- **TypeScript** - Tipado estático
- **TailwindCSS** - Framework de estilos utilitarios
- **Framer Motion** - Animaciones y transiciones
- **React Icons** (Fi) - Iconografía consistente

### Hooks Personalizados
- **useAuth** - Gestión de autenticación con Google (no modificar)

## 🎨 Guía de Diseño

### Paleta de Colores

```css
/* Colores principales */
--blue-primary: #0E1E64;     /* Azul corporativo Grupo Servat */
--blue-600: #2563eb;         /* Azul LinkedIn-style */
--blue-700: #1d4ed8;         /* Azul hover */
--white: #ffffff;            /* Fondo principal */
--gray-50: #f9fafb;          /* Fondo secciones */
--gray-900: #111827;         /* Texto principal */
--gray-600: #4b5563;         /* Texto secundario */
```

### Tipografía

```css
/* Jerarquía tipográfica */
h1: text-5xl md:text-6xl font-semibold    /* Títulos principales */
h2: text-4xl font-bold                    /* Títulos de sección */
h3: text-xl font-semibold                 /* Subtítulos */
p: text-lg text-gray-600                  /* Párrafos principales */
small: text-sm text-gray-500              /* Texto auxiliar */
```

### Estilos de Botón

#### Botón Primario (CTA Principal)
```css
.btn-primary {
  @apply bg-blue-600 hover:bg-blue-700 text-white 
         px-8 py-4 text-lg font-medium rounded-full 
         shadow-lg hover:shadow-xl transition-all duration-200;
}
```

#### Botón Secundario (Outline)
```css
.btn-secondary {
  @apply !bg-transparent !hover:bg-blue-50 
         border-2 border-blue-600 text-blue-600 hover:text-blue-600 
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

### Espaciado y Layout

```css
/* Contenedores principales */
.container-main {
  @apply max-w-6xl mx-auto px-6;
}

/* Secciones */
.section-padding {
  @apply py-20;
}

/* Grid layouts */
.grid-hero {
  @apply grid grid-cols-1 lg:grid-cols-2 gap-12 items-center;
}

.grid-benefits {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8;
}
```

### Animaciones

```typescript
// Fade in desde abajo
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

// Slide desde la derecha
const slideInRight = {
  initial: { opacity: 0, x: 30 },
  animate: { opacity: 1, x: 0 },
  transition: { delay: 0.2, duration: 0.8 }
};
```

## 🚀 Uso e Integración

### Importación
```typescript
import { LandingPage } from '@/modules/landing';

// En tu router principal
<Route path="/" component={LandingPage} />
```

### Personalización
Para modificar contenido o estilos:

1. **Textos**: Editar directamente en cada componente
2. **Colores**: Modificar variables en `tailwind.config.js`
3. **Animaciones**: Ajustar propiedades de Framer Motion
4. **Layout**: Cambiar clases de grid de TailwindCSS

## ⚠️ Notas Importantes

### No Modificar
- **Hook useAuth**: Mantener intacta la lógica de autenticación
- **Rutas globales**: No alterar el sistema de routing
- **Estructura base**: Conservar la arquitectura de componentes

### Consideraciones de Rendimiento
- Las animaciones están optimizadas con `viewport={{ once: true }}`
- Imágenes deben estar optimizadas y en formato WebP cuando sea posible
- Lazy loading implementado para componentes fuera del viewport

### Responsive Design
- **Mobile-first**: Diseño optimizado para dispositivos móviles
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)
- **Grid adaptativo**: Columnas que se ajustan según el tamaño de pantalla

## 📱 Compatibilidad

- **Navegadores**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Dispositivos**: Desktop, tablet, móvil
- **Resoluciones**: 320px - 2560px
- **Accesibilidad**: WCAG 2.1 AA compliant

## 🔄 Actualizaciones Recientes

### v2.0 - Rediseño LinkedIn-style
- ✅ Header sticky con blur y transparencia
- ✅ Hero limpio con tipografía moderna
- ✅ Constelación interactiva de empresas
- ✅ Testimonios y CTA emocional
- ✅ Footer corporativo con modo oscuro
- ✅ Animaciones optimizadas con Framer Motion

### Próximas Mejoras
- [ ] Integración con CMS para contenido dinámico
- [ ] A/B testing para optimización de conversión
- [ ] Métricas avanzadas con analytics
- [ ] Soporte para múltiples idiomas

---

**Desarrollado por el equipo Grupo Servat**  
*Coherencia total con la identidad visual corporativa*