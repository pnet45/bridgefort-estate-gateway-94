
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PreciousSilvaProfile from './PreciousSilvaProfile';

const SuccessSummit = () => {
  const [expanded, setExpanded] = useState(false);

  return (
    <section className="py-16 bg-white">
      <div className="container-custom">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="flex flex-col space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-estate-blue">
              JOIN US FOR THE BIGGEST SUCCESS SUMMIT OF THE YEAR – MAY 2025!
            </h2>
            
            <p className="text-lg">
              Get ready for an unforgettable experience at the MAY 2025 SUCCESS SUMMIT — LIVE in Port Harcourt!
            </p>
            
            <div className="flex flex-col space-y-2">
              <div className="flex items-center gap-2">
                <Calendar size={20} className="text-estate-red" />
                <span className="font-medium">Monday, May 12th, 2025</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock size={20} className="text-estate-red" />
                <span className="font-medium">10:00 AM Prompt</span>
              </div>
              
              <div className="flex items-center gap-2">
                <MapPin size={20} className="text-estate-red" />
                <span className="font-medium">Autograph Event Center, Sanni Abacha Road, Port Harcourt, Rivers State</span>
              </div>
            </div>
            
            <AnimatePresence>
              {expanded && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-bold text-lg">Host/Event Speaker:</h3>
                      <p>Dr. Precious Silva</p>
                      <p>MD/CEO, PWAN Bridgefort</p>
                      <p className="mt-1">Renowned leadership expert, wealth strategist, and transformational speaker, Dr. Silva will be delivering deep, actionable insights to empower and reposition you for sustainable success.</p>
                    </div>
                    
                    <div>
                      <h3 className="font-bold text-lg">Host:</h3>
                      <p>Dr. Julius Oyedemi</p>
                      <p>Acting Managing Director, PWAN Group</p>
                    </div>
                    
                    <div>
                      <h3 className="font-bold text-lg">Chief Host:</h3>
                      <p>Dr. Michael Afamefuna Okonkwo</p>
                      <p>Executive Chairman, PWAN Group</p>
                    </div>
                    
                    <div>
                      <h3 className="font-bold text-lg">Founder & Convener:</h3>
                      <p>Jayne O. Onwumere</p>
                      <p>Founder/President, PWAN Group</p>
                    </div>
                    
                    <div className="pt-2">
                      <p className="font-bold text-lg">Admission is FREE!</p>
                      <p>Food & Drinks available.</p>
                      <p className="mt-4 font-bold italic">PWAN GROUP — Making Home Ownership Dreams a Reality!</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            <Button 
              variant="outline" 
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-2 max-w-fit"
            >
              {expanded ? (
                <>
                  View Less <ChevronUp size={16} />
                </>
              ) : (
                <>
                  View More <ChevronDown size={16} />
                </>
              )}
            </Button>
            
            <Button className="bg-estate-red hover:bg-red-700 text-white max-w-fit">
              Register Now
            </Button>
          </div>
          
          <div className="space-y-6">
            <div className="relative">
              <img 
                src="/lovable-uploads/45a1964f-920e-46ef-b23a-31c95fe79867.png" 
                alt="Success Summit 2025" 
                className="w-full h-auto rounded-lg object-cover shadow-lg" 
              />
              <div className="absolute top-0 right-0 bg-estate-red text-white px-4 py-2 rounded-bl-lg font-bold">
                MAY 2025
              </div>
            </div>
            
            {/* Dr. Precious Silva Profile */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <PreciousSilvaProfile />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SuccessSummit;
