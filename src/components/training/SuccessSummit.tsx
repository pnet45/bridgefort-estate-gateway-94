
import React, { useState } from 'react';
import { Calendar, MapPin, Clock, Users, ArrowRight, X } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import TrainingRegistrationForm from './TrainingRegistrationForm';

const SuccessSummit = () => {
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  const openRegistration = () => setIsRegistrationOpen(true);
  const closeRegistration = () => setIsRegistrationOpen(false);
  
  const openDetails = () => setIsDetailsOpen(true);
  const closeDetails = () => setIsDetailsOpen(false);
  
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
            
            <div className="space-y-4 mb-8">
              <div className="flex items-center">
                <Calendar className="mr-3 text-estate-red" />
                <span className="text-lg">Monday, May 12th, 2025</span>
              </div>
              
              <div className="flex items-center">
                <Clock className="mr-3 text-estate-red" />
                <span className="text-lg">10:00 AM Prompt</span>
              </div>
              
              <div className="flex items-center">
                <MapPin className="mr-3 text-estate-red" />
                <span className="text-lg">Autograph Event Center, Sanni Abacha Road, Port Harcourt</span>
              </div>
              
              <div className="flex items-center">
                <Users className="mr-3 text-estate-red" />
                <span className="text-lg">Admission is FREE! Food & Drinks available.</span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <Button 
                onClick={openRegistration}
                className="bg-estate-red hover:bg-red-700 text-white font-medium py-3 px-8 rounded-lg transition duration-300"
              >
                Register Now
              </Button>
              
              <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline"
                    className="border-white text-white hover:bg-white hover:text-estate-blue font-medium py-3 px-8 rounded-lg transition duration-300"
                    onClick={openDetails}
                  >
                    View Summit Details <ArrowRight className="ml-2" size={16} />
                  </Button>
                </DialogTrigger>
                
                <DialogContent className="max-w-3xl p-0">
                  <div className="relative">
                    <img 
                      src="/lovable-uploads/e96b32e6-88d0-4155-8c87-cbe499a239d3.png" 
                      alt="Success Summit 2025" 
                      className="w-full h-64 object-cover object-center"
                    />
                    <DialogClose className="absolute top-2 right-2 bg-estate-blue bg-opacity-75 p-1 rounded-full">
                      <X className="text-white" />
                    </DialogClose>
                    <div className="absolute top-4 left-4 bg-estate-red text-white text-sm uppercase font-bold py-1 px-3 rounded">
                      May 2025
                    </div>
                  </div>
                  
                  <ScrollArea className="p-6 max-h-[60vh]">
                    <h2 className="text-2xl font-bold mb-4 text-estate-blue">SUCCESS SUMMIT 2025</h2>
                    
                    <p className="text-lg mb-6">
                      Get ready for an unforgettable experience at the MAY 2025 SUCCESS SUMMIT — LIVE in Port Harcourt!
                    </p>
                    
                    <div className="mb-6">
                      <h3 className="text-xl font-bold mb-3">Host/Event Speaker:</h3>
                      <div className="flex items-center mb-4">
                        <img 
                          src="/lovable-uploads/985da183-5e59-4f48-9f0f-35b5e841d5dd.png" 
                          alt="Dr. Dalvin Silva" 
                          className="w-16 h-16 rounded-full object-cover mr-4"
                        />
                        <div>
                          <p className="font-bold">Dr. Dalvin Silva, PhD</p>
                          <p className="text-gray-600">MD/CEO, PWAN Bridgefort</p>
                        </div>
                      </div>
                      <p className="text-gray-700">
                        Renowned leadership expert, wealth strategist, and transformational speaker, Dr. Silva will be delivering deep, actionable insights to empower and reposition you for sustainable success.
                      </p>
                    </div>
                    
                    <div className="mb-6">
                      <h3 className="text-xl font-bold mb-3">Host:</h3>
                      <div className="flex items-center">
                        <img 
                          src="/lovable-uploads/d22fc324-491b-4130-abe6-8ca58eea41f5.png" 
                          alt="Dr. Julius Oyedemi" 
                          className="w-16 h-16 rounded-full object-cover mr-4"
                        />
                        <div>
                          <p className="font-bold">Dr. Julius Oyedemi</p>
                          <p className="text-gray-600">Acting Managing Director, PWAN Group</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <h3 className="text-xl font-bold mb-3">Chief Host:</h3>
                      <div className="flex items-center">
                        <img 
                          src="/lovable-uploads/2ef7dd06-9cf0-458d-b8a2-9e82f2a5cf26.png" 
                          alt="Dr. Michael Afamefuna Okonkwo" 
                          className="w-16 h-16 rounded-full object-cover mr-4"
                        />
                        <div>
                          <p className="font-bold">Dr. Michael Afamefuna Okonkwo</p>
                          <p className="text-gray-600">Executive Chairman, PWAN Group</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <h3 className="text-xl font-bold mb-3">Founder & Convener:</h3>
                      <div className="flex items-center">
                        <img 
                          src="/lovable-uploads/2c263077-7d02-4a8a-a3f5-0ce73e9c72e2.png" 
                          alt="Jayne O. Onwumere" 
                          className="w-16 h-16 rounded-full object-cover mr-4"
                        />
                        <div>
                          <p className="font-bold">Jayne O. Onwumere</p>
                          <p className="text-gray-600">Founder/President, PWAN Group</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-8">
                      <p className="flex items-center text-gray-700">
                        <Calendar size={18} className="mr-3 text-estate-blue" />
                        <span>Monday, May 12th, 2025</span>
                      </p>
                      <p className="flex items-center text-gray-700">
                        <Clock size={18} className="mr-3 text-estate-blue" />
                        <span>10:00 AM Prompt</span>
                      </p>
                      <p className="flex items-center text-gray-700">
                        <MapPin size={18} className="mr-3 text-estate-blue" />
                        <span>Autograph Event Center, Sanni Abacha Road, Port Harcourt, Rivers State</span>
                      </p>
                    </div>
                    
                    <p className="text-lg font-medium mb-4">
                      Don't miss this life-changing opportunity to connect, learn, and grow with some of the most visionary minds in business and leadership.
                    </p>
                    
                    <div className="bg-gray-100 p-4 rounded-md mb-4">
                      <p className="font-bold text-estate-blue">Admission is FREE!</p>
                      <p>Food & Drinks available.</p>
                    </div>
                    
                    <p className="text-center font-bold text-estate-blue">
                      PWAN GROUP — Making Home Ownership Dreams a Reality!
                    </p>
                    
                    <div className="mt-6">
                      <Button 
                        onClick={() => {
                          closeDetails();
                          openRegistration();
                        }}
                        className="w-full bg-estate-red hover:bg-red-700 text-white py-3"
                      >
                        Register for this Event
                      </Button>
                    </div>
                  </ScrollArea>
                </DialogContent>
              </Dialog>
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
