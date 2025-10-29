import fs from "fs"
import path from "path"

const ROOT = path.resolve(process.cwd(), "src")
let removedCount = 0
let hitIndexExports = 0

function cleanFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8")

  // Remueve cualquier import o reexport del paquete fantasma
  const cleaned = content
    .replace(/import\s+.*?['"]@radix-ui\/react-button['"];?\n?/g, "")
    .replace(/export\s+.*?from\s+['"]@radix-ui\/react-button['"];?\n?/g, "")

  if (cleaned !== content) {
    fs.writeFileSync(filePath, cleaned, "utf8")
    removedCount++
    console.log(`🧹 Limpieza aplicada en: ${filePath}`)
  }

  if (/@radix-ui\/react-button/.test(cleaned)) hitIndexExports++
}

function walk(dir) {
  for (const file of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, file)
    const stat = fs.statSync(fullPath)
    if (stat.isDirectory()) walk(fullPath)
    else if (file.endsWith(".ts") || file.endsWith(".tsx")) cleanFile(fullPath)
  }
}

// 🔥 Búsqueda principal
walk(ROOT)

// 🔥 Segundo barrido: valida si el import está en node_modules
const vendorHit = fs
  .existsSync("node_modules")
  ? execCheck("grep -R '@radix-ui/react-button' node_modules | head -3")
  : ""

function execCheck(cmd) {
  try {
    return require("child_process").execSync(cmd, { encoding: "utf8" })
  } catch {
    return ""
  }
}

console.log(`
✅ Purificación completada.
Imports eliminados: ${removedCount}
Reexports detectados: ${hitIndexExports}
Vendor references: ${vendorHit ? "⚠️ Encontradas (ver arriba)" : "✅ Ninguna"}
`)
if (vendorHit || hitIndexExports > 0) {
  console.error("❌ Aún existen referencias residuales de @radix-ui/react-button.")
  process.exit(1)
}