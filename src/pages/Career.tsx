
import React, { useState } from 'react';
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
// Import Sheet from shadcn/ui
import { Sheet, SheetContent } from "@/components/ui/sheet";
import CareerForm from '../components/career/CareerForm';

const Career = () => {
  // State for controlling form sidebar/modal
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<string | undefined>(undefined);

  // Handler for OpenPositions child component
  const handleApplyClick = (position?: string) => {
    setSelectedPosition(position || undefined);
    setIsFormOpen(true);
    // Scroll lock handled by shadcn sheet
  };

  // Close the form
  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedPosition(undefined);
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

        {/* The Application Form is now only visible in a sidebar, not the page */}
        <Sheet open={isFormOpen} onOpenChange={v => { if (!v) handleFormClose(); }}>
          <SheetContent side="right" className="max-w-lg w-full p-0 overflow-y-auto">
            <div className="h-full flex flex-col bg-gray-50 p-8 animate-fade-in">
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold mb-3 animate-scale-in">Apply to Join Our Team</h2>
                <p className="text-gray-600 max-w-2xl mx-auto animate-fade-in">
                  Take the first step towards an exciting career with PWAN Bridgefort. Submit your application and we'll be in touch.
                </p>
              </div>
              <div className="flex-grow min-h-0 overflow-y-auto" style={{ maxHeight: "calc(100vh - 120px)" }}>
                {/* Pass defaultPosition */}
                <CareerForm defaultPosition={selectedPosition} />
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* The section below is REMOVED to prevent double display */}
        {/* 
        <div className="bg-gray-50 py-16 animate-fade-in">
          ... (old always-on form section) ...
        </div>
        */}

        <Footer />
        <Toaster />
        <WhatsAppChat />
      </div>
    </PropertyProvider>
  );
};

export default Career;
