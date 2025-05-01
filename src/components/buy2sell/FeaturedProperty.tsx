
import React from 'react';
import { Button } from "@/components/ui/button";
import { CheckCircle } from 'lucide-react';

interface FeaturedPropertyProps {
  isLoaded: boolean;
}

const FeaturedProperty: React.FC<FeaturedPropertyProps> = ({ isLoaded }) => {
  return (
    <div className="mb-16">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4">Featured Property</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Explore our featured property offering with excellent ROI potential.
        </p>
      </div>

      <div className={`bg-white rounded-lg shadow-lg overflow-hidden ${isLoaded ? 'animate-scale-in' : 'opacity-0'}`}>
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="p-8 flex items-center">
            <img 
              src="/lovable-uploads/2f745990-7323-42b1-87f3-eb1a3f2db0ba.png" 
              alt="Flourish Luxury Villas" 
              className="w-full h-auto rounded-lg shadow-lg hover:scale-105 transition-transform duration-500"
            />
          </div>
          
          <div className="p-8 bg-estate-blue text-white">
            <h3 className="text-2xl font-bold mb-4">FLOURISH LUXURY VILLAS</h3>
            <p className="mb-6">
              Our premium development offering exceptional returns on investment. Whether you choose Buy2Sell or Buy2Keep, you're guaranteed excellent value.
            </p>
            
            <div className="space-y-4 mb-6">
              <h4 className="text-xl font-semibold">Available Options:</h4>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <CheckCircle size={20} className="mr-2 text-white" />
                  <span>Flourish Luxury Villas Ilorin</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle size={20} className="mr-2 text-white" />
                  <span>Flourish Luxury Villas Epe</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle size={20} className="mr-2 text-white" />
                  <span>Flourish Luxury Villas Monastery</span>
                </li>
              </ul>
            </div>
            
            <Button className="bg-white text-estate-blue hover:bg-gray-100 w-full">
              Request More Information
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedProperty;
