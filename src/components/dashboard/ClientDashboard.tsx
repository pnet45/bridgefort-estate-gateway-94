
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import OverviewTab from './tabs/OverviewTab';
import PropertiesTab from './tabs/PropertiesTab';
import OrdersTab from './tabs/OrdersTab';
import InspectionsTab from './tabs/InspectionsTab';
import DocumentationPricingTab from './DocumentationPricingTab';
import MyPaymentsSection from './MyPaymentsSection';
import BlogPostsTab from './BlogPostsTab';
import { useAuth } from '@/contexts/auth';

const ClientDashboard = () => {
  const { userRole } = useAuth();
  const canCreatePosts = ['admin', 'manager', 'team_leader'].includes(userRole || '');

  return (
    <div className="container mx-auto px-4 py-8">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="properties">Properties</TabsTrigger>
          <TabsTrigger value="documentation">Documentation</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="inspections">Inspections</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          {canCreatePosts && <TabsTrigger value="blog">Blog Posts</TabsTrigger>}
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <OverviewTab />
        </TabsContent>

        <TabsContent value="properties" className="space-y-6">
          <PropertiesTab />
        </TabsContent>

        <TabsContent value="documentation" className="space-y-6">
          <DocumentationPricingTab />
        </TabsContent>

        <TabsContent value="orders" className="space-y-6">
          <OrdersTab />
        </TabsContent>

        <TabsContent value="inspections" className="space-y-6">
          <InspectionsTab />
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <MyPaymentsSection />
        </TabsContent>

        {canCreatePosts && (
          <TabsContent value="blog" className="space-y-6">
            <BlogPostsTab />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default ClientDashboard;
