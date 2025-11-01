// firebase-storage-config.js
// Configuración de Firebase Storage para Mundero

const storageConfig = {
  // URL base para Firebase Storage
  baseStorageUrl: "https://firebasestorage.googleapis.com/v0/b/mundero360.appspot.com/o/",
  
  // Función helper para generar URLs de Storage
  getStorageUrl: (imagePath) => {
    const encodedPath = encodeURIComponent(imagePath);
    return `https://firebasestorage.googleapis.com/v0/b/mundero360.appspot.com/o/${encodedPath}?alt=media`;
  },
  
  // Reglas de seguridad recomendadas para Storage
  securityRules: `
    rules_version = '2';
    service firebase.storage {
      match /b/{bucket}/o {
        // Permitir lectura pública para imágenes de la web
        match /public/{allPaths=**} {
          allow read: if true;
        }
        
        // Restricción por dominio para mayor seguridad
        match /assets/{allPaths=**} {
          allow read: if request.headers.origin in [
            'https://mundero360.web.app',
            'https://mundero360.firebaseapp.com',
            'http://localhost:5173',
            'http://localhost:5174',
            'http://localhost:5175',
            'http://localhost:5176'
          ];
        }
        
        // Solo usuarios autenticados para uploads
        match /uploads/{allPaths=**} {
          allow read, write: if request.auth != null;
        }
      }
    }
  `
};

console.log("🔧 Firebase Storage Configuration:");
console.log("✅ Base URL:", storageConfig.baseStorageUrl);
console.log("💡 Para aplicar reglas de seguridad, copia el contenido de 'securityRules' en:");
console.log("   Firebase Console → Storage → Rules");

export default storageConfig;