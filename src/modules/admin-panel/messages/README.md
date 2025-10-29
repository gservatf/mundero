# Módulo de Mensajes - Panel Administrativo MUNDERO

## Descripción
Módulo de comunicación interna en tiempo real para el Panel Administrativo de MUNDERO, permitiendo chat entre usuarios, administradores y empresas del ecosistema.

## Estructura del Módulo

```
/src/modules/admin-panel/messages/
├── components/
│   ├── ChatList.tsx          → Lista de conversaciones
│   ├── ChatWindow.tsx        → Ventana de chat activa
│   ├── ChatInput.tsx         → Caja de envío de mensajes
│   └── MessageBubble.tsx     → Burbuja de mensaje individual
├── hooks/
│   └── useChat.ts            → Hook principal para manejo de estado
├── services/
│   └── messageService.ts     → Servicios de Firebase para mensajes
├── index.ts                  → Exportaciones del módulo
└── README.md                 → Esta documentación
```

## Funcionalidades Implementadas

### ✅ Completadas
1. **Gestión de Conversaciones**
   - Carga en tiempo real de conversaciones del usuario
   - Ordenamiento por último mensaje
   - Creación de nuevos chats

2. **Mensajería en Tiempo Real**
   - Listener de Firebase Firestore con `onSnapshot`
   - Envío de mensajes con actualización automática
   - Marcado de mensajes como leídos

3. **Interfaz de Usuario**
   - Lista lateral de conversaciones (estilo WhatsApp/Slack)
   - Ventana de chat principal con scroll automático
   - Burbujas de mensaje diferenciadas (enviado/recibido)
   - Búsqueda de usuarios para nuevos chats

4. **Seguridad y Autenticación**
   - Integración con Firebase Auth existente
   - Validación de `auth.uid` en todas las operaciones
   - Reglas de seguridad Firestore implementadas

5. **Notificaciones**
   - Sistema de notificaciones mock (preparado para Realtime DB)
   - Estado de "escribiendo..." (implementación base)

### 🔄 En Desarrollo
1. **Archivos e Imágenes**
   - Botones preparados pero funcionalidad deshabilitada
   - Estructura lista para Firebase Storage

2. **Notificaciones Push**
   - Integración con Firebase Cloud Messaging pendiente

## Estructura de Datos Firebase

### Colección `/chats/{chatId}`
```typescript
{
  members: string[];              // [uid1, uid2]
  lastMessage?: string;
  lastMessageTimestamp?: Timestamp;
  lastMessageSender?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Subcolección `/chats/{chatId}/messages/{messageId}`
```typescript
{
  senderId: string;
  text: string;
  timestamp: Timestamp;
  readBy: string[];
  type?: 'text' | 'image' | 'file';
  fileUrl?: string;
  fileName?: string;
}
```

### Notificaciones `/notifications/{recipientId}` (Realtime DB)
```typescript
{
  type: "message";
  from: string;
  chatId: string;
  text: string;
  timestamp: number;
}
```

## Reglas de Seguridad Firestore

```javascript
// Reglas para chats
match /chats/{chatId} {
  allow read, write: if request.auth != null && 
    request.auth.uid in resource.data.members;
  
  match /messages/{messageId} {
    allow read, write: if request.auth != null && 
      request.auth.uid in get(/databases/$(database)/documents/chats/$(chatId)).data.members;
  }
}
```

## Uso del Módulo

### Importación
```typescript
import { 
  ChatList, 
  ChatWindow, 
  useChat 
} from '../modules/admin-panel/messages';
```

### Implementación Básica
```typescript
const MessagesPage = () => {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  return (
    <div className="flex h-full">
      <div className="w-1/3 border-r">
        <ChatList 
          onChatSelect={setSelectedChatId}
          selectedChatId={selectedChatId}
        />
      </div>
      <div className="flex-1">
        {selectedChatId ? (
          <ChatWindow 
            chatId={selectedChatId}
            onBack={() => setSelectedChatId(null)}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            Selecciona una conversación
          </div>
        )}
      </div>
    </div>
  );
};
```

## Hook useChat

### Estado Disponible
- `chats`: Lista de conversaciones
- `messages`: Mensajes del chat actual
- `participants`: Participantes del chat
- `loading`: Estado de carga
- `sendingMessage`: Estado de envío

### Acciones Disponibles
- `selectChat(chatId)`: Seleccionar conversación
- `sendMessage(text, recipientId?)`: Enviar mensaje
- `createChat(recipientId)`: Crear nueva conversación
- `searchUsers(term)`: Buscar usuarios
- `setTyping(isTyping)`: Estado de escritura

## Integración con el Panel Admin

El módulo está diseñado para integrarse seamlessly con:
- Sistema de autenticación existente (`useAuth`)
- Componentes UI de shadcn/ui
- Estructura de roles y permisos de MUNDERO
- Firebase configuration existente

## Próximas Mejoras

1. **Funcionalidad de Archivos**
   - Subida de imágenes y documentos
   - Previsualización de archivos
   - Límites de tamaño y tipos

2. **Notificaciones Avanzadas**
   - Push notifications con FCM
   - Notificaciones de escritorio
   - Badges de mensajes no leídos

3. **Funciones Administrativas**
   - Moderación de chats
   - Logs de conversaciones
   - Reportes de actividad

4. **Mejoras de UX**
   - Emojis y reacciones
   - Mensajes de voz
   - Temas y personalización

## Mantenimiento

- Todos los listeners se limpian automáticamente
- Manejo de errores implementado en todos los servicios
- Logs detallados para debugging
- Estructura modular para fácil extensión