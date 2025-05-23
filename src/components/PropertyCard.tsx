
import { MapPin, Home, Maximize2 } from 'lucide-react';
import PropertyDetailsDialog from './PropertyDetailsDialog';

interface PropertyCardProps {
  id: string;
  title: string;
  location: string;
  price: string;
  imageUrl: string;
  sqm: number;
  propertyType: string;
  phase?: number;
}

const PropertyCard = ({
  id,
  title,
  location,
  price,
  imageUrl,
  sqm,
  propertyType,
  phase = 1
}: PropertyCardProps) => {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-500 group animate-fade-in hover:scale-105 transform-gpu border border-gray-100">
      <div className="relative overflow-hidden h-64">
        <img 
          src={imageUrl} 
          alt={title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute top-4 left-4 animate-fade-in">
          <span className="bg-estate-blue text-white px-3 py-1 rounded-full text-xs font-medium uppercase transition-all duration-300 hover:bg-estate-darkBlue hover:scale-105">
            {propertyType}
          </span>
        </div>
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-500"></div>
      </div>

      <div className="p-5">
        <h3 className="text-xl font-semibold text-gray-800 mb-2 transition-colors duration-300 group-hover:text-estate-blue animate-fade-in">{title}</h3>
        <div className="flex items-center text-gray-600 mb-3 transition-all duration-300 animate-fade-in">
          <MapPin size={16} className="mr-1 text-estate-blue transition-transform duration-300 group-hover:scale-110" />
          <span className="text-sm">{location}</span>
        </div>
        <p className="text-estate-blue font-bold text-xl mb-3 transition-all duration-300 animate-scale-in">{price}</p>

        <div className="flex justify-between items-center border-t border-gray-100 pt-3 animate-fade-in">
          <div className="flex items-center text-gray-500 transition-colors duration-300 group-hover:text-gray-700">
            <Home size={16} className="mr-1 transition-transform duration-300 group-hover:scale-110" />
            <span className="text-sm">Phase {phase}</span>
          </div>
          <div className="flex items-center text-gray-500 transition-colors duration-300 group-hover:text-gray-700">
            <Maximize2 size={16} className="mr-1 transition-transform duration-300 group-hover:scale-110" />
            <span className="text-sm">{sqm} sqm</span>
          </div>
        </div>

        <div className="mt-4 animate-fade-in">
          <PropertyDetailsDialog 
            property={{ id, title, location, price, imageUrl, propertyType }}
          >
            <button 
              className="block w-full text-center py-2 bg-white border border-estate-blue text-estate-blue rounded font-medium hover:bg-estate-blue hover:text-white transition-all duration-300 transform hover:scale-105 hover:shadow-md"
            >
              View Details
            </button>
          </PropertyDetailsDialog>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
