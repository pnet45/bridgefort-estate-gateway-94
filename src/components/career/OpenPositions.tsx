
import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, MapPin, Clock, ArrowRight } from 'lucide-react';

const positions = [
  {
    id: 1,
    title: 'Real Estate Sales Executive',
    location: 'Lagos, Nigeria',
    type: 'Full-time',
    description: 'We are seeking energetic and driven sales executives to join our growing team. You will be responsible for client acquisition, property sales, and developing relationships with potential buyers and investors.',
    requirements: [
      'Minimum of 1 year experience in real estate sales (preferred)',
      'Excellent communication and negotiation skills',
      'Goal-oriented mindset with a passion for customer service',
      'Valid ID and professional appearance',
      'Ability to work with a team and independently'
    ]
  },
  {
    id: 2,
    title: 'Marketing Manager',
    location: 'Lagos, Nigeria',
    type: 'Full-time',
    description: 'Lead our marketing efforts to promote our real estate properties, services, and brand. Develop and implement comprehensive marketing strategies to reach potential clients and investors.',
    requirements: [
      'Proven experience in marketing management, preferably in real estate',
      'Strong understanding of digital marketing channels and strategies',
      'Excellent project management and leadership skills',
      'Creative thinking with analytical abilities',
      "Bachelor's degree in Marketing, Business, or related field"
    ]
  },
  {
    id: 3,
    title: 'Property Consultant',
    location: 'Lagos, Nigeria',
    type: 'Full-time',
    description: 'Advise clients on property investments, assist with property selection, and guide them through the buying process. Build lasting relationships with clients to understand their real estate needs.',
    requirements: [
      'Knowledge of Lagos real estate market',
      'Strong client relationship management skills',
      'Understanding of property valuation principles',
      'Excellent communication and presentation abilities',
      'Professional demeanor and ethical approach'
    ]
  },
];

const OpenPositions = () => {
  return (
    <section id="open-positions" className="py-16">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Open Positions</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We're looking for talented individuals to join our team. Explore our current openings and find your perfect role.
          </p>
        </div>
        
        <div className="space-y-6">
          {positions.map((position) => (
            <div key={position.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow duration-300">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">{position.title}</h3>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    Open
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-4 mb-4 text-gray-600">
                  <div className="flex items-center">
                    <MapPin size={18} className="mr-2 text-estate-blue" />
                    {position.location}
                  </div>
                  <div className="flex items-center">
                    <Briefcase size={18} className="mr-2 text-estate-blue" />
                    {position.type}
                  </div>
                  <div className="flex items-center">
                    <Clock size={18} className="mr-2 text-estate-blue" />
                    Apply by July 30, 2025
                  </div>
                </div>
                
                <p className="text-gray-600 mb-4">
                  {position.description}
                </p>
                
                <div className="mb-5">
                  <h4 className="font-semibold mb-2">Requirements:</h4>
                  <ul className="list-disc pl-5 text-gray-600 space-y-1">
                    {position.requirements.map((req, idx) => (
                      <li key={idx}>{req}</li>
                    ))}
                  </ul>
                </div>
                
                <a 
                  href="#application-form" 
                  className="inline-flex items-center text-estate-blue hover:text-estate-darkBlue font-medium"
                >
                  Apply Now
                  <ArrowRight size={16} className="ml-1" />
                </a>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-10">
          <p className="text-gray-600 mb-4">
            Don't see a position that matches your skills? We're always looking for talented people to join our team.
          </p>
          <a 
            href="#application-form" 
            className="btn-primary inline-block"
          >
            Submit a General Application
          </a>
        </div>
      </div>
    </section>
  );
};

export default OpenPositions;
