
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { CreditCard } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface OrdersTabProps {
  orders: any[];
}

const OrdersTab: React.FC<OrdersTabProps> = ({ orders }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <CreditCard size={20} />
        My Orders
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        {orders.map((order: any) => (
          <div key={order.id} className="p-4 border rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-semibold">Order #{order.id.slice(0, 8)}</h4>
              <Badge variant={order.payment_status === 'completed' ? 'default' : 'secondary'}>
                {order.payment_status}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 mb-1">
              Total: ₦{order.total_amount?.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">
              Date: {new Date(order.created_at).toLocaleDateString()}
            </p>
          </div>
        ))}
        {orders.length === 0 && (
          <p className="text-gray-600">No orders found.</p>
        )}
      </div>
    </CardContent>
  </Card>
);

export default OrdersTab;
