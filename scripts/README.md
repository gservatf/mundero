# Scripts de Validación CI/CD - MUNDERO v2.1

Este directorio contiene scripts de validación automatizada para garantizar la calidad del código antes de desplegar.

## Scripts Disponibles

### 🚀 `validate_ci.ps1` - Validación Completa CI/CD
```powershell
.\scripts\validate_ci.ps1
```

**Qué hace:**
- ✅ Verifica tipos TypeScript (0 errores)
- ✅ Ejecuta todas las pruebas (62 tests)
- ✅ Compila el proyecto para producción
- ✅ Reporta estado final del deployment

**Cuándo usar:** Antes de hacer push, merge, o deployment a producción.

### ⚡ `validate_quick.ps1` - Validación Rápida para Desarrollo
```powershell
.\scripts\validate_quick.ps1
```

**Qué hace:**
- ✅ Verifica tipos TypeScript únicamente
- ✅ Validación rápida durante desarrollo

**Cuándo usar:** Durante desarrollo activo, antes de commits.

## Pipeline CI/CD Recomendado

```bash
# 1. Desarrollo local
.\scripts\validate_quick.ps1

# 2. Antes de commit
.\scripts\validate_ci.ps1

# 3. En CI/CD server
.\scripts\validate_ci.ps1
```

## Estados de Salida

- **Exit Code 0**: ✅ Todo correcto, listo para deployment
- **Exit Code 1**: ❌ Error encontrado, revisa logs

## Integración con IDEs

### VS Code
Puedes agregar estas tareas a `.vscode/tasks.json`:

```json
{
  "label": "Validate CI/CD",
  "type": "shell",
  "command": ".\\scripts\\validate_ci.ps1",
  "group": "build",
  "presentation": {
    "reveal": "always",
    "panel": "new"
  }
}
```

## Troubleshooting

### Error de PowerShell Execution Policy
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Error de encoding en emojis
Los scripts están optimizados para PowerShell Windows con encoding UTF-8.

---

**MUNDERO v2.1** - Sistema de validación continua para desarrollo estable.