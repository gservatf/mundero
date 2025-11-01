// test-firestore-connection.js
import { collection, getDocs, addDoc } from "firebase/firestore";
import { db } from "./src/lib/firebaseConfig.js";

console.log("🔍 Probando conexión a Firestore...");

async function testFirestoreConnection() {
  try {
    // Verificar configuración
    console.log("✅ ProjectId configurado:", db.app.options.projectId);
    console.log("✅ AuthDomain configurado:", db.app.options.authDomain);
    
    // Probar lectura de una colección de prueba
    console.log("📖 Intentando leer colección 'test'...");
    const querySnapshot = await getDocs(collection(db, "test"));
    console.log("✅ Conexión exitosa! Documentos encontrados:", querySnapshot.size);
    
    // Probar escritura (opcional)
    console.log("📝 Intentando escribir documento de prueba...");
    const docRef = await addDoc(collection(db, "test"), {
      message: "Conexión Firestore funcionando",
      timestamp: new Date(),
      from: "Mundero Test"
    });
    console.log("✅ Documento creado con ID:", docRef.id);
    
    console.log("🎯 Firestore completamente funcional!");
    
  } catch (error) {
    console.error("❌ Error en conexión Firestore:", error.message);
    console.error("📋 Detalles del error:", error);
  }
}

testFirestoreConnection();