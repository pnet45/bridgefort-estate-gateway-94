
import React from 'react';

const TeamCulture = () => {
  return (
    <section className="bg-gray-50 py-16">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-6">Our Team Culture</h2>
            <p className="text-gray-600 mb-6">
              At Bridgefort Homes Development Ltd, we foster a culture of excellence, integrity, and collaboration. 
              Our team is built around the TEAMWORK philosophy - Together Everyone Achieves More.
            </p>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-start">
                <div className="bg-estate-blue rounded-full p-1 mr-3 mt-1">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-gray-700"><span className="font-semibold">Teamwork:</span> We believe that collaboration leads to better solutions and outcomes.</p>
              </div>
              
              <div className="flex items-start">
                <div className="bg-estate-blue rounded-full p-1 mr-3 mt-1">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-gray-700"><span className="font-semibold">Excellence:</span> We strive for the highest standards in everything we do.</p>
              </div>
              
              <div className="flex items-start">
                <div className="bg-estate-blue rounded-full p-1 mr-3 mt-1">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-gray-700"><span className="font-semibold">Accountability:</span> We take responsibility for our actions and commitments.</p>
              </div>
              
              <div className="flex items-start">
                <div className="bg-estate-blue rounded-full p-1 mr-3 mt-1">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-gray-700"><span className="font-semibold">Mutual Respect:</span> We value diverse perspectives and treat each other with dignity.</p>
              </div>
              
              <div className="flex items-start">
                <div className="bg-estate-blue rounded-full p-1 mr-3 mt-1">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-gray-700"><span className="font-semibold">Work-Life Balance:</span> We promote wellness and balance for long-term success.</p>
              </div>
              
              <div className="flex items-start">
                <div className="bg-estate-blue rounded-full p-1 mr-3 mt-1">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-gray-700"><span className="font-semibold">Opportunity for Growth:</span> We invest in continuous learning and development.</p>
              </div>
            </div>
            
            <p className="text-gray-600 font-medium italic">
              "Our people are our greatest asset. We're committed to creating an environment where every team member can thrive and grow with us."
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <img 
              src="/lovable-uploads/62e9d362-2fac-4c6b-b437-8045c86dfc53.png" 
              alt="Team Culture" 
              className="rounded-lg shadow-md w-full h-64 object-cover"
            />
            <img 
              src="/lovable-uploads/f9bcac5d-3d64-47a5-9da3-0e2fcfd2bb57.png" 
              alt="Team Members" 
              className="rounded-lg shadow-md w-full h-64 object-cover"
            />
            <img 
              src="/lovable-uploads/796b8bc3-c103-4ea9-bc00-f5ccc19ab812.png" 
              alt="Office Environment" 
              className="rounded-lg shadow-md w-full h-64 object-cover"
            />
            <img 
              src="/lovable-uploads/8038c999-40e2-49bf-afec-2cb0b5bc2c14.png" 
              alt="Team Building" 
              className="rounded-lg shadow-md w-full h-64 object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default TeamCulture;
