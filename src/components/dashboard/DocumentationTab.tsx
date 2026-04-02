import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth";
import { useEcommerce } from "@/contexts/ecommerce";
import { supabase } from "@/integrations/supabase/client";

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

const FALLBACK_PRICE = 150000;

const DocumentationTab: React.FC = () => {
  const { user } = useAuth();
  const { addToCart, cart } = useEcommerce();
  const [estates, setEstates] = useState<EstateLite[]>([]);
  const [docPricing, setDocPricing] = useState<Record<string, DocPricing>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [estatesRes, pricingRes] = await Promise.all([
        supabase.from("estate").select("id, name, location"),
        supabase.from("estate_doc_pricing").select("*"),
      ]);
      
      if (estatesRes.error) {
        toast({ title: "Error", description: estatesRes.error.message, variant: "destructive" });
      } else {
        setEstates(estatesRes.data || []);
      }

      if (!pricingRes.error && pricingRes.data) {
        const map: Record<string, DocPricing> = {};
        pricingRes.data.forEach((p: any) => { map[p.estate_id] = p; });
        setDocPricing(map);
      }
      setLoading(false);
    })();
  }, []);

  const getTotal = (estateId: string) => {
    const p = docPricing[estateId];
    if (!p) return FALLBACK_PRICE;
    return (p.survey_plan || 0) + (p.deed_of_assignment || 0) + (p.plot_demarcation || 0) + (p.plot_maintenance_fee || 0);
  };

  const handleAddDocumentationToCart = (estate: EstateLite) => {
    const total = getTotal(estate.id);
    addToCart(
      {
        id: `doc-${estate.id}`,
        propertyId: estate.id,
        propertyName: `${estate.name} Documentation`,
        location: estate.location,
        plotNumber: 0,
        size: 0,
        imageUrl: "/placeholder.svg",
        pricePerPlot: total,
        propertyType: "Documentation",
      },
      1
    );
    toast({
      title: "Added to Cart",
      description: `${estate.name} documentation (₦${total.toLocaleString()}) added to cart.`,
    });
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-primary mb-4">Estate Documentation</h2>
      <Card>
        <CardHeader>
          <CardTitle>All Estates - Documentation Fees</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && <div>Loading estates...</div>}
          {!loading && estates.length === 0 && <div>No estates found.</div>}
          {!loading && estates.length > 0 && (
            <div className="space-y-4">
              {estates.map((estate) => {
                const docPlotId = `doc-${String(estate.id)}`;
                const isAdded = cart?.find((item) => String(item.plot.id) === docPlotId) !== undefined;
                const pricing = docPricing[estate.id];
                const total = getTotal(estate.id);

                return (
                  <div key={estate.id} className="border-b pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">{estate.name}</div>
                        <div className="text-sm text-muted-foreground">{estate.location}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-primary">₦{total.toLocaleString()}</span>
                        <Button size="sm" variant="secondary" disabled={isAdded}
                          onClick={() => handleAddDocumentationToCart(estate)}>
                          {isAdded ? "Added" : "Add to Cart"}
                        </Button>
                      </div>
                    </div>
                    {pricing && (
                      <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-muted-foreground">
                        {pricing.survey_plan ? <span>Survey: ₦{pricing.survey_plan.toLocaleString()}</span> : null}
                        {pricing.deed_of_assignment ? <span>Deed: ₦{pricing.deed_of_assignment.toLocaleString()}</span> : null}
                        {pricing.plot_demarcation ? <span>Demarcation: ₦{pricing.plot_demarcation.toLocaleString()}</span> : null}
                        {pricing.plot_maintenance_fee ? <span>Maintenance: ₦{pricing.plot_maintenance_fee.toLocaleString()}</span> : null}
                      </div>
                    )}
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
