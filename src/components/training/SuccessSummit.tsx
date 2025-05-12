
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import TrainingRegistrationForm from './TrainingRegistrationForm';
import SummitEventInfo from './summit/SummitEventInfo';
import SummitDetailsDialog from './summit/SummitDetailsDialog';

const SuccessSummit = () => {
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  const openRegistration = () => setIsRegistrationOpen(true);
  const closeRegistration = () => setIsRegistrationOpen(false);
  
  return (
    <section className="relative py-16 bg-gradient-to-r from-estate-blue to-purple-900 text-white">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              JOIN US FOR THE BIGGEST SUCCESS SUMMIT OF THE YEAR – MAY 2025!
            </h2>
            
            <p className="text-lg mb-8">
              Get ready for an unforgettable experience at the MAY 2025 SUCCESS SUMMIT — LIVE in Port Harcourt!
            </p>
            
            <SummitEventInfo />
            
            <div className="flex flex-wrap gap-4">
              <Button 
                onClick={openRegistration}
                className="bg-estate-red hover:bg-red-700 text-white font-medium py-3 px-8 rounded-lg transition duration-300"
              >
                Register Now
              </Button>
              
              <SummitDetailsDialog 
                isOpen={isDetailsOpen} 
                setIsOpen={setIsDetailsOpen}
                onRegisterClick={openRegistration}
              />
            </div>
          </div>
          
          <div className="relative">
            <img 
              src="/lovable-uploads/e96b32e6-88d0-4155-8c87-cbe499a239d3.png" 
              alt="Success Summit 2025" 
              className="rounded-lg shadow-lg w-full h-auto"
            />
            <div className="absolute top-4 right-4 bg-estate-red text-white text-sm uppercase font-bold py-1 px-3 rounded">
              Don't Miss!
            </div>
          </div>
        </div>
      </div>
      
      {/* Training Registration Form */}
      <TrainingRegistrationForm 
        open={isRegistrationOpen} 
        onClose={closeRegistration} 
        eventTitle="SUCCESS SUMMIT 2025"
        eventDate="Monday, May 12th, 2025"
      />
    </section>
  );
};

export default SuccessSummit;
