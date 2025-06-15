
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface CartPlaceholderContentProps {
  title: string;
}

const CartPlaceholderContent: React.FC<CartPlaceholderContentProps> = ({ title }) => (
  <div className="space-y-6">
    <h1 className="text-3xl font-bold text-estate-blue">{title}</h1>
    <Card className="bg-white">
      <CardContent className="text-center py-12">
        <h3 className="text-xl font-semibold mb-2">Coming Soon</h3>
        <p className="text-gray-600">This feature is under development</p>
      </CardContent>
    </Card>
  </div>
);

export default CartPlaceholderContent;
