import React, { useEffect, useState } from 'react';

const imgSrc = '/lovable-uploads/WhatsApp_icon.png';

// How long the button stays rolled in (visible) per cycle.
const VISIBLE_MS = 15000;
// How long it stays rolled out (hidden) before showing again — 2 to 3 minutes.
const HIDDEN_MS = 150000;

const WhatsAppChat = () => {
  const whatsappNumber = '+2348070710688';
  const message =
    'Hello! I would like to know more about your properties and services.';
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

  // Starts visible so first-time visitors see it immediately, then begins
  // rolling in/out on a timer.
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const cycle = () => {
      timer = setTimeout(() => {
        setVisible((v) => !v);
      }, visible ? VISIBLE_MS : HIDDEN_MS);
    };

    cycle();
    return () => clearTimeout(timer);
  }, [visible]);

  return (
    <div
      className={[
        'fixed z-50',
        // Mobile: docked to the middle of the left edge.
        'top-1/2 left-0 -translate-y-1/2',
        // Desktop/tablet: back to the original bottom-left position.
        'lg:top-auto lg:bottom-6 lg:left-6 lg:translate-y-0',
        // Roll in/out horizontally; composes with the translate-y above.
        'transition-transform duration-700 ease-in-out',
        visible ? 'translate-x-0' : '-translate-x-[120%]',
      ].join(' ')}
      aria-hidden={!visible}
    >
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        tabIndex={visible ? 0 : -1}
        className="bg-green-500 hover:bg-green-600 text-white shadow-lg transition-all duration-300 hover:scale-110 animate-pulse-glow flex items-center justify-center lg:rounded-full rounded-r-full"
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
