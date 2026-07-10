
import React from 'react';
import { Toaster } from '@/components/ui/toaster';
import { PropertyProvider } from '../contexts/property';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import WhatsAppChat from '../components/WhatsAppChat';
import CareerHero from '../components/career/CareerHero';
import OpenPositions from '../components/career/OpenPositions';
import WhyJoinUs from '../components/career/WhyJoinUs';
import TeamCulture from '../components/career/TeamCulture';
import RealtorsSection from '../components/career/RealtorsSection';
import { useNavigate } from 'react-router-dom';

const Career = () => {
  const navigate = useNavigate();

  // Handler for OpenPositions child component
  const handleApplyClick = (position?: string) => {
    // Route to the application page with position as state
    navigate('/career/apply', { state: { position: position || '' } });
  };

  return (
    <PropertyProvider>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <CareerHero />
        <WhyJoinUs />
        <TeamCulture />
        <RealtorsSection />
        {/* Pass apply handler to OpenPositions */}
        <OpenPositions onApply={handleApplyClick} />
        <Footer />
        <Toaster />
        <WhatsAppChat />
      </div>
    </PropertyProvider>
  );
};

export default Career;
