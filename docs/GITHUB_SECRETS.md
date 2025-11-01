# Configuración de GitHub Secrets para Deployment

## Secrets Requeridos

Para que el workflow de GitHub Actions funcione correctamente, necesitas configurar los siguientes secrets en tu repositorio:

### 1. FIREBASE_TOKEN

1. **Generar el token de Firebase:**
   ```bash
   firebase login:ci
   ```
   Esto abrirá el navegador para autenticarte y luego mostrará un token.

2. **Agregar el secret en GitHub:**
   - Ve a tu repositorio en GitHub
   - Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `FIREBASE_TOKEN`
   - Value: [el token generado anteriormente]

### 2. Environment Protection (Opcional pero recomendado)

1. **Configurar ambiente de producción:**
   - Settings → Environments
   - Click "New environment"
   - Name: `production`
   - Configura protection rules si deseas

## Verificación

Una vez configurados los secrets, el workflow debería ejecutarse sin errores. El warning en el linter sobre "Context access might be invalid" es normal y desaparecerá una vez que el secret esté configurado.

## Troubleshooting

- **Error de autenticación:** Verifica que el FIREBASE_TOKEN sea válido
- **Proyecto no encontrado:** Asegúrate de que el projectId en el workflow coincida con tu proyecto de Firebase
- **Permisos insuficientes:** El token debe tener permisos de deploy para Firebase Hosting

## Estado del Workflow

El workflow actual:
- ✅ Job unificado `build_and_deploy` para mayor simplicidad
- ✅ Construye la aplicación usando Vite con pnpm
- ✅ Despliega directamente usando Firebase CLI con token seguro
- ✅ Especifica project ID explícitamente (`mundero360`)
- ✅ Usa `npx firebase` para evitar instalación global
- ⚠️ Muestra warning de linter (normal hasta configurar secret)

### Comando de Deploy
```bash
npx firebase deploy --only hosting --project mundero360 --token "${{ secrets.FIREBASE_TOKEN }}"
```

Este comando:
- Usa `npx` para ejecutar Firebase CLI sin instalación global
- Despliega solo Firebase Hosting (`--only hosting`)
- Especifica el proyecto explícitamente (`--project mundero360`)
- Usa el token desde GitHub Secrets de forma segura