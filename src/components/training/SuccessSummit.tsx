
import React from 'react';
import { Calendar, MapPin, Users, Award } from 'lucide-react';
import SummitDetailsDialog from './summit/SummitDetailsDialog';

const SuccessSummit = () => {
  return (
    <section className="relative py-20 bg-cover bg-center bg-no-repeat" 
             style={{ backgroundImage: 'url(/lovable-uploads/32104260-589d-4ad1-b846-3cf494e6c069.jpg)' }}>
      <div className="absolute inset-0 bg-black bg-opacity-70"></div>
      <div className="relative z-10 container-custom text-center text-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-bold mb-6 text-white animate-scale-in">
            JOIN US FOR THE BIGGEST SUCCESS SUMMIT OF THE YEAR – MAY 2025!
          </h2>
          <p className="text-xl md:text-2xl mb-8 animate-fade-in">
            Transform Your Real Estate Journey with Industry Leaders and Expert Insights
          </p>
          
          <div className="grid md:grid-cols-4 gap-6 mb-10">
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6 animate-box-in">
              <Calendar className="h-8 w-8 mx-auto mb-3 text-estate-red" />
              <h3 className="font-semibold mb-2">Date</h3>
              <p className="text-sm">May 2025</p>
            </div>
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6 animate-box-in">
              <MapPin className="h-8 w-8 mx-auto mb-3 text-estate-red" />
              <h3 className="font-semibold mb-2">Location</h3>
              <p className="text-sm">Lagos, Nigeria</p>
            </div>
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6 animate-box-in">
              <Users className="h-8 w-8 mx-auto mb-3 text-estate-red" />
              <h3 className="font-semibold mb-2">Expected</h3>
              <p className="text-sm">1000+ Attendees</p>
            </div>
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6 animate-box-in">
              <Award className="h-8 w-8 mx-auto mb-3 text-estate-red" />
              <h3 className="font-semibold mb-2">Speakers</h3>
              <p className="text-sm">Industry Experts</p>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4 animate-fade-in">
            <SummitDetailsDialog />
            <a 
              href="tel:+2348030624059" 
              className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-estate-blue font-bold py-3 px-8 rounded-lg transition duration-300"
            >
              Call to Register
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SuccessSummit;
