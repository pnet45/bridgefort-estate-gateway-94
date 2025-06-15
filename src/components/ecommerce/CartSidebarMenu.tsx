
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  LayoutDashboard,
  Home,
  FileText,
  Eye,
  CreditCard,
  Calendar,
} from "lucide-react";

interface MenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
}

interface CartSidebarMenuProps {
  activeTab: string;
  setActiveTab: (id: string) => void;
}

const menuItems: MenuItem[] = [
  { id: "cart", label: "Shopping Cart", icon: Home },
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "properties", label: "My Properties", icon: Home },
  { id: "documents", label: "My Documents", icon: FileText },
  { id: "inspections", label: "Property Inspections", icon: Eye },
  { id: "payments", label: "My Payments", icon: CreditCard },
  { id: "installments", label: "My Installments", icon: Calendar },
];

const CartSidebarMenu: React.FC<CartSidebarMenuProps> = ({
  activeTab,
  setActiveTab,
}) => (
  <Card className="sticky top-24 bg-white">
    <CardHeader>
      <CardTitle className="text-lg text-estate-blue">Account Menu</CardTitle>
    </CardHeader>
    <CardContent className="p-0">
      <nav className="space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-100 transition-colors ${
                activeTab === item.id
                  ? "bg-estate-blue text-white hover:bg-estate-darkBlue"
                  : "text-gray-700"
              }`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </CardContent>
  </Card>
);

export default CartSidebarMenu;
