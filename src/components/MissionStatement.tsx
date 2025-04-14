
import React from 'react';
import { Building, Shield, Wallet, Focus } from 'lucide-react';

const MissionStatement = () => {
  const keyOfferings = [
    {
      icon: <Building size={40} className="text-estate-blue" />,
      title: "Strategic Locations",
      description: "Estates in prime areas promising high appreciation value and excellent connectivity."
    },
    {
      icon: <Shield size={40} className="text-estate-blue" />,
      title: "Verified Titles",
      description: "Thoroughly vetted properties with genuine documentation for total peace of mind."
    },
    {
      icon: <Wallet size={40} className="text-estate-blue" />,
      title: "Flexible Payment Plans",
      description: "Tailored payment options to suit your budget and make property ownership accessible."
    },
    {
      icon: <Focus size={40} className="text-estate-blue" />,
      title: "Customer-Centric Approach",
      description: "Comprehensive support from initial inquiry to after-sales service."
    }
  ];

  return (
    <section className="bg-gray-50 py-16">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Unlock Your Real Estate Potential</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            At PWAN Bridgefort, we're not just selling properties—we're building legacies and helping you achieve financial freedom.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {keyOfferings.map((offering, index) => (
            <div 
              key={index} 
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300 text-center"
            >
              <div className="flex justify-center mb-4">
                {offering.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3">{offering.title}</h3>
              <p className="text-gray-600">{offering.description}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <a 
            href="/contact" 
            className="btn-cta text-lg px-8 py-3"
          >
            Schedule Free Consultation
          </a>
        </div>
      </div>
    </section>
  );
};

export default MissionStatement;
