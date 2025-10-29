# Módulo Landing - MUNDERO Hub

## Descripción
Landing page principal de MUNDERO Hub, diseñada para ser el punto de entrada del ecosistema del Grupo Servat. Enfoque en propósito + poder, diferenciándose de LinkedIn con una experiencia más emocional y conectada.

## Estructura del Módulo

```
src/modules/landing/
├── components/
│   ├── HeroSection.tsx      # Sección principal con animaciones
│   ├── ValueSection.tsx     # Propuesta de valor y constelación
│   ├── IntegrationsSection.tsx # Cards de aplicaciones integradas
│   ├── CTASection.tsx       # Call-to-action emocional y testimonios
│   └── Footer.tsx           # Footer minimalista con links
├── hooks/                   # Hooks específicos del landing (futuro)
├── assets/                  # Assets específicos del landing (futuro)
├── index.tsx               # Exportación principal del módulo
└── README.md               # Esta documentación
```

## Características Implementadas

### 🎯 Hero Section
- **Copy principal**: "Tu identidad profesional, conectada al futuro"
- **Animación de red**: Constelación con MUNDERO al centro y empresas satélite
- **Botones CTA**: Entrar con Google (principal) y Explorar ecosistema (secundario)
- **Partículas flotantes**: Efecto visual dinámico de fondo
- **Indicador de scroll**: Animación sutil para guiar al usuario

### ⚡ Value Section
- **Propuesta central**: "MUNDERO es el núcleo digital del Grupo Servat"
- **Constelación modular**: Visualización de conexiones entre empresas
- **Features grid**: 4 características principales con iconos animados
- **Animaciones**: Framer Motion para efectos de entrada progresivos

### 🔗 Integrations Section
- **Cards interactivas**: Hover effects con blur + glow
- **4 Aplicaciones**: Legalty, We Consulting, Pitahaya, Portales
- **Estados**: Activo vs Próximamente
- **Métricas dinámicas**: Usuarios, empresas, comisiones
- **Gradientes temáticos**: Cada app tiene su paleta de colores

### ❤️ CTA Section
- **Mensaje emocional**: "No trabajes aislado"
- **Testimonios reales**: 3 casos de uso con ratings
- **Doble CTA**: "Unirme al ecosistema" y "Soy parte del Grupo Servat"
- **Banner final**: Último impulso para conversión

### 🦶 Footer
- **Minimalista**: Información esencial sin saturar
- **Frase distintiva**: "Creado para conectar. Diseñado para evolucionar."
- **Links organizados**: Producto, Empresa, Legal
- **Contacto**: Email, teléfono, ubicación
- **Social media**: LinkedIn, Twitter, Instagram

## Paleta de Colores

| Elemento | Color | Uso |
|----------|-------|-----|
| Primario | Azul petróleo (#1e40af - #1d4ed8) | Elementos principales, CTAs |
| Secundario | Dorado tenue (#f59e0b - #d97706) | Acentos, highlights |
| Fondo | Blanco puro (#ffffff) | Backgrounds principales |
| Texto | Slate (#0f172a - #64748b) | Contenido y descripciones |
| Gradientes | Combinaciones dinámicas | Efectos visuales y botones |

## Animaciones

### Framer Motion
- **Entrada progresiva**: Elementos aparecen con delay escalonado
- **Hover effects**: Transformaciones suaves en cards y botones
- **Scroll animations**: Activación al entrar en viewport
- **Rotación continua**: Elementos de red y partículas
- **Scale effects**: Feedback visual en interacciones

### Efectos Especiales
- **Partículas flotantes**: 20 elementos animados en hero
- **Blur + Glow**: Efectos de profundidad en cards
- **Gradientes animados**: Transiciones de color suaves
- **Indicadores de estado**: Pulsos y animaciones de conexión

## Integración con Sistema Base

### Autenticación
- Utiliza `useAuth` hook existente
- Método `signInWithGoogle()` para login
- No modifica lógica de autenticación base
- Preserva configuración Firebase

### Componentes UI
- Reutiliza componentes de `/components/ui/`
- Button, Card, CardHeader, CardContent, etc.
- Mantiene consistencia visual con dashboard

### Rutas
- Se integra como página raíz `/`
- No interfiere con rutas del dashboard
- Redirección automática post-login

## Métricas y KPIs

### Conversión
- **Objetivo principal**: Registro con Google
- **Objetivo secundario**: Exploración del ecosistema
- **Métricas mostradas**: 2,341 usuarios, 27 empresas, S/ 1.25M comisiones

### Engagement
- **Scroll depth**: Medición de secciones visitadas
- **Time on page**: Tiempo de permanencia
- **Click-through rate**: Interacciones con CTAs

## Responsive Design

### Breakpoints
- **Mobile**: < 768px - Stack vertical, botones full-width
- **Tablet**: 768px - 1024px - Grid 2 columnas
- **Desktop**: > 1024px - Grid completo, efectos hover

### Adaptaciones
- **Hero**: Texto responsive, animaciones simplificadas en móvil
- **Cards**: Stack en móvil, hover effects solo desktop
- **Footer**: Collapse de secciones en pantallas pequeñas

## Performance

### Optimizaciones
- **Lazy loading**: Componentes se cargan bajo demanda
- **Animaciones**: GPU-accelerated con transform/opacity
- **Imágenes**: Placeholder SVG para avatars
- **Código**: Tree-shaking automático de componentes no usados

### Bundle Size
- **Componentes**: ~15KB adicionales
- **Animaciones**: Framer Motion ya incluido
- **Icons**: React Icons reutilizado

## Mantenimiento

### Actualizaciones de Contenido
- **Copy**: Modificar directamente en componentes
- **Métricas**: Actualizar números en IntegrationsSection
- **Testimonios**: Editar array en CTASection
- **Links**: Modificar en Footer

### Nuevas Integraciones
- **Agregar app**: Extender array en IntegrationsSection
- **Colores**: Definir gradientes en configuración
- **Estados**: Manejar active/coming-soon

### Monitoreo
- **Errores**: Console logs para debugging
- **Performance**: Métricas de carga y animaciones
- **Conversión**: Tracking de eventos de CTA

## Próximas Mejoras

### Funcionalidades
1. **A/B Testing**: Variantes de copy y CTAs
2. **Personalización**: Contenido dinámico por usuario
3. **Multilidioma**: Soporte español/inglés
4. **Analytics**: Integración con Google Analytics

### Técnicas
1. **PWA**: Service worker para cache
2. **SEO**: Meta tags dinámicos
3. **Accessibility**: ARIA labels y keyboard navigation
4. **Performance**: Image optimization y lazy loading

---

**Nota**: Este módulo mantiene total independencia del núcleo del sistema, siguiendo las reglas de gobernanza técnica establecidas. No modifica archivos base ni configuraciones globales.