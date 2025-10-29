/**
 * AUTO-HEAL DUAL GUARD
 * Restaura automáticamente variables críticas de Firebase y Supabase.
 * Gabriel Servat © Grupo Servat — 2025
 */
import fs from "fs";
import path from "path";

const envPath = path.resolve(process.cwd(), ".env");
const localEnv = path.resolve(process.cwd(), ".env.production.local");
const backupDir = path.resolve(process.cwd(), "env_protection");

function log(msg, icon = "🧩") {
  console.log(`${icon} ${msg}`);
}

function healEnv() {
  const ensureFile = (source, target) => {
    if (!fs.existsSync(target)) {
      log(`Archivo perdido: ${target}. Restaurando desde ${source}`, "⚠️");
      fs.copyFileSync(source, target);
    }
  };

  ensureFile(localEnv, envPath);

  const envContent = fs.readFileSync(envPath, "utf8");

  const criticalVars = [
    "VITE_FIREBASE_API_KEY",
    "VITE_FIREBASE_AUTH_DOMAIN",
    "VITE_FIREBASE_PROJECT_ID",
    "VITE_FIREBASE_APP_ID",
    "VITE_SUPABASE_URL",
    "VITE_SUPABASE_ANON_KEY"
  ];

  const missingVars = criticalVars.filter(v => !envContent.includes(v));

  if (missingVars.length > 0) {
    log(`⚠️ Variables faltantes detectadas: ${missingVars.join(", ")}`, "🩺");

    const backups = fs.existsSync(backupDir)
      ? fs.readdirSync(backupDir)
          .filter(f => f.startsWith(".env_"))
          .sort()
          .reverse()
      : [];

    if (backups.length > 0) {
      const lastBackup = path.join(backupDir, backups[0]);
      log(`🗄️ Restaurando desde backup más reciente: ${lastBackup}`);
      fs.copyFileSync(lastBackup, envPath);
      log("✅ Variables críticas restauradas correctamente.");
    } else {
      log("🚨 No se encontró backup disponible. Ejecuta pnpm run persistEnv manualmente.");
    }
  } else {
    log("✅ Variables Firebase + Supabase verificadas: sanas y completas.");
  }
}

healEnv();