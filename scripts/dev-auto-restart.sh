#!/bin/bash
echo "🚀 Iniciando servidor de desarrollo con reinicio automático..."

while true; do
  # Limpiar procesos previos
  pkill -f vite || pkill -f node || true

  # Ejecutar Vite
  pnpm run dev
  EXIT_CODE=$?

  # Verificar si fue terminado con SIGTERM (-15)
  if [ $EXIT_CODE -eq 255 ] || [ $EXIT_CODE -eq -15 ]; then
    echo "⚠️ Servidor Vite detenido externamente (SIGTERM). Reiniciando..."
    sleep 3
    continue
  else
    echo "🧩 Servidor detenido con código $EXIT_CODE. Saliendo del ciclo."
    break
  fi
done