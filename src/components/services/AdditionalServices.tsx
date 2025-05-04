import React from 'react';
import { Construction, LandPlot, BarChart, GraduationCap } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
const AdditionalServices = () => {
  return <section className="section-padding bg-white">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Comprehensive Investment Services</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Beyond property sales, we offer a range of professional services to support your real estate investment journey.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Construction and Development */}
          <Card className="overflow-hidden shadow-lg border-0">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-2/5">
                <img alt="Construction and Development" className="w-full h-full object-cover" src="/lovable-uploads/b006d931-462b-4646-97c9-0b2f3bc1d210.jpg" />
              </div>
              <div className="md:w-3/5 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-estate-blue bg-opacity-10 p-3 rounded-full">
                    <Construction size={24} className="text-estate-blue" />
                  </div>
                  <h3 className="text-xl font-semibold">Construction & Development</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Our construction and development services cover everything from initial design to project completion. We handle:
                </p>
                <ul className="list-disc pl-5 mb-4 text-gray-600 space-y-1">
                  <li>Custom home building</li>
                  <li>Property renovations and extensions</li>
                  <li>Commercial development projects</li>
                  <li>Project management and supervision</li>
                  <li>Quality assurance and compliance</li>
                </ul>
                <button className="btn-primary mt-2">Learn More</button>
              </div>
            </div>
          </Card>
          
          {/* Land Surveys */}
          <Card className="overflow-hidden shadow-lg border-0">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-2/5">
                <img src="https://5.imimg.com/data5/SELLER/Default/2022/11/EZ/TO/DO/105576955/land-survey-consultancy-service-500x500.jpg?ixlib=rb-4.0.3&auto=format&fit=crop&w=1400&q=80" alt="Land Surveys" className="w-full h-full object-cover" />
              </div>
              <div className="md:w-3/5 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-estate-blue bg-opacity-10 p-3 rounded-full">
                    <LandPlot size={24} className="text-estate-blue" />
                  </div>
                  <h3 className="text-xl font-semibold">Land Surveys</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Our professional surveying services ensure accurate land assessment and documentation:
                </p>
                <ul className="list-disc pl-5 mb-4 text-gray-600 space-y-1">
                  <li>Boundary surveys and demarcation</li>
                  <li>Topographic surveys</li>
                  <li>Title verification</li>
                  <li>Land use and zoning analysis</li>
                  <li>Due diligence investigations</li>
                </ul>
                <button className="btn-primary mt-2">Learn More</button>
              </div>
            </div>
          </Card>
          
          {/* Consultancy */}
          <Card className="overflow-hidden shadow-lg border-0">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-2/5">
                <img alt="Real Estate Consultancy" className="w-full h-full object-cover" src="/lovable-uploads/5a69cf4b-e9ca-477d-bf00-2ac6fa768177.jpg" />
              </div>
              <div className="md:w-3/5 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-estate-blue bg-opacity-10 p-3 rounded-full">
                    <BarChart size={24} className="text-estate-blue" />
                  </div>
                  <h3 className="text-xl font-semibold">Consultancy</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Our expert consultants provide tailored advice to optimize your investment strategy:
                </p>
                <ul className="list-disc pl-5 mb-4 text-gray-600 space-y-1">
                  <li>Investment portfolio analysis</li>
                  <li>Market trend research</li>
                  <li>Property valuation</li>
                  <li>ROI optimization strategies</li>
                  <li>Risk assessment and mitigation</li>
                </ul>
                <button className="btn-primary mt-2">Learn More</button>
              </div>
            </div>
          </Card>
          
          {/* Seminars & Training */}
          <Card className="overflow-hidden shadow-lg border-0">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-2/5">
                <img alt="Real Estate Seminars" className="w-full h-full object-cover" src="/lovable-uploads/f4c5cb9d-d79d-419a-9577-444691d59b72.jpg" />
              </div>
              <div className="md:w-3/5 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-estate-blue bg-opacity-10 p-3 rounded-full">
                    <GraduationCap size={24} className="text-estate-blue" />
                  </div>
                  <h3 className="text-xl font-semibold">Seminars & Training</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Gain valuable insights through our educational programs designed for both beginners and experienced investors:
                </p>
                <ul className="list-disc pl-5 mb-4 text-gray-600 space-y-1">
                  <li>Real estate investment fundamentals</li>
                  <li>Property flipping workshops</li>
                  <li>Rental property management</li>
                  <li>Real estate market analysis</li>
                  <li>Wealth building strategies</li>
                </ul>
                <button className="btn-primary mt-2">Upcoming Events</button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>;
};
export default AdditionalServices;