
import React from 'react';
import { MessageCircle } from 'lucide-react';

const WhatsAppChat = () => {
  const whatsappNumber = '+2348070710688';
  const message = 'Hello! I would like to know more about your properties and services.';
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 animate-pulse-glow"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle size={34} />
      </a>
    </div>
  );
};

export default WhatsAppChat;
