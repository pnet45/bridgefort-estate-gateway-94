import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  FileText, 
  Eye, 
  CreditCard, 
  Calendar,
  User,
  Building,
  ShoppingCart
} from 'lucide-react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import AccountInformation from './AccountInformation';
import InspectionBookingForm from './InspectionBookingForm';
import BlogPostsTab from './BlogPostsTab';
import SavedCartItems from './SavedCartItems';
import MyPaymentsSection from "./MyPaymentsSection";

const ClientDashboard = () => {
  const { user, userRole } = useAuth();
  const [inspections, setInspections] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allPosts, setAllPosts] = useState([]);
  const [userPosts, setUserPosts] = useState([]);

  useEffect(() => {
    if (user) {
      fetchUserData();
      if (userRole === 'admin') {
        fetchAllPosts();
      }
      fetchUserPosts();
    }
  }, [user, userRole]);

  const fetchUserData = async () => {
    try {
      // Fetch inspections
      const { data: inspectionData } = await supabase
        .from('inspection_bookings')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      setInspections(inspectionData || []);

      // Fetch orders if table exists
      try {
        const { data: orderData } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', user?.id)
          .order('created_at', { ascending: false });

        setOrders(orderData || []);
      } catch (error) {
        console.log('Orders table not found, skipping...');
        setOrders([]);
      }

    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllPosts = async () => {
    try {
      const { data } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:author_id (
            first_name,
            last_name
          )
        `)
        .order('created_at', { ascending: false });
      
      setAllPosts(data || []);
    } catch (error) {
      console.error('Error fetching all posts:', error);
    }
  };

  const fetchUserPosts = async () => {
    try {
      const { data } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:author_id (
            first_name,
            last_name
          )
        `)
        .eq('author_id', user?.id)
        .order('created_at', { ascending: false });
      
      setUserPosts(data || []);
    } catch (error) {
      console.error('Error fetching user posts:', error);
    }
  };

  const handleEditPost = (id: string) => {
    window.location.href = `/edit-post/${id}`;
  };

  const handleDeletePost = async (post: any) => {
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', post.id);

      if (error) throw error;

      // Refresh both lists
      if (userRole === 'admin') {
        fetchAllPosts();
      }
      fetchUserPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const statsCards = [
    {
      title: "Total Properties",
      value: "0",
      icon: Home,
      color: "text-blue-600"
    },
    {
      title: "Active Inspections", 
      value: inspections.filter(i => i.status === 'pending').length.toString(),
      icon: Eye,
      color: "text-green-600"
    },
    {
      title: "Total Orders",
      value: orders.length.toString(),
      icon: CreditCard,
      color: "text-purple-600"
    },
    {
      title: "Documents",
      value: "0",
      icon: FileText,
      color: "text-orange-600"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsCards.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <IconComponent className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="properties">Properties</TabsTrigger>
          <TabsTrigger value="inspections">Inspections</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="payments">My Payments</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          {userRole === 'admin' && <TabsTrigger value="blog">Blog</TabsTrigger>}
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SavedCartItems />
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar size={20} />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {inspections.slice(0, 3).map((inspection: any) => (
                    <div key={inspection.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{inspection.estate_name}</p>
                        <p className="text-xs text-gray-600">
                          {new Date(inspection.inspection_date).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={inspection.status === 'confirmed' ? 'default' : 'secondary'}>
                        {inspection.status}
                      </Badge>
                    </div>
                  ))}
                  
                  {inspections.length === 0 && (
                    <p className="text-gray-600 text-center py-4">No recent activity</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="properties">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building size={20} />
                My Properties
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">No properties found. Start browsing our available properties to make your first purchase.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inspections">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <InspectionBookingForm onBookingCreated={fetchUserData} />
            
            <Card>
              <CardHeader>
                <CardTitle>My Inspection Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {inspections.map((inspection: any) => (
                    <div key={inspection.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold">{inspection.estate_name}</h4>
                        <Badge variant={inspection.status === 'confirmed' ? 'default' : 'secondary'}>
                          {inspection.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        Date: {new Date(inspection.inspection_date).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-600 mb-1">
                        Time: {inspection.inspection_time}
                      </p>
                      {inspection.message && (
                        <p className="text-sm text-gray-600">
                          Message: {inspection.message}
                        </p>
                      )}
                    </div>
                  ))}
                  
                  {inspections.length === 0 && (
                    <p className="text-gray-600">No inspection bookings found.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="orders">
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
        </TabsContent>

        <TabsContent value="payments">
          <MyPaymentsSection />
        </TabsContent>

        <TabsContent value="account">
          <AccountInformation />
        </TabsContent>

        {userRole === 'admin' && (
          <TabsContent value="blog">
            <BlogPostsTab 
              isAdmin={userRole === 'admin'}
              allPosts={allPosts}
              userPosts={userPosts}
              loading={loading}
              onEditPost={handleEditPost}
              onDeleteClick={handleDeletePost}
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default ClientDashboard;
