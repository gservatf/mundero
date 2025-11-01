# Configuración de GitHub Secrets para Deployment

## Secrets Requeridos

Para que el workflow de GitHub Actions funcione correctamente, necesitas configurar los siguientes secrets en tu repositorio:

### 1. FIREBASE_TOKEN (Deploy)
- Name: `FIREBASE_TOKEN`
- Value: [Token generado con `firebase login:ci`]

### 2. Variables de Firebase (Build)
| Secret Name | Example Value |
|---|---|
| `VITE_FIREBASE_API_KEY` | `AIzaSyDH36xJWH3Xxmv7BsIrrHHP9ts3EOmOtK0` |
| `VITE_FIREBASE_AUTH_DOMAIN` | `mundero360.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | `mundero360` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `mundero360.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `599385299146` |
| `VITE_FIREBASE_APP_ID` | `1:599385299146:web:2f1ac9b1cab370e6a4fc33` |
| `VITE_FIREBASE_MEASUREMENT_ID` | `G-X736D9JQGX` |
| `VITE_MUNDERO_API_KEY` | `clave-secreta-interna` |

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