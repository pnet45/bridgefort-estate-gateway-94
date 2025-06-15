
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth";
import { useEcommerce } from "@/contexts/ecommerce";
import { supabase } from "@/integrations/supabase/client";

const DOCUMENTATION_PRICE = 150000;

interface EstateLite {
  id: string;
  name: string;
  location: string;
}

const DocumentationTab: React.FC = () => {
  const { user } = useAuth();
  const { addToCart, cart } = useEcommerce();
  const [estates, setEstates] = useState<EstateLite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch estate list from API
    (async () => {
      const { data, error } = await supabase
        .from("estate")
        .select("id, name, location");
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
        setLoading(false);
        return;
      }
      setEstates(data || []);
      setLoading(false);
    })();
  }, []);

  const handleAddDocumentationToCart = (estate: EstateLite) => {
    addToCart(
      {
        id: `doc-${estate.id}`,
        propertyName: `${estate.name} Documentation`,
        location: estate.location,
        plotNumber: "-", // not relevant
        size: "-", // not relevant
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

  return (
    <div>
      <h2 className="text-3xl font-bold text-estate-blue mb-4">Estate Documentation</h2>
      <Card>
        <CardHeader>
          <CardTitle>All Estates - Choose for Documentation Payment</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && <div>Loading estates...</div>}
          {!loading && estates.length === 0 && (
            <div>No estates found.</div>
          )}
          {!loading && estates.length > 0 && (
            <div className="space-y-4">
              {estates.map((estate) => {
                // Ensure estate.id is a string for comparison
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

