import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Home, FileText, Eye, CreditCard, Calendar, User, Building, ShoppingCart } from 'lucide-react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import AccountInformation from './AccountInformation';
import BlogPostsTab from './BlogPostsTab';
import MyPaymentsSection from "./MyPaymentsSection";
import DocumentationTab from './DocumentationTab';

// Tabs
import OverviewTab from './tabs/OverviewTab';
import PropertiesTab from './tabs/PropertiesTab';
import InspectionsTab from './tabs/InspectionsTab';
import OrdersTab from './tabs/OrdersTab';

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
          <TabsTrigger value="documentation">Documentation</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          {userRole === 'admin' && <TabsTrigger value="blog">Blog</TabsTrigger>}
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <OverviewTab inspections={inspections} fetchUserData={fetchUserData} />
        </TabsContent>
        <TabsContent value="properties">
          <PropertiesTab />
        </TabsContent>
        <TabsContent value="inspections">
          <InspectionsTab inspections={inspections} fetchUserData={fetchUserData} />
        </TabsContent>
        <TabsContent value="orders">
          <OrdersTab orders={orders} />
        </TabsContent>
        <TabsContent value="payments">
          <MyPaymentsSection />
        </TabsContent>
        <TabsContent value="documentation">
          <DocumentationTab />
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
