import React, { useState } from "react";
import { useAgreement } from '../hooks/useAgreement';
import AgreementModal from '../components/AgreementModal';

export default function Messages() {
  const { requiresAgreement } = useAgreement();
  
  // Hooks siempre al nivel superior
  const [newMessage, setNewMessage] = useState("");

  // Control de acceso - bloquear si requiere acuerdo
  if (requiresAgreement) {
    return <AgreementModal isOpen={true} onClose={() => { }} />;
  }

  const handleSend = () => {
    if (!newMessage.trim()) return;
    console.log("Sending message:", newMessage);
    setNewMessage("");
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Messages</h2>
      <div className="border rounded-md p-4 h-80 overflow-y-auto bg-white shadow-sm mb-3">
        <p className="text-gray-500">Messages interface ready for integration</p>
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Type your message..."
          className="flex-1 border rounded px-3 py-1"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button
          onClick={handleSend}
          className="bg-blue-600 text-white px-4 py-1 rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
}
