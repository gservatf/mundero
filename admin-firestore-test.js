// admin-firestore-test.js
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "./src/lib/firebaseConfig.js";

console.log("🔧 Probando configuración de Firestore para Admin Panel...");

async function testAdminFirestore() {
  try {
    // Verificar configuración básica
    console.log("✅ ProjectId:", db.app.options.projectId);
    console.log("✅ AuthDomain:", db.app.options.authDomain);
    
    // Probar colecciones del admin panel
    const collections = ["users", "companies", "solutions", "org_solutions"];
    
    for (const collectionName of collections) {
      try {
        console.log(`📖 Leyendo colección '${collectionName}'...`);
        const querySnapshot = await getDocs(collection(db, collectionName));
        console.log(`✅ Colección '${collectionName}': ${querySnapshot.size} documentos`);
        
        // Mostrar algunos datos de ejemplo si existen
        if (querySnapshot.size > 0) {
          const firstDoc = querySnapshot.docs[0];
          console.log(`   📄 Ejemplo: ${firstDoc.id} ->`, Object.keys(firstDoc.data()).slice(0, 3));
        }
      } catch (error) {
        console.log(`⚠️ Colección '${collectionName}': ${error.message}`);
      }
    }
    
    console.log("🎯 Prueba de Firestore completada!");
    
  } catch (error) {
    console.error("❌ Error en prueba Firestore:", error.message);
    console.error("📋 Detalles:", error);
  }
}

testAdminFirestore();