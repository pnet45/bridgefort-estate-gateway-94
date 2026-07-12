import { useLocation } from 'react-router-dom';
import FloatingMessageButton from '@/components/FloatingMessageButton';
import WhatsAppChat from '@/components/WhatsAppChat';

// The "Send Message" floating button and WhatsApp chat bubble are mounted
// globally for the public-facing site, but shouldn't appear inside the
// admin console — they clutter the console UI and aren't meant for admins.
const ADMIN_PATH_PREFIXES = ['/admin-console', '/admin-login'];

const GlobalFloatingWidgets = () => {
  const { pathname } = useLocation();
  const isAdminRoute = ADMIN_PATH_PREFIXES.some((p) => pathname.startsWith(p));

  if (isAdminRoute) return null;

  return (
    <>
      <FloatingMessageButton />
      <WhatsAppChat />
    </>
  );
};

export default GlobalFloatingWidgets;
