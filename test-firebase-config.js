// test-firebase-config.js
// Script rápido para verificar que VITE_MUNDERO_API_KEY se lea correctamente

import { auth, analytics } from "./src/lib/firebaseConfig.js";

console.log("🔍 Verificando configuración Firebase...");
console.log("✅ Firebase Auth inicializado:", !!auth);
console.log("✅ Firebase Analytics inicializado:", !!analytics);
console.log("✅ ProjectId configurado:", auth.app.options.projectId);
console.log("✅ AuthDomain configurado:", auth.app.options.authDomain);

// Verificar variable de entorno
const apiKey = import.meta.env.VITE_MUNDERO_API_KEY;
console.log("🔑 VITE_MUNDERO_API_KEY encontrada:", !!apiKey);
console.log("🔑 Primeros caracteres:", apiKey?.substring(0, 10) + "...");

console.log("🎯 Configuración Firebase lista para login con Google");