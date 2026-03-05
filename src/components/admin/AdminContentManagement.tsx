import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Home, Building, MessageSquare, Calendar, Image } from 'lucide-react';
import TrainingEventsTab from '@/components/dashboard/TrainingEventsTab';
import AdminHomeSalesContent from './content/AdminHomeSalesContent';
import AdminApartmentsContent from './content/AdminApartmentsContent';
import AdminTestimonialsContent from './content/AdminTestimonialsContent';
import AdminHeroSlidesContent from './content/AdminHeroSlidesContent';

const AdminContentManagement = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Content Management</h2>
        <p className="text-slate-400 mb-4">Manage blog posts, properties, training events, testimonials, and site content.</p>
        <div className="flex gap-4 mb-6">
          <Button onClick={() => navigate('/create-post')}>Create Blog Post</Button>
          <Button variant="outline" onClick={() => navigate('/blog')}>View Blog</Button>
        </div>
      </div>

      <Tabs defaultValue="hero" className="space-y-4">
        <TabsList className="bg-slate-800 border border-slate-700 p-1 flex-wrap h-auto gap-1">
          <TabsTrigger value="hero" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-1.5 text-xs sm:text-sm">
            <Image className="h-4 w-4" /> Hero Slides
          </TabsTrigger>
          <TabsTrigger value="training" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-1.5 text-xs sm:text-sm">
            <Calendar className="h-4 w-4" /> Training Events
          </TabsTrigger>
          <TabsTrigger value="homes" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-1.5 text-xs sm:text-sm">
            <Home className="h-4 w-4" /> Homes Sales
          </TabsTrigger>
          <TabsTrigger value="apartments" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-1.5 text-xs sm:text-sm">
            <Building className="h-4 w-4" /> Apartments for Rent
          </TabsTrigger>
          <TabsTrigger value="testimonials" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-1.5 text-xs sm:text-sm">
            <MessageSquare className="h-4 w-4" /> Client Testimonials
          </TabsTrigger>
        </TabsList>

        <TabsContent value="hero">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <AdminHeroSlidesContent />
          </div>
        </TabsContent>

        <TabsContent value="training">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <TrainingEventsTab />
          </div>
        </TabsContent>

        <TabsContent value="homes">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <AdminHomeSalesContent />
          </div>
        </TabsContent>

        <TabsContent value="apartments">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <AdminApartmentsContent />
          </div>
        </TabsContent>

        <TabsContent value="testimonials">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <AdminTestimonialsContent />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminContentManagement;
