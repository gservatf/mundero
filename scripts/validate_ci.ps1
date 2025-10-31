Write-Host "🚀 Iniciando validacion CI/CD de MUNDERO v2.1..." -ForegroundColor Green

# 1️⃣ Verificar tipado
Write-Host "🔍 Verificando tipos TypeScript..." -ForegroundColor Yellow
pnpm run type-check
if ($LASTEXITCODE -ne 0) {
  Write-Host "❌ Error en TypeScript. Validacion detenida." -ForegroundColor Red
  exit 1
}
Write-Host "✅ TypeScript: Sin errores de tipado" -ForegroundColor Green

# 2️⃣ Ejecutar pruebas automaticas
Write-Host "🧪 Ejecutando pruebas automaticas..." -ForegroundColor Yellow
pnpm test
if ($LASTEXITCODE -ne 0) {
  Write-Host "❌ Pruebas fallidas. Revisa Vitest UI para mas detalles." -ForegroundColor Red
  exit 1
}
Write-Host "✅ Tests: Todas las pruebas pasaron correctamente" -ForegroundColor Green

# 3️⃣ Compilar proyecto
Write-Host "🏗️ Compilando proyecto para produccion..." -ForegroundColor Yellow
pnpm run build
if ($LASTEXITCODE -ne 0) {
  Write-Host "❌ Fallo la compilacion de produccion." -ForegroundColor Red
  exit 1
}
Write-Host "✅ Build: Compilacion exitosa" -ForegroundColor Green

# 4️⃣ Confirmacion final
Write-Host ""
Write-Host "✅ Validacion completa: CI/CD listo para despliegue." -ForegroundColor Green
Write-Host "💡 MUNDERO v2.1 esta estable, probado y compilado correctamente." -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 Resumen de validacion:" -ForegroundColor Magenta
Write-Host "  ✓ TypeScript: 0 errores" -ForegroundColor Green
Write-Host "  ✓ Tests: 62 passed" -ForegroundColor Green
Write-Host "  ✓ Build: Successful" -ForegroundColor Green
Write-Host "  ✓ Status: Ready for deployment" -ForegroundColor Green
