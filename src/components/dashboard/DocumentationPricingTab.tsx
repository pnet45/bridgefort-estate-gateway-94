
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth";
import { useEcommerce } from "@/contexts/ecommerce";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface DocumentationType {
  id: string;
  name: string;
  price: number;
  description: string;
}

interface EstateLite {
  id: string;
  name: string;
  location: string;
}

const DocumentationPricingTab: React.FC = () => {
  const { user } = useAuth();
  const { addToCart, cart } = useEcommerce();
  const navigate = useNavigate();
  const [estates, setEstates] = useState<EstateLite[]>([]);
  const [documentationTypes, setDocumentationTypes] = useState<DocumentationType[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileCompleted, setProfileCompleted] = useState(false);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      // Check if profile is completed
      const { data: profile } = await supabase
        .from("profiles")
        .select("profile_completed")
        .eq("id", user.id)
        .single();
      
      setProfileCompleted(profile?.profile_completed || false);

      // Fetch estates and documentation types
      const [estatesResult, docTypesResult] = await Promise.all([
        supabase.from("estate").select("id, name, location"),
        supabase.from("documentation_types").select("*").order("price", { ascending: false })
      ]);

      if (estatesResult.error) {
        toast({ title: "Error", description: estatesResult.error.message, variant: "destructive" });
      } else {
        setEstates(estatesResult.data || []);
      }

      if (docTypesResult.error) {
        toast({ title: "Error", description: docTypesResult.error.message, variant: "destructive" });
      } else {
        setDocumentationTypes(docTypesResult.data || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDocumentationToCart = (estate: EstateLite, docType: DocumentationType) => {
    if (!profileCompleted) {
      toast({
        title: "Profile Incomplete",
        description: "Please complete your profile before purchasing documentation.",
        variant: "destructive"
      });
      navigate('/profile');
      return;
    }

    addToCart(
      {
        id: `doc-${estate.id}-${docType.id}`,
        propertyId: estate.id,
        propertyName: `${estate.name} - ${docType.name}`,
        location: estate.location,
        plotNumber: 0,
        size: 0,
        imageUrl: "/placeholder.svg",
        pricePerPlot: docType.price,
        propertyType: "Documentation",
      },
      1
    );
    
    toast({
      title: "Added to Cart",
      description: `${docType.name} for ${estate.name} added to cart.`,
    });
  };

  const handleAddBundleToCart = (estate: EstateLite) => {
    if (!profileCompleted) {
      toast({
        title: "Profile Incomplete", 
        description: "Please complete your profile before purchasing documentation.",
        variant: "destructive"
      });
      navigate('/profile');
      return;
    }

    const bundlePrice = documentationTypes.reduce((total, docType) => total + docType.price, 0);
    
    addToCart(
      {
        id: `doc-bundle-${estate.id}`,
        propertyId: estate.id,
        propertyName: `${estate.name} - Complete Documentation Bundle`,
        location: estate.location,
        plotNumber: 0,
        size: 0,
        imageUrl: "/placeholder.svg",
        pricePerPlot: bundlePrice,
        propertyType: "Documentation Bundle",
      },
      1
    );
    
    toast({
      title: "Bundle Added to Cart",
      description: `Complete documentation bundle for ${estate.name} added to cart.`,
    });
  };

  if (loading) return <div>Loading...</div>;

  if (!profileCompleted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Documentation Services</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-6">
            <p className="text-gray-600 mb-4">
              Please complete your profile to access documentation services.
            </p>
            <Button onClick={() => navigate('/profile')} className="bg-estate-blue hover:bg-estate-darkBlue">
              Complete Profile
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      <h2 className="text-3xl font-bold text-estate-blue mb-4">Estate Documentation Services</h2>
      
      {/* Documentation Types Overview */}  
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Available Documentation Services</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            {documentationTypes.map((docType) => (
              <div key={docType.id} className="border rounded-lg p-4">
                <h3 className="font-semibold text-estate-blue">{docType.name}</h3>
                <p className="text-2xl font-bold">₦{docType.price.toLocaleString()}</p>
                <p className="text-sm text-gray-600">{docType.description}</p>
              </div>
            ))}
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">Complete Bundle</h3>
            <p className="text-2xl font-bold text-green-800">
              ₦{documentationTypes.reduce((total, docType) => total + docType.price, 0).toLocaleString()}
            </p>
            <p className="text-sm text-green-700">Get all documentation services together</p>
          </div>
        </CardContent>
      </Card>

      {/* Estates List */}
      <Card>
        <CardHeader>
          <CardTitle>Select Estate for Documentation</CardTitle>
        </CardHeader>
        <CardContent>
          {estates.length === 0 ? (
            <div>No estates found.</div>
          ) : (
            <div className="space-y-6">
              {estates.map((estate) => (
                <div key={estate.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-estate-blue text-lg">{estate.name}</h3>
                      <p className="text-gray-600">{estate.location}</p>
                    </div>
                    <Button
                      onClick={() => handleAddBundleToCart(estate)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Add Complete Bundle
                    </Button>
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-3">
                    {documentationTypes.map((docType) => {
                      const itemId = `doc-${estate.id}-${docType.id}`;
                      const isAdded = cart?.find(item => item.plot.id === itemId) !== undefined;
                      
                      return (
                        <div key={docType.id} className="flex items-center justify-between border rounded p-3">
                          <div>
                            <div className="font-medium">{docType.name}</div>
                            <div className="text-lg font-bold text-estate-blue">
                              ₦{docType.price.toLocaleString()}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="secondary"
                            disabled={isAdded}
                            onClick={() => handleAddDocumentationToCart(estate, docType)}
                          >
                            {isAdded ? "Added" : "Add"}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentationPricingTab;
