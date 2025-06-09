
import React from 'react';
import { Card, CardContent } from './ui/card';
import { MapPin, ShoppingCart } from 'lucide-react';
import PropertyDetailsDialog from './PropertyDetailsDialog';
import { Progress } from './ui/progress';
import { Button } from './ui/button';
import { useEcommerce } from '@/contexts/ecommerce';
import { Plot } from '@/contexts/ecommerce/types';

interface PropertyCardProps {
  id: string;
  title: string;
  location: string;
  price: string;
  imageUrl: string;
  propertyType: string;
  sqm?: number;
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
  propertyType,
  sqm = 500,
  totalPlots = 100,
  availablePlots = 50,
  pricePerPlot = 0
}: PropertyCardProps) => {
  const { addToCart } = useEcommerce();
  const soldPercentage = totalPlots > 0 ? ((totalPlots - availablePlots) / totalPlots) * 100 : 0;
  const isSoldOut = availablePlots === 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    const plot: Plot = {
      id: `${id}-plot-${Date.now()}`,
      propertyId: id,
      propertyName: title,
      location,
      pricePerPlot: pricePerPlot || 1000000,
      plotNumber: Math.floor(Math.random() * 1000) + 1,
      imageUrl,
      size: sqm,
      propertyType,
    };
    
    addToCart(plot, 1);
  };

  return (
    <PropertyDetailsDialog property={{ id, title, location, price, imageUrl, propertyType }}>
      <Card className="group overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:scale-105 animate-fade-in">
        <div className="relative">
          <div className="h-64 bg-cover bg-center" style={{ backgroundImage: `url(${imageUrl})` }}>
            <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-30 transition-all duration-300" />
            
            {isSoldOut && (
              <div className="property-sold-overlay">
                <div className="sold-out-badge">
                  SOLD OUT
                </div>
              </div>
            )}
          </div>
          
          <div className="absolute top-3 right-3">
            <Button
              onClick={handleAddToCart}
              disabled={isSoldOut}
              size="sm"
              className="ecommerce-button text-white opacity-95 hover:opacity-100"
            >
              <ShoppingCart size={16} className="mr-1" />
              Add to Cart
            </Button>
          </div>
        </div>
        
        <CardContent className="p-6">
          <h3 className="text-xl font-bold mb-2 text-estate-blue group-hover:text-estate-darkBlue transition-colors">
            {title}
          </h3>
          
          <div className="flex items-center mb-3 text-gray-600">
            <MapPin size={16} className="mr-2" />
            <span>{location}</span>
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Plots Available: {availablePlots}/{totalPlots}</span>
              <span>{Math.round(soldPercentage)}% Sold</span>
            </div>
            <Progress value={soldPercentage} className="h-2" />
          </div>
          
          <div className="space-y-2">
            <p className="text-2xl font-bold text-estate-red">
              ₦{(pricePerPlot || 0).toLocaleString()} <span className="text-sm text-gray-600">per plot</span>
            </p>
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">Property Type: {propertyType}</p>
              <p className="text-sm text-gray-600 font-medium">Plot Size: {sqm} SQM</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </PropertyDetailsDialog>
  );
};

export default PropertyCard;
