
import React, { useState } from 'react';
import { MapPin, TrendingUp, Users, Award, Download } from 'lucide-react';
import EstateListDialog from '../estate/EstateListDialog';

const RealtorsSection = () => {
  const [isEstateListOpen, setIsEstateListOpen] = useState(false);

  const benefits = [
    {
      icon: MapPin,
      title: "Nationwide Coverage",
      description: "Access to prime real estate opportunities across Nigeria's major cities and emerging markets."
    },
    {
      icon: TrendingUp,
      title: "High Commission Structure",
      description: "Competitive commission rates with performance bonuses and incentives for top performers."
    },
    {
      icon: Users,
      title: "Team Support",
      description: "Comprehensive training, marketing support, and collaborative team environment."
    },
    {
      icon: Award,
      title: "Recognition Programs",
      description: "Regular recognition and awards for outstanding performance and client satisfaction."
    }
  ];

  return (
    <>
      <section className="py-16 bg-estate-blue text-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">For Realtors and PBOs</h2>
            <p className="text-xl max-w-2xl mx-auto">
              Join our network of successful real estate professionals and take your career to new heights
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {benefits.map((benefit, index) => {
              const IconComponent = benefit.icon;
              return (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{benefit.title}</h3>
                  <p className="text-gray-200">{benefit.description}</p>
                </div>
              );
            })}
          </div>

          <div className="bg-white bg-opacity-10 rounded-lg p-8 text-center mb-8">
            <h3 className="text-2xl font-bold mb-4">Ready to Join Our Team?</h3>
            <p className="text-lg mb-6">
              Become part of Nigeria's fastest-growing real estate company and unlock unlimited earning potential
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 mb-6">
              <button
                onClick={() => setIsEstateListOpen(true)}
                className="bg-estate-red hover:bg-red-600 text-white font-bold py-3 px-8 rounded-lg transition duration-300 flex items-center gap-2"
              >
                <Download size={20} />
                Download Estate Info & Forms
              </button>
            </div>
            
            <div className="flex flex-wrap justify-center gap-4">
              <a 
                href="https://portal.pboworld.com/44641"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-estate-red hover:bg-red-600 text-white font-bold py-3 px-8 rounded-lg transition duration-300"
              >
                Apply as Realtor
              </a>
              <a 
                href="tel:+2348030624059" 
                className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-estate-blue font-bold py-3 px-8 rounded-lg transition duration-300"
              >
                Call HR Department
              </a>
            </div>
          </div>
        </div>
      </section>

      <EstateListDialog 
        isOpen={isEstateListOpen}
        onClose={() => setIsEstateListOpen(false)}
      />
    </>
  );
};

export default RealtorsSection;
