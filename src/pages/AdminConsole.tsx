import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { Toaster } from '@/components/ui/toaster';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, Users, FileText, Mail, LayoutDashboard, LogOut, Bell, Home,
  UserCheck, CheckSquare, Calendar, Building, Activity, TrendingUp,
  DollarSign, Settings, Plane
} from 'lucide-react';
import { useIsSuperAdmin } from '@/hooks/useIsSuperAdmin';
import UserManagementTab from '@/components/dashboard/tabs/UserManagementTab';
import AdminApprovalTab from '@/components/admin/AdminApprovalTab';
import AdminEmailCenter from '@/components/admin/AdminEmailCenter';
import AdminDashboardStats from '@/components/admin/AdminDashboardStats';
import AdminInbox from '@/components/admin/AdminInbox';
import AdminTaskManager from '@/components/admin/AdminTaskManager';
import AdminCalendar from '@/components/admin/AdminCalendar';
import AdminNotes from '@/components/admin/AdminNotes';
import AdminNotices from '@/components/admin/AdminNotices';
import AdminFileSharing from '@/components/admin/AdminFileSharing';
import AdminChat from '@/components/admin/AdminChat';
import AdminOnlineUsers from '@/components/admin/AdminOnlineUsers';
import AdminPropertyManagement from '@/components/admin/AdminPropertyManagement';
import AdminActivityLogs from '@/components/admin/AdminActivityLogs';
import AdminNotificationCenter from '@/components/admin/AdminNotificationCenter';
import AdminPropertyAnalytics from '@/components/admin/AdminPropertyAnalytics';
import AdminContentManagement from '@/components/admin/AdminContentManagement';
import AdminContentHub from '@/components/admin/AdminContentHub';
import AdminOtherPayments from '@/components/admin/AdminOtherPayments';
import AdminRolePermissions from '@/components/admin/AdminRolePermissions';
import AdminCRMLeads from '@/components/admin/AdminCRMLeads';
import AdminEstateViewsLeaderboard from '@/components/admin/AdminEstateViewsLeaderboard';
import AdminTravelDashboard from '@/components/admin/AdminTravelDashboard';
import { toast } from '@/hooks/use-toast';

const AdminConsole = () => {
  const { user, userRole, signOut } = useAuth();
  const { isSuperAdmin } = useIsSuperAdmin();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const checkAdminAccess = async () => {
      if (!user) { navigate('/admin-login'); return; }
      const { data: isAdmin, error } = await supabase.rpc('has_role', { _user_id: user.id, _role: 'admin' });
      if (error || !isAdmin) {
        toast({ title: "Access Denied", description: "You don't have permission to access the admin console", variant: "destructive" });
        navigate('/dashboard'); return;
      }
      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(profileData);
      const { count } = await supabase.from('pending_admin_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending');
      setPendingCount(count || 0);
      setLoading(false);
    };
    checkAdminAccess();
  }, [user, navigate]);

  const handleSignOut = async () => { await signOut(); navigate('/admin-login'); };

  if (loading) {
    return (
      <div className="admin-theme min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="admin-theme min-h-[200vh]">
      {/* Admin Header */}
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white">Admin Console</h1>
                  <p className="text-xs text-slate-400">Bridgefort Homes Development Ltd</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <div className="relative">
                <Button variant="ghost" size="icon" onClick={() => setNotificationOpen(!notificationOpen)} className="text-slate-400 hover:text-white relative">
                  <Bell className="h-5 w-5" />
                  {pendingCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">{pendingCount}</span>
                  )}
                </Button>
                <AdminNotificationCenter isOpen={notificationOpen} onClose={() => setNotificationOpen(false)} onNavigate={(tab) => setActiveTab(tab)} />
              </div>

              <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 bg-slate-700/50 rounded-lg">
                <div className="h-8 w-8 bg-primary/20 rounded-full flex items-center justify-center">
                  <span className="text-primary font-medium text-sm">{profile?.first_name?.[0] || user?.email?.[0]?.toUpperCase() || 'A'}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{profile?.first_name || 'Admin'}</p>
                  <p className="text-xs text-slate-400">{userRole}</p>
                </div>
              </div>

              <Button variant="ghost" onClick={() => navigate('/')} className="text-slate-400 hover:text-white">
                <Home className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Main Site</span>
              </Button>
              <Button variant="ghost" onClick={handleSignOut} className="text-red-400 hover:text-red-300 hover:bg-red-900/20">
                <LogOut className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-slate-800 border border-slate-700 p-1 flex flex-wrap h-auto gap-1 justify-start">
            {/* Row 1 - Primary tabs */}
            <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-1.5 text-xs sm:text-sm">
              <LayoutDashboard className="h-4 w-4" />
              <span>Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="properties" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-1.5 text-xs sm:text-sm">
              <Building className="h-4 w-4" />
              <span>Properties</span>
            </TabsTrigger>
            <TabsTrigger value="crm" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-1.5 text-xs sm:text-sm">
              <CheckSquare className="h-4 w-4" />
              <span>CRM</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-1.5 text-xs sm:text-sm">
              <Users className="h-4 w-4" />
              <span>Users</span>
            </TabsTrigger>
            <TabsTrigger value="approvals" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-1.5 text-xs sm:text-sm relative">
              <UserCheck className="h-4 w-4" />
              <span>Approvals</span>
              {pendingCount > 0 && (
                <span className="ml-1 h-5 w-5 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">{pendingCount}</span>
              )}
            </TabsTrigger>
            <TabsTrigger value="emails" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-1.5 text-xs sm:text-sm">
              <Mail className="h-4 w-4" />
              <span>Emails</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-1.5 text-xs sm:text-sm">
              <TrendingUp className="h-4 w-4" />
              <span>Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="activity" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-1.5 text-xs sm:text-sm">
              <Activity className="h-4 w-4" />
              <span>Activity</span>
            </TabsTrigger>
            <TabsTrigger value="content" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-1.5 text-xs sm:text-sm">
              <FileText className="h-4 w-4" />
              <span>Content</span>
            </TabsTrigger>
            <TabsTrigger value="cms" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-1.5 text-xs sm:text-sm">
              <FileText className="h-4 w-4" />
              <span>CMS Hub</span>
            </TabsTrigger>
            <TabsTrigger value="other-payments" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-1.5 text-xs sm:text-sm">
              <DollarSign className="h-4 w-4" />
              <span>Other Payments</span>
            </TabsTrigger>
            <TabsTrigger value="permissions" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-1.5 text-xs sm:text-sm">
              <Settings className="h-4 w-4" />
              <span>Permissions</span>
            </TabsTrigger>
            {isSuperAdmin && (
              <TabsTrigger value="travels" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-1.5 text-xs sm:text-sm">
                <Plane className="h-4 w-4" />
                <span>Travels</span>
                <span className="ml-1 text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded">Super</span>
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <AdminDashboardStats />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <AdminInbox />
                <AdminEstateViewsLeaderboard />
              </div>
              <div className="space-y-6">
                <AdminOnlineUsers />
                <AdminChat />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="properties"><AdminPropertyManagement /></TabsContent>

          <TabsContent value="crm" className="space-y-6">
            <AdminCRMLeads />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AdminTaskManager />
              <AdminCalendar />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <AdminNotices />
              <AdminNotes />
              <AdminFileSharing />
            </div>
          </TabsContent>

          <TabsContent value="users"><UserManagementTab /></TabsContent>
          <TabsContent value="approvals"><AdminApprovalTab onCountChange={setPendingCount} /></TabsContent>
          <TabsContent value="emails"><AdminEmailCenter /></TabsContent>
          <TabsContent value="analytics"><AdminPropertyAnalytics /></TabsContent>
          <TabsContent value="activity"><AdminActivityLogs /></TabsContent>
          <TabsContent value="content"><AdminContentManagement /></TabsContent>
          <TabsContent value="cms"><AdminContentHub /></TabsContent>
          <TabsContent value="other-payments"><AdminOtherPayments /></TabsContent>
          <TabsContent value="permissions"><AdminRolePermissions /></TabsContent>
          {isSuperAdmin && <TabsContent value="travels"><AdminTravelDashboard /></TabsContent>}
        </Tabs>
      </main>

      <Toaster />
    </div>
  );
};

export default AdminConsole;
