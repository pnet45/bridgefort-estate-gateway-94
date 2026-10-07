import { useLocation } from 'react-router-dom';
import FloatingMessageButton from '@/components/FloatingMessageButton';
import PropertyAssistant from '@/components/PropertyAssistant';
import WhatsAppChat from '@/components/WhatsAppChat';

const GlobalFloatingWidgets = () => {
  const { pathname } = useLocation();
  const isAdminRoute = pathname.startsWith('/admin-console');
  const isAuthRoute = pathname.startsWith('/admin-login') || pathname.startsWith('/admin-auth');

  if (isAuthRoute) return null;

  return (
    <>
      {!isAdminRoute && (
        <>
          <FloatingMessageButton />
          <WhatsAppChat />
        </>
      )}
      <PropertyAssistant adminRoute={isAdminRoute} />
    </>
  );
};

export default GlobalFloatingWidgets;
