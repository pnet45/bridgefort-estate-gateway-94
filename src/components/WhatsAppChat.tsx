
import React from 'react';

// New WhatsApp logo uploaded as: /lovable-uploads/985da183-5e59-4f48-9f0f-35b5e841d5dd.png
const imgSrc = '/lovable-uploads/WhatsApp_icon.png';

const WhatsAppChat = () => {
  const whatsappNumber = '+2348070710688';
  const message =
    'Hello! I would like to know more about your properties and services.';
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg transition-all duration-300 hover:scale-110 animate-pulse-glow flex items-center justify-center"
        aria-label="Chat on WhatsApp"
        style={{
          width: 56,
          height: 56,
          padding: 0,
        }}
      >
        <img
          src={imgSrc}
          alt="WhatsApp"
          style={{ width: 34, height: 34, display: 'block' }}
        />
      </a>
    </div>
  );
};

export default WhatsAppChat;
