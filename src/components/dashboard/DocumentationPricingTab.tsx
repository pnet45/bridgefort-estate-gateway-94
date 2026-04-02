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

interface DocPricing {
  estate_id: string;
  survey_plan: number | null;
  deed_of_assignment: number | null;
  plot_demarcation: number | null;
  plot_maintenance_fee: number | null;
}

const DocumentationPricingTab: React.FC = () => {
  const { user } = useAuth();
  const { addToCart, cart } = useEcommerce();
  const navigate = useNavigate();
  const [estates, setEstates] = useState<EstateLite[]>([]);
  const [documentationTypes, setDocumentationTypes] = useState<DocumentationType[]>([]);
  const [docPricing, setDocPricing] = useState<Record<string, DocPricing>>({});
  const [loading, setLoading] = useState(true);
  const [profileCompleted, setProfileCompleted] = useState(false);

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("profile_completed")
        .eq("id", user.id)
        .single();
      setProfileCompleted(profile?.profile_completed || false);

      const [estatesResult, docTypesResult, pricingResult] = await Promise.all([
        supabase.from("estate").select("id, name, location"),
        supabase.from("documentation_types").select("*").order("price", { ascending: false }),
        supabase.from("estate_doc_pricing").select("*"),
      ]);

      if (!estatesResult.error) setEstates(estatesResult.data || []);
      if (!docTypesResult.error) setDocumentationTypes(docTypesResult.data || []);
      
      if (!pricingResult.error && pricingResult.data) {
        const map: Record<string, DocPricing> = {};
        pricingResult.data.forEach((p: any) => { map[p.estate_id] = p; });
        setDocPricing(map);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getEstateDocTotal = (estateId: string) => {
    const p = docPricing[estateId];
    if (!p) return documentationTypes.reduce((t, d) => t + d.price, 0);
    return (p.survey_plan || 0) + (p.deed_of_assignment || 0) + (p.plot_demarcation || 0) + (p.plot_maintenance_fee || 0);
  };

  const handleAddDocumentationToCart = (estate: EstateLite, docType: DocumentationType) => {
    if (!profileCompleted) {
      toast({ title: "Profile Incomplete", description: "Please complete your profile first.", variant: "destructive" });
      navigate('/profile');
      return;
    }
    addToCart({
      id: `doc-${estate.id}-${docType.id}`,
      propertyId: estate.id,
      propertyName: `${estate.name} - ${docType.name}`,
      location: estate.location,
      plotNumber: 0, size: 0, imageUrl: "/placeholder.svg",
      pricePerPlot: docType.price,
      propertyType: "Documentation",
    }, 1);
    toast({ title: "Added to Cart", description: `${docType.name} for ${estate.name} added.` });
  };

  const handleAddBundleToCart = (estate: EstateLite) => {
    if (!profileCompleted) {
      toast({ title: "Profile Incomplete", description: "Please complete your profile first.", variant: "destructive" });
      navigate('/profile');
      return;
    }
    const bundlePrice = getEstateDocTotal(estate.id);
    addToCart({
      id: `doc-bundle-${estate.id}`,
      propertyId: estate.id,
      propertyName: `${estate.name} - Complete Documentation Bundle`,
      location: estate.location,
      plotNumber: 0, size: 0, imageUrl: "/placeholder.svg",
      pricePerPlot: bundlePrice,
      propertyType: "Documentation Bundle",
    }, 1);
    toast({ title: "Bundle Added", description: `Complete bundle for ${estate.name} (₦${bundlePrice.toLocaleString()}).` });
  };

  if (loading) return <div>Loading...</div>;

  if (!profileCompleted) {
    return (
      <Card>
        <CardHeader><CardTitle>Documentation Services</CardTitle></CardHeader>
        <CardContent>
          <div className="text-center p-6">
            <p className="text-muted-foreground mb-4">Please complete your profile to access documentation services.</p>
            <Button onClick={() => navigate('/profile')}>Complete Profile</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      <h2 className="text-3xl font-bold text-primary mb-4">Estate Documentation Services</h2>
      
      <Card className="mb-6">
        <CardHeader><CardTitle>Available Documentation Services</CardTitle></CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            {documentationTypes.map((docType) => (
              <div key={docType.id} className="border rounded-lg p-4">
                <h3 className="font-semibold text-primary">{docType.name}</h3>
                <p className="text-2xl font-bold">₦{docType.price.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">{docType.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Select Estate for Documentation</CardTitle></CardHeader>
        <CardContent>
          {estates.length === 0 ? <div>No estates found.</div> : (
            <div className="space-y-6">
              {estates.map((estate) => {
                const bundleTotal = getEstateDocTotal(estate.id);
                return (
                  <div key={estate.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-primary text-lg">{estate.name}</h3>
                        <p className="text-muted-foreground">{estate.location}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Bundle Total</p>
                        <p className="text-lg font-bold text-primary">₦{bundleTotal.toLocaleString()}</p>
                        <Button size="sm" onClick={() => handleAddBundleToCart(estate)} className="mt-1">
                          Add Complete Bundle
                        </Button>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-3 gap-3">
                      {documentationTypes.map((docType) => {
                        const itemId = `doc-${estate.id}-${docType.id}`;
                        const isAdded = cart?.find(item => item.plot.id === itemId) !== undefined;
                        return (
                          <div key={docType.id} className="flex items-center justify-between border rounded p-3">
                            <div>
                              <div className="font-medium">{docType.name}</div>
                              <div className="text-lg font-bold text-primary">₦{docType.price.toLocaleString()}</div>
                            </div>
                            <Button size="sm" variant="secondary" disabled={isAdded}
                              onClick={() => handleAddDocumentationToCart(estate, docType)}>
                              {isAdded ? "Added" : "Add"}
                            </Button>
                          </div>
                        );
                      })}
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

export default DocumentationPricingTab;
