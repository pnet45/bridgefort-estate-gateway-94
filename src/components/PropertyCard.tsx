
import { MapPin, Home, Maximize2, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import PropertyDetailsDialog from './PropertyDetailsDialog';
import { useEcommerce } from '@/contexts/ecommerce';
import { Plot } from '@/contexts/ecommerce/types';

interface PropertyCardProps {
  id: string;
  title: string;
  location: string;
  price: string;
  imageUrl: string;
  sqm: number;
  propertyType: string;
  phase?: number;
  totalPlots?: number;
  availablePlots?: number;
  pricePerPlot?: number;
}

const PropertyCard = ({
  id,
  title,
  location,
  price,
  imageUrl,
  sqm,
  propertyType,
  phase = 1,
  totalPlots = 100,
  availablePlots = 75,
  pricePerPlot = 500000
}: PropertyCardProps) => {
  const { addToCart } = useEcommerce();
  
  const soldPlots = totalPlots - availablePlots;
  const percentageSold = (soldPlots / totalPlots) * 100;
  const isSoldOut = availablePlots === 0;

  const handleAddToCart = () => {
    if (isSoldOut) return;
    
    const plot: Plot = {
      id: `${id}-plot-${Date.now()}`,
      propertyId: id,
      propertyName: title,
      location,
      pricePerPlot,
      plotNumber: soldPlots + 1,
      imageUrl,
      size: sqm,
      propertyType,
      phase
    };
    
    addToCart(plot, 1);
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-500 group animate-fade-in hover:scale-105 transform-gpu border border-gray-100 focus-box-in">
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
        
        {isSoldOut && (
          <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
            <span className="bg-estate-red text-white px-4 py-2 rounded-lg font-bold text-lg">
              SOLD OUT
            </span>
          </div>
        )}
        
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-500"></div>
      </div>

      <div className="p-5">
        <h3 className="text-xl font-semibold text-gray-800 mb-2 transition-colors duration-300 group-hover:text-estate-blue animate-fade-in">{title}</h3>
        
        <div className="flex items-center text-gray-600 mb-3 transition-all duration-300 animate-fade-in">
          <MapPin size={16} className="mr-1 text-estate-blue transition-transform duration-300 group-hover:scale-110" />
          <span className="text-sm">{location}</span>
        </div>
        
        {/* Plot Information */}
        <div className="mb-4 p-3 bg-gradient-blue-green bg-opacity-5 rounded-lg animate-fade-in">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Plots Available</span>
            <span className="text-sm font-bold text-estate-blue">
              {availablePlots} / {totalPlots}
            </span>
          </div>
          <Progress value={percentageSold} className="h-2 mb-2" />
          <div className="text-xs text-gray-500">
            {percentageSold.toFixed(1)}% sold
          </div>
        </div>

        <div className="mb-3">
          <p className="text-estate-blue font-bold text-xl transition-all duration-300 animate-scale-in">
            ₦{pricePerPlot.toLocaleString()} <span className="text-sm font-normal">per plot</span>
          </p>
          <p className="text-gray-500 text-sm">{price}</p>
        </div>

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

        <div className="mt-4 space-y-2 animate-fade-in">
          {!isSoldOut && (
            <Button 
              onClick={handleAddToCart}
              className="w-full bg-gradient-green-blue text-white hover:scale-105 transition-all duration-300 hover:shadow-md"
            >
              <ShoppingCart size={16} className="mr-2" />
              Add to Cart
            </Button>
          )}
          
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
