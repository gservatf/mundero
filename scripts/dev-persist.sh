#!/bin/bash
echo "🔁 MUNDERO Hub – Dev Server Persistente"

while true; do
  echo "🚀 Iniciando Vite en puerto 5173..."
  pnpm run dev -- --port=5173 &
  PID=$!

  # Espera a que Vite muera o sea terminado
  wait $PID
  EXIT_CODE=$?

  if [ $EXIT_CODE -eq 255 ] || [ $EXIT_CODE -eq -15 ]; then
    echo "⚠️  Vite detenido (SIGTERM). Reiniciando..."
    sleep 2
    continue
  else
    echo "🧩 Servidor Vite detenido con código $EXIT_CODE. Saliendo del loop."
    break
  fi
done