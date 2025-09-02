import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Eye, 
  CreditCard, 
  Calendar, 
  Home, 
  DollarSign,
  Clock
} from 'lucide-react';

interface Payment {
  id: string;
  property_id: string;
  total_amount: number;
  status: string;
  created_at: string;
  plan_type: string;
  months: number;
}

interface Order {
  id: string;
  total_amount: number;
  payment_status: string;
  created_at: string;
  items: any;
}

interface Inspection {
  id: string;
  estate_name: string;
  inspection_date: string;
  inspection_time: string;
  status: string;
  created_at: string;
}

interface CartDashboardProps {
  tabType: string;
}

const CartDashboard: React.FC<CartDashboardProps> = ({ tabType }) => {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user, tabType]);

  const fetchUserData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Fetch payments
      const { data: paymentsData } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Fetch orders
      const { data: ordersData } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Fetch inspections
      const { data: inspectionsData } = await supabase
        .from('inspection_bookings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      setPayments(paymentsData || []);
      setOrders(ordersData || []);
      setInspections(inspectionsData || []);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'successful':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-estate-blue"></div>
      </div>
    );
  }

  const renderDashboard = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-estate-blue">Dashboard Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Payments</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{payments.filter(p => p.status !== 'completed').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inspections</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inspections.length}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderProperties = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-estate-blue">My Properties</h2>
      {orders.length > 0 ? (
        <div className="grid gap-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Home size={20} />
                    Order #{order.id.slice(0, 8)}
                  </CardTitle>
                  <Badge className={getStatusColor(order.payment_status)}>
                    {order.payment_status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p><strong>Amount:</strong> {formatCurrency(order.total_amount)}</p>
                  <p><strong>Date:</strong> {new Date(order.created_at).toLocaleDateString()}</p>
                  {order.items && (
                    <p><strong>Items:</strong> {JSON.parse(order.items).length} plot(s)</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            <Home className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600">No properties found</p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderPayments = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-estate-blue">My Payments</h2>
      {payments.length > 0 ? (
        <div className="grid gap-4">
          {payments.map((payment) => (
            <Card key={payment.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard size={20} />
                    Payment Plan - {payment.plan_type}
                  </CardTitle>
                  <Badge className={getStatusColor(payment.status)}>
                    {payment.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p><strong>Total Amount:</strong> {formatCurrency(payment.total_amount)}</p>
                  <p><strong>Duration:</strong> {payment.months} months</p>
                  <p><strong>Property ID:</strong> {payment.property_id}</p>
                  <p><strong>Date:</strong> {new Date(payment.created_at).toLocaleDateString()}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            <CreditCard className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600">No payments found</p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderInspections = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-estate-blue">Property Inspections</h2>
      {inspections.length > 0 ? (
        <div className="grid gap-4">
          {inspections.map((inspection) => (
            <Card key={inspection.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Eye size={20} />
                    {inspection.estate_name}
                  </CardTitle>
                  <Badge className={getStatusColor(inspection.status)}>
                    {inspection.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p><strong>Date:</strong> {new Date(inspection.inspection_date).toLocaleDateString()}</p>
                  <p><strong>Time:</strong> {inspection.inspection_time}</p>
                  <p><strong>Booked:</strong> {new Date(inspection.created_at).toLocaleDateString()}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            <Eye className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600">No inspections booked</p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderDocuments = () => (
    <Card>
      <CardContent className="text-center py-8">
        <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold mb-2">Document Management</h3>
        <p className="text-gray-600 mb-4">Access and manage your property documents</p>
        <Badge variant="outline">Coming Soon</Badge>
      </CardContent>
    </Card>
  );

  const renderInstallments = () => (
    <Card>
      <CardContent className="text-center py-8">
        <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold mb-2">Installment Plans</h3>
        <p className="text-gray-600 mb-4">View and manage your payment schedules</p>
        <Badge variant="outline">Coming Soon</Badge>
      </CardContent>
    </Card>
  );

  switch (tabType) {
    case 'dashboard':
      return renderDashboard();
    case 'properties':
      return renderProperties();
    case 'documents':
      return renderDocuments();
    case 'inspections':
      return renderInspections();
    case 'payments':
      return renderPayments();
    case 'installments':
      return renderInstallments();
    default:
      return renderDashboard();
  }
};

export default CartDashboard;