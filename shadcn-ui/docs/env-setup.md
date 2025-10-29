# 🔒 Configuración de Variables de Entorno — LEGALITY360°

## Propósito
Evitar la pérdida de variables al hacer remix, deploy o rebuild automático en MGX.

## Estructura de Archivos
- `.env.local`: archivo local no versionado, fuente principal de variables
- `.env`: archivo temporal generado automáticamente durante el build
- `.gitignore`: contiene `.env.local`

## Flujo Automático
1. `prebuild` sincroniza `.env.local` → `.env`
2. Limpia caches y residuos de compilación
3. Ejecuta build limpio con variables aseguradas

## Entornos
- Local: `.env.local`
- MGX/Vercel/Render: Panel de Environment Variables