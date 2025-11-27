
import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import OverviewTab from './tabs/OverviewTab';
import PropertiesTab from './tabs/PropertiesTab';
import OrdersTab from './tabs/OrdersTab';
import InspectionsTab from './tabs/InspectionsTab';
import DocumentationPricingTab from './DocumentationPricingTab';
import MyPaymentsSection from './MyPaymentsSection';
import BlogPostsTab from './BlogPostsTab';
import TrainingEventsTab from './TrainingEventsTab';
import TrainingAnalyticsTab from './TrainingAnalyticsTab';
import AttendanceTab from './AttendanceTab';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';

const ClientDashboard = () => {
  const { userRole, user } = useAuth();
  const canCreatePosts = ['admin', 'manager', 'team_leader'].includes(userRole || '');
  const isAdmin = userRole === 'admin';
  
  const [inspections, setInspections] = useState([]);
  const [orders, setOrders] = useState([]);
  const [allPosts, setAllPosts] = useState([]);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Fetch inspections
      const { data: inspectionsData } = await supabase
        .from('inspection_bookings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      // Fetch orders
      const { data: ordersData } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      // Fetch posts
      const { data: userPostsData } = await supabase
        .from('posts')
        .select('*')
        .eq('author_id', user.id)
        .order('created_at', { ascending: false });
      
      let allPostsData = [];
      if (isAdmin) {
        const { data } = await supabase
          .from('posts')
          .select('*')
          .order('created_at', { ascending: false });
        allPostsData = data || [];
      }
      
      setInspections(inspectionsData || []);
      setOrders(ordersData || []);
      setUserPosts(userPostsData || []);
      setAllPosts(allPostsData);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [user, userRole]);

  const handleEditPost = (id: string) => {
    // Navigate to edit post page
    window.location.href = `/edit-post/${id}`;
  };

  const handleDeleteClick = (post: any) => {
    // Handle post deletion
    console.log('Delete post:', post);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className={`grid w-full ${isAdmin ? 'grid-cols-3 md:grid-cols-10' : canCreatePosts ? 'grid-cols-3 md:grid-cols-7' : 'grid-cols-3 md:grid-cols-6'} gap-1`}>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="properties">Properties</TabsTrigger>
          <TabsTrigger value="documentation" className="text-xs md:text-sm">
            Documentation
          </TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="inspections" className="text-xs md:text-sm">
            Inspections
          </TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          {canCreatePosts && <TabsTrigger value="blog">Blog Posts</TabsTrigger>}
          {isAdmin && (
            <>
              <TabsTrigger value="training">Training</TabsTrigger>
              <TabsTrigger value="attendance" className="text-xs md:text-sm">Attendance</TabsTrigger>
              <TabsTrigger value="analytics" className="text-xs md:text-sm">Analytics</TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <OverviewTab inspections={inspections} fetchUserData={fetchUserData} />
        </TabsContent>

        <TabsContent value="properties" className="space-y-6">
          <PropertiesTab />
        </TabsContent>

        <TabsContent value="documentation" className="space-y-6">
          <DocumentationPricingTab />
        </TabsContent>

        <TabsContent value="orders" className="space-y-6">
          <OrdersTab orders={orders} />
        </TabsContent>

        <TabsContent value="inspections" className="space-y-6">
          <InspectionsTab inspections={inspections} fetchUserData={fetchUserData} />
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <MyPaymentsSection />
        </TabsContent>

        {canCreatePosts && (
          <TabsContent value="blog" className="space-y-6">
            <BlogPostsTab 
              isAdmin={isAdmin}
              allPosts={allPosts}
              userPosts={userPosts}
              loading={loading}
              onEditPost={handleEditPost}
              onDeleteClick={handleDeleteClick}
            />
          </TabsContent>
        )}

        {isAdmin && (
          <>
            <TabsContent value="training" className="space-y-6">
              <TrainingEventsTab />
            </TabsContent>
            <TabsContent value="attendance" className="space-y-6">
              <AttendanceTab />
            </TabsContent>
            <TabsContent value="analytics" className="space-y-6">
              <TrainingAnalyticsTab />
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
};

export default ClientDashboard;
