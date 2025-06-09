
export interface Plot {
  id: string;
  propertyId: string;
  propertyName: string;
  location: string;
  pricePerPlot: number;
  plotNumber: number;
  imageUrl: string;
  size: number;
  propertyType: string;
  phase?: number;
}

export interface CartItem {
  plot: Plot;
  quantity: number;
}

export interface Customer {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

export interface PaymentInfo {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardName: string;
}

export interface Order {
  id: string;
  customerId: string;
  items: CartItem[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  customerInfo: Customer;
  paymentInfo: Partial<PaymentInfo>;
  createdAt: Date;
}

export interface EcommerceContextType {
  cart: CartItem[];
  addToCart: (plot: Plot, quantity: number) => void;
  removeFromCart: (plotId: string) => void;
  updateQuantity: (plotId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalAmount: () => number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  checkout: (customerInfo: Customer, paymentInfo: PaymentInfo) => Promise<Order>;
}
