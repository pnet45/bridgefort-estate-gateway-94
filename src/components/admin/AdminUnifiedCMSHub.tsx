import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Images, CalendarDays, PanelsTopLeft, MessageSquare } from 'lucide-react';
import AdminContentHub from '@/components/admin/AdminContentHub';
import AdminHeroSlidesContent from '@/components/admin/content/AdminHeroSlidesContent';
import AdminCircularGalleryContent from '@/components/admin/content/AdminCircularGalleryContent';
import AdminTestimonialsContent from '@/components/admin/content/AdminTestimonialsContent';
import TrainingEventsTab from '@/components/dashboard/TrainingEventsTab';

interface AdminUnifiedCMSHubProps {
  canManageContent: boolean;
  canManageSections: boolean;
}

const AdminUnifiedCMSHub: React.FC<AdminUnifiedCMSHubProps> = ({
  canManageContent,
  canManageSections,
}) => {
  const defaultTab = canManageContent ? 'editorial' : 'hero';

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-slate-700 bg-slate-800 p-4 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">Website publishing workspace</p>
            <h2 className="mt-1 text-xl font-bold text-white sm:text-2xl">Unified CMS Hub</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
              Create and manage website articles, page content, hero slides, training updates, client testimonials and gallery media from one workspace.
              Published changes flow to their connected website sections.
            </p>
          </div>
          <div className="rounded-lg border border-slate-600 bg-slate-900/70 px-3 py-2 text-xs text-slate-300">
            Shared publishing workspace
          </div>
        </div>
      </div>

      <Tabs defaultValue={defaultTab} className="space-y-4">
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 rounded-xl border border-slate-700 bg-slate-900 p-2">
          {canManageContent && (
            <TabsTrigger value="editorial" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <FileText className="h-4 w-4" /> Articles & Pages
            </TabsTrigger>
          )}
          {canManageSections && (
            <>
              <TabsTrigger value="hero" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <PanelsTopLeft className="h-4 w-4" /> Hero Slides
              </TabsTrigger>
              <TabsTrigger value="training" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <CalendarDays className="h-4 w-4" /> Training
              </TabsTrigger>
              <TabsTrigger value="testimonials" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <MessageSquare className="h-4 w-4" /> Testimonials
              </TabsTrigger>
              <TabsTrigger value="gallery" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Images className="h-4 w-4" /> Gallery
              </TabsTrigger>
            </>
          )}
        </TabsList>

        {canManageContent && (
          <TabsContent value="editorial" className="min-w-0">
            <AdminContentHub />
          </TabsContent>
        )}
        {canManageSections && (
          <>
            <TabsContent value="hero" className="min-w-0">
              <div className="rounded-xl border border-slate-700 bg-slate-800 p-3 sm:p-5">
                <AdminHeroSlidesContent />
              </div>
            </TabsContent>
            <TabsContent value="training" className="min-w-0">
              <div className="rounded-xl border border-slate-700 bg-slate-800 p-3 sm:p-5">
                <TrainingEventsTab />
              </div>
            </TabsContent>
            <TabsContent value="testimonials" className="min-w-0">
              <div className="rounded-xl border border-slate-700 bg-slate-800 p-3 sm:p-5">
                <AdminTestimonialsContent />
              </div>
            </TabsContent>
            <TabsContent value="gallery" className="min-w-0">
              <AdminCircularGalleryContent />
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
};

export default AdminUnifiedCMSHub;
