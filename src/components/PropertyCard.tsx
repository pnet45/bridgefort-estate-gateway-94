
import React, { useState, useEffect } from 'react';
import { MapPin, Home, Ruler, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useEcommerce } from '@/contexts/ecommerce';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export interface PropertyCardProps {
  id: string;
  propertyName: string;
  location: string;
  plotNumber: number;
  size: number;
  imageUrl: string;
  pricePerPlot: number;
  propertyType: string;
  soldPlots?: number;
  totalPlots?: number;
  phase?: number;
}

const PropertyCard: React.FC<PropertyCardProps> = ({
  id,
  propertyName,
  location,
  plotNumber,
  size,
  imageUrl,
  pricePerPlot,
  propertyType,
  soldPlots = 0,
  totalPlots = 100,
  phase
}) => {
  const { addToCart } = useEcommerce();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profileCompleted, setProfileCompleted] = useState<boolean | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Check if user has completed profile
  useEffect(() => {
    const checkProfileCompletion = async () => {
      if (!user) {
        setProfileCompleted(null);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('profile_completed')
          .eq('id', user.id)
          .single();
        
        if (error) {
          console.error('Error checking profile completion:', error);
          setProfileCompleted(false);
        } else {
          setProfileCompleted(data?.profile_completed || false);
        }
      } catch (error) {
        console.error('Error checking profile completion:', error);
        setProfileCompleted(false);
      }
    };

    checkProfileCompletion();
  }, [user]);

  const handleAddToCart = () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to add items to cart",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }

    if (profileCompleted === false) {
      toast({
        title: "Profile Completion Required",
        description: "Please complete your profile and KYC information before making purchases",
        variant: "destructive"
      });
      navigate('/profile');
      return;
    }

    const plot = {
      id,
      propertyId: id,
      propertyName,
      location,
      plotNumber,
      size,
      imageUrl,
      pricePerPlot,
      propertyType
    };

    addToCart(plot, 1);
  };

  const availablePlots = totalPlots - soldPlots;
  const availability = availablePlots > 0 ? 'Available' : 'Sold Out';
  const availabilityColor = availablePlots > 0 ? 'bg-green-500' : 'bg-red-500';

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 bg-white">
      <div className="relative">
        <img
          src={imageUrl}
          alt={propertyName}
          className="w-full h-48 object-cover"
        />
        <Badge 
          className={`absolute top-2 right-2 ${availabilityColor} text-white`}
        >
          {availability}
        </Badge>
        {phase && (
          <Badge className="absolute top-2 left-2 bg-estate-blue text-white">
            Phase {phase}
          </Badge>
        )}
      </div>
      
      <CardContent className="p-4">
        <h3 className="font-bold text-lg text-estate-blue mb-2 line-clamp-2">
          {propertyName}
        </h3>
        
        <div className="space-y-2 text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-1">
            <MapPin size={14} />
            <span>{location}</span>
          </div>
          
          <div className="flex items-center gap-1">
            <Home size={14} />
            <span>Plot #{plotNumber}</span>
          </div>
          
          <div className="flex items-center gap-1">
            <Ruler size={14} />
            <span>{size}sqm</span>
          </div>
          
          <div className="flex items-center gap-1">
            <Calendar size={14} />
            <span>{propertyType}</span>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm text-gray-600">Availability</span>
            <span className="text-sm font-medium">{availablePlots}/{totalPlots} plots</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(availablePlots / totalPlots) * 100}%` }}
            />
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">Price per plot</p>
            <p className="font-bold text-lg text-estate-red">
              ₦{pricePerPlot.toLocaleString()}
            </p>
          </div>
          
          <div className="flex gap-2">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{propertyName}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <img
                    src={imageUrl}
                    alt={propertyName}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><strong>Location:</strong> {location}</div>
                    <div><strong>Plot Number:</strong> #{plotNumber}</div>
                    <div><strong>Size:</strong> {size}sqm</div>
                    <div><strong>Type:</strong> {propertyType}</div>
                    <div><strong>Available Plots:</strong> {availablePlots}/{totalPlots}</div>
                    <div><strong>Price:</strong> ₦{pricePerPlot.toLocaleString()}</div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
            <Button 
              size="sm"
              onClick={handleAddToCart}
              disabled={availablePlots === 0}
              className="bg-estate-blue hover:bg-estate-darkBlue"
            >
              {availablePlots === 0 ? 'Sold Out' : 'Add to Cart'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyCard;
