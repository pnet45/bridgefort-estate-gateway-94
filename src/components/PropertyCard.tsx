
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
  // Update image URL for Precious Gardens Estate
  const displayImageUrl = title === "Precious Garden Estate" ? 
    "/lovable-uploads/5c033a2a-1e10-49b7-b7de-5b56e384b9d5.png" : imageUrl;

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition duration-300 group">
      <div className="relative overflow-hidden h-64">
        <img 
          src={displayImageUrl} 
          alt={title} 
          className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute top-4 left-4">
          <span className="bg-estate-blue text-white px-3 py-1 rounded-full text-xs font-medium uppercase">
            {propertyType}
          </span>
        </div>
      </div>

      <div className="p-5">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
        <div className="flex items-center text-gray-600 mb-3">
          <MapPin size={16} className="mr-1 text-estate-blue" />
          <span className="text-sm">{location}</span>
        </div>
        <p className="text-estate-blue font-bold text-xl mb-3">{price}</p>

        <div className="flex justify-between items-center border-t border-gray-100 pt-3">
          <div className="flex items-center text-gray-500">
            <Home size={16} className="mr-1" />
            <span className="text-sm">Phase {phase}</span>
          </div>
          <div className="flex items-center text-gray-500">
            <Maximize2 size={16} className="mr-1" />
            <span className="text-sm">{sqm} sqm</span>
          </div>
        </div>

        <div className="mt-4">
          <PropertyDetailsDialog 
            property={{ id, title, location, price, imageUrl: displayImageUrl, propertyType }}
          >
            <button 
              className="block w-full text-center py-2 bg-white border border-estate-blue text-estate-blue rounded font-medium hover:bg-estate-blue hover:text-white transition duration-300"
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
