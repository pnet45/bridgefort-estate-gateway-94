
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth";
import { useEcommerce } from "@/contexts/ecommerce";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const DOCUMENTATION_PRICE = 150000;

interface EstateLite {
  id: string;
  name: string;
  location: string;
}

const DocumentationTab: React.FC = () => {
  const { user } = useAuth();
  const { addToCart, cart } = useEcommerce();
  const navigate = useNavigate();
  const [estates, setEstates] = useState<EstateLite[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileCompleted, setProfileCompleted] = useState<boolean | null>(null);

  useEffect(() => {
    // Check profile completion and fetch estate list
    (async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Check profile completion
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('profile_completed')
          .eq('id', user.id)
          .single();
        
        if (profileError) {
          console.error('Error checking profile completion:', profileError);
          setProfileCompleted(false);
        } else {
          setProfileCompleted(profileData?.profile_completed || false);
        }

        // Fetch estates
        const { data, error } = await supabase
          .from("estate")
          .select("id, name, location");
        if (error) {
          toast({ title: "Error", description: error.message, variant: "destructive" });
          setLoading(false);
          return;
        }
        setEstates(data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        setProfileCompleted(false);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const handleAddDocumentationToCart = (estate: EstateLite) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to add documentation to cart",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }

    if (profileCompleted === false) {
      toast({
        title: "Profile Completion Required",
        description: "Please complete your profile and KYC information before purchasing documentation",
        variant: "destructive"
      });
      navigate('/profile');
      return;
    }

    addToCart(
      {
        id: `doc-${estate.id}`,
        propertyId: estate.id,
        propertyName: `${estate.name} Documentation`,
        location: estate.location,
        plotNumber: 0,
        size: 0,
        imageUrl: "/placeholder.svg",
        pricePerPlot: DOCUMENTATION_PRICE,
        propertyType: "Documentation",
      },
      1
    );
    toast({
      title: "Added to Cart",
      description: `${estate.name} documentation added to cart.`,
    });
  };

  if (!user) {
    return (
      <div>
        <h2 className="text-3xl font-bold text-estate-blue mb-4">Estate Documentation</h2>
        <Card>
          <CardHeader>
            <CardTitle>Access Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">Please log in to access documentation services.</p>
            <Button onClick={() => navigate('/auth')}>
              Log In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-3xl font-bold text-estate-blue mb-4">Estate Documentation</h2>
      <Card>
        <CardHeader>
          <CardTitle>All Estates - Choose for Documentation Payment</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && <div>Loading estates...</div>}
          {!loading && profileCompleted === false && (
            <div className="text-center py-8">
              <div className="mb-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Profile Completion Required</h3>
                <p className="text-gray-600 mb-6">
                  To purchase documentation services, you must first complete your profile and KYC information.
                </p>
                <Button
                  onClick={() => navigate('/profile')}
                  className="bg-estate-blue hover:bg-estate-darkBlue text-white"
                >
                  Complete Profile Now
                </Button>
              </div>
            </div>
          )}
          {!loading && profileCompleted === true && estates.length === 0 && (
            <div>No estates found.</div>
          )}
          {!loading && profileCompleted === true && estates.length > 0 && (
            <div className="space-y-4">
              {estates.map((estate) => {
                const docPlotId = `doc-${String(estate.id)}`;
                const isAdded =
                  cart?.find(
                    (item) => String(item.plot.id) === docPlotId
                  ) !== undefined;
                return (
                  <div key={estate.id} className="flex items-center justify-between border-b pb-3">
                    <div>
                      <div className="font-semibold">{estate.name}</div>
                      <div className="text-sm text-gray-600">{estate.location}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-estate-blue">
                        ₦{DOCUMENTATION_PRICE.toLocaleString()}
                      </span>
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={isAdded}
                        onClick={() => handleAddDocumentationToCart(estate)}
                      >
                        {isAdded ? "Added" : "Add to Cart"}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentationTab;
