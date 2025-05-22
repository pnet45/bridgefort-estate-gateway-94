
import React from 'react';
import ConstructionServices from './ConstructionServices';
import LandSurveyServices from './LandSurveyServices';
import ConsultancyServices from './ConsultancyServices';
import SeminarsServices from './SeminarsServices';
import RealEstateManagement from './RealEstateManagement';
import PropertyDevelopment from './PropertyDevelopment';

const AdditionalServices = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">Comprehensive Investment Services</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Beyond just property acquisition, we offer comprehensive services to maximize your real estate investment potential.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ConstructionServices />
          <LandSurveyServices />
          <ConsultancyServices />
          <SeminarsServices />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 mt-8">
          <RealEstateManagement />
          <PropertyDevelopment />
        </div>
      </div>
    </section>
  );
};

export default AdditionalServices;
