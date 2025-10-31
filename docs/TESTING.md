# 🧪 Testing Guide - MUNDERO Hub

Esta guía explica cómo configurar, ejecutar y depurar tests en el proyecto MUNDERO Hub usando Vitest + VS Code.

## 📋 Tabla de Contenidos

- [Configuración Inicial](#configuración-inicial)
- [Ejecutar Tests](#ejecutar-tests)
- [VS Code Testing UI](#vs-code-testing-ui)
- [Escribir Tests](#escribir-tests)
- [Coverage Reports](#coverage-reports)
- [CI/CD Integration](#cicd-integration)
- [Troubleshooting](#troubleshooting)

## 🚀 Configuración Inicial

### Prerrequisitos

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- VS Code con extensiones recomendadas

### Instalación

El proyecto ya incluye todas las dependencias necesarias:

```json
{
  "devDependencies": {
    "vitest": "^4.0.5",
    "@vitest/ui": "incluido",
    "@vitejs/plugin-react": "^4.3.3",
    "jsdom": "^27.0.1",
    "@testing-library/react": "^16.3.0",
    "@testing-library/jest-dom": "^6.9.1",
    "@testing-library/user-event": "^14.6.1"
  }
}
```

## 🔬 Ejecutar Tests

### Comandos Disponibles

```bash
# Ejecutar todos los tests (modo CI)
pnpm test

# Ejecutar tests en modo watch (desarrollo)
pnpm run test:watch

# Ejecutar tests con UI interactiva
pnpm run test:ui

# Generar coverage report
pnpm test -- --coverage
```

### Scripts de package.json

```json
{
  "scripts": {
    "test": "vitest --run",
    "test:run": "vitest run",
    "test:watch": "vitest watch",
    "test:ui": "vitest --ui",
    "type-check": "tsc --noEmit"
  }
}
```

## 🎯 VS Code Testing UI

### Activar el Panel de Testing

1. **Abrir Panel**: `Ctrl + Shift + ;` (Windows/Linux) o `Cmd + Shift + ;` (Mac)
2. **Configurar Framework**: Si aparece el prompt, seleccionar "Vitest"
3. **Auto-detección**: VS Code debería detectar automáticamente los tests

### Extensiones Recomendadas

```json
{
  "recommendations": [
    "vitest.explorer",
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss"
  ]
}
```

### Comandos de Testing en VS Code

- **Ejecutar test**: Click en ▶️ junto al test
- **Debug test**: Click en 🐛 junto al test
- **Ejecutar archivo**: Click en ▶️ en el archivo
- **Re-run failed**: Click en 🔄 en el panel

### Configuración de VS Code

Agregar a `.vscode/settings.json`:

```json
{
  "vitest.enable": true,
  "vitest.commandLine": "pnpm exec vitest",
  "typescript.preferences.includePackageJsonAutoImports": "on"
}
```

## ✍️ Escribir Tests

### Estructura de Archivos

```
src/
├── components/
│   ├── Button.tsx
│   └── Button.test.tsx
├── services/
│   ├── integrations.ts
│   └── integrations.test.ts
└── test/
    └── setup.ts
```

### Convenciones de Nombres

- **Unit tests**: `*.test.ts` / `*.test.tsx`
- **Integration tests**: `*.spec.ts` / `*.spec.tsx`
- **E2E tests**: `*.e2e.test.ts`

### Template Básico

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('should handle user interaction', async () => {
    const user = userEvent.setup();
    render(<MyComponent />);
    
    await user.click(screen.getByRole('button'));
    expect(screen.getByText('Clicked!')).toBeInTheDocument();
  });
});
```

### Mocking

```typescript
// Mock módulos
vi.mock('../lib/firebase', () => ({
  auth: { currentUser: null },
  db: {},
}));

// Mock funciones
const mockFunction = vi.fn();
mockFunction.mockReturnValue('mocked result');

// Mock API calls
vi.mock('../lib/apiClient', () => ({
  apiClient: {
    get: vi.fn().mockResolvedValue({ data: 'test' }),
    post: vi.fn(),
  },
}));
```

## 📊 Coverage Reports

### Generar Coverage

```bash
# Coverage básico
pnpm test -- --coverage

# Coverage con reporte HTML
pnpm test -- --coverage --coverage.reporter=html

# Coverage en watch mode
pnpm run test:watch -- --coverage
```

### Configuración de Coverage

En `vitest.config.ts`:

```typescript
export default defineConfig({
  test: {
    coverage: {
      provider: 'c8',
      reporter: ['text', 'lcov', 'html'],
      exclude: [
        'node_modules/**',
        'src/test/**',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
  },
});
```

### Archivos de Coverage

```
coverage/
├── lcov.info          # Para CI/CD
├── coverage-final.json # Datos raw
└── html/              # Reporte visual
    └── index.html
```

## 🔄 CI/CD Integration

### GitHub Actions

El proyecto incluye un workflow automático en `.github/workflows/test.yml`:

```yaml
name: 🧪 Tests & Quality Checks

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - name: Run tests
        run: pnpm test
```

### Checks Automáticos

✅ **Tests**: Todos los tests deben pasar  
✅ **Type Check**: Sin errores de TypeScript  
✅ **Lint**: Código debe cumplir estándares  
✅ **Build**: Proyecto debe compilar correctamente

### Branch Protection

Configurar en GitHub:
- Require status checks to pass
- Require branches to be up to date
- Include administrators

## 🔧 Troubleshooting

### Tests No Se Detectan

```bash
# Verificar configuración
cat vitest.config.ts

# Verificar patrones de archivos
find src -name "*.test.*" -o -name "*.spec.*"

# Reiniciar VS Code
Ctrl + Shift + P > "Developer: Reload Window"
```

### Import Errors

```typescript
// ❌ Evitar paths relativos largos
import { utils } from '../../../utils/helpers';

// ✅ Usar alias configurados
import { utils } from '@/utils/helpers';
```

### Mock Issues

```typescript
// ❌ Mock después del import
import { myFunction } from './module';
vi.mock('./module');

// ✅ Mock antes del import
vi.mock('./module');
import { myFunction } from './module';
```

### Performance Issues

```typescript
// En vitest.config.ts
export default defineConfig({
  test: {
    // Limitar workers en desarrollo
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },
    // Timeout más largo para debugging
    testTimeout: 30000,
  },
});
```

## 📚 Recursos Adicionales

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library React](https://testing-library.com/docs/react-testing-library/intro/)
- [Jest DOM Matchers](https://github.com/testing-library/jest-dom)
- [VS Code Testing](https://code.visualstudio.com/docs/editor/testing)

## 🆘 Soporte

Para problemas o preguntas:

1. **Revisar esta documentación**
2. **Buscar en Issues del proyecto**
3. **Crear nuevo Issue con detalles**
4. **Contactar al equipo de desarrollo**

---

**Última actualización**: Octubre 2025  
**Versión Vitest**: 4.0.5  
**Compatibilidad**: Node.js 18+, pnpm 8+