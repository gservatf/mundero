# Script de validacion rapida para desarrollo
Write-Host "Validacion rapida MUNDERO v2.1..." -ForegroundColor Cyan

# Solo verificar tipos (mas rapido)
Write-Host "Verificando TypeScript..." -ForegroundColor Yellow
pnpm run type-check
if ($LASTEXITCODE -ne 0) {
  Write-Host "Errores de tipado encontrados" -ForegroundColor Red
  exit 1
}

Write-Host "Validacion rapida completada - Todo OK!" -ForegroundColor Green
Write-Host "Listo para continuar desarrollo" -ForegroundColor Cyan
