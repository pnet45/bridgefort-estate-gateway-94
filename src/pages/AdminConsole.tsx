import React, { useEffect, useLayoutEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, Users, FileText, Mail, LayoutDashboard, LogOut, Bell, Home,
  UserCheck, CheckSquare, Calendar, Building, Activity, TrendingUp,
  DollarSign, Settings, Plane, Wallet, Network
} from 'lucide-react';
import { useIsSuperAdmin } from '@/hooks/useIsSuperAdmin';
import UserManagementTab from '@/components/dashboard/tabs/UserManagementTab';
import AdminApprovalsHub from '@/components/admin/AdminApprovalsHub';
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
import NotificationBell from '@/components/notifications/NotificationBell';
import AdminPropertyAnalytics from '@/components/admin/AdminPropertyAnalytics';
import AdminMlmFunnelDashboard from '@/components/admin/AdminMlmFunnelDashboard';
import AdminContentManagement from '@/components/admin/AdminContentManagement';
import AdminContentHub from '@/components/admin/AdminContentHub';
import AdminOtherPayments from '@/components/admin/AdminOtherPayments';
import AdminWithdrawalRequests from '@/components/admin/AdminWithdrawalRequests';
import AdminRolePermissions from '@/components/admin/AdminRolePermissions';
import AdminCRMLeads from '@/components/admin/AdminCRMLeads';
import AdminBirthdayWidget from '@/components/admin/AdminBirthdayWidget';
import AdminEstateViewsLeaderboard from '@/components/admin/AdminEstateViewsLeaderboard';
import AdminTravelDashboard from '@/components/admin/AdminTravelDashboard';
import { toast } from '@/hooks/use-toast';

type AdminProfile = {
  id?: string;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
};

type TawkWindow = Window & {
  Tawk_API?: {
    hideWidget?: () => void;
    showWidget?: () => void;
    onLoad?: () => void;
  };
};

const AdminConsole = () => {
  // Always open the console scrolled to the top. This runs in
  // useLayoutEffect (before paint) rather than useEffect (after paint) so
  // there's no flash of a scrolled-down frame on mount — global native
  // scroll restoration is disabled once, app-wide, in ScrollToTop.tsx.
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { user, userRole, signOut } = useAuth();
  const { isSuperAdmin } = useIsSuperAdmin();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(() => searchParams.get('tab') || 'overview');

  // Keep the active tab in sync with the URL after mount too (e.g. the
  // "Create Content" shortcuts on the CMS tabs navigate to ?tab=properties
  // while the console is already open, which wouldn't otherwise re-render).
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [searchParams, activeTab]);

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

  // Tawk.to loads via a raw <script> tag in index.html on a delay, independent
  // of React Router, so it can't be conditionally rendered like our other
  // floating widgets. Instead I hide it through its own API: immediately if
  // it has already loaded, and via onLoad in case it finishes loading later
  // while the admin is still on this page. It's restored on unmount so it
  // still shows up for admins once they navigate back to the public site.
  useEffect(() => {
    const w = window as TawkWindow;

    const hideTawk = () => {
      if (w.Tawk_API?.hideWidget) {
        w.Tawk_API.hideWidget();
      }
    };

    hideTawk();
    const previousOnLoad = w.Tawk_API?.onLoad;
    w.Tawk_API = w.Tawk_API || {};
    w.Tawk_API.onLoad = () => {
      previousOnLoad?.();
      hideTawk();
    };

    return () => {
      if (w.Tawk_API?.showWidget) {
        w.Tawk_API.showWidget();
      }
    };
  }, []);

  const handleSignOut = async () => {
    if (user) {
      // Mark this admin offline immediately on an explicit sign-out, rather
      // than relying solely on the browser's unload event to fire.
      await supabase
        .from('admin_presence')
        .update({ is_online: false, status: 'offline', last_seen: new Date().toISOString() })
        .eq('user_id', user.id);
    }
    await signOut();
    navigate('/admin-login');
  };

  if (loading) {
    return (
      <div className="admin-theme min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="admin-theme min-h-screen">
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

              {/* System alerts: birthdays, withdrawal/payment status, renewal reminders */}
              <NotificationBell audience="admin" triggerClassName="text-slate-400 hover:text-white" />

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
            <TabsTrigger value="overview" className="text-white data-[state=active]:bg-primary data-[state=active]:text-white gap-1.5 text-xs sm:text-sm" style={{ color: '#fff' }}>
              <LayoutDashboard className="h-4 w-4" />
              <span>Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="properties" className="text-white data-[state=active]:bg-primary data-[state=active]:text-white gap-1.5 text-xs sm:text-sm" style={{ color: '#fff' }}>
              <Building className="h-4 w-4" />
              <span>Properties</span>
            </TabsTrigger>
            <TabsTrigger value="crm" className="text-white data-[state=active]:bg-primary data-[state=active]:text-white gap-1.5 text-xs sm:text-sm" style={{ color: '#fff' }}>
              <CheckSquare className="h-4 w-4" />
              <span>CRM</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="text-white data-[state=active]:bg-primary data-[state=active]:text-white gap-1.5 text-xs sm:text-sm" style={{ color: '#fff' }}>
              <Users className="h-4 w-4" />
              <span>Users</span>
            </TabsTrigger>
            <TabsTrigger value="approvals" className="text-white data-[state=active]:bg-primary data-[state=active]:text-white gap-1.5 text-xs sm:text-sm relative" style={{ color: '#fff' }}>
              <UserCheck className="h-4 w-4" />
              <span>Approvals</span>
              {pendingCount > 0 && (
                <span className="ml-1 h-5 w-5 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">{pendingCount}</span>
              )}
            </TabsTrigger>
            <TabsTrigger value="emails" className="text-white data-[state=active]:bg-primary data-[state=active]:text-white gap-1.5 text-xs sm:text-sm" style={{ color: '#fff' }}>
              <Mail className="h-4 w-4" />
              <span>Emails</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="text-white data-[state=active]:bg-primary data-[state=active]:text-white gap-1.5 text-xs sm:text-sm" style={{ color: '#fff' }}>
              <TrendingUp className="h-4 w-4" />
              <span>Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="mlm-funnel" className="text-white data-[state=active]:bg-primary data-[state=active]:text-white gap-1.5 text-xs sm:text-sm" style={{ color: '#fff' }}>
              <Network className="h-4 w-4" />
              <span>BHRealtors Funnel</span>
            </TabsTrigger>
            <TabsTrigger value="activity" className="text-white data-[state=active]:bg-primary data-[state=active]:text-white gap-1.5 text-xs sm:text-sm" style={{ color: '#fff' }}>
              <Activity className="h-4 w-4" />
              <span>Activity</span>
            </TabsTrigger>
            <TabsTrigger value="content" className="text-white data-[state=active]:bg-primary data-[state=active]:text-white gap-1.5 text-xs sm:text-sm" style={{ color: '#fff' }}>
              <FileText className="h-4 w-4" />
              <span>Content</span>
            </TabsTrigger>
            <TabsTrigger value="cms" className="text-white data-[state=active]:bg-primary data-[state=active]:text-white gap-1.5 text-xs sm:text-sm" style={{ color: '#fff' }}>
              <FileText className="h-4 w-4" />
              <span>CMS Hub</span>
            </TabsTrigger>
            <TabsTrigger value="other-payments" className="text-white data-[state=active]:bg-primary data-[state=active]:text-white gap-1.5 text-xs sm:text-sm" style={{ color: '#fff' }}>
              <DollarSign className="h-4 w-4" />
              <span>Other Payments</span>
            </TabsTrigger>
            <TabsTrigger value="permissions" className="text-white data-[state=active]:bg-primary data-[state=active]:text-white gap-1.5 text-xs sm:text-sm" style={{ color: '#fff' }}>
              <Settings className="h-4 w-4" />
              <span>Permissions</span>
            </TabsTrigger>
            {isSuperAdmin && (
              <TabsTrigger value="travels" className="text-white data-[state=active]:bg-primary data-[state=active]:text-white gap-1.5 text-xs sm:text-sm" style={{ color: '#fff' }}>
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
            <AdminBirthdayWidget />
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
          <TabsContent value="approvals"><AdminApprovalsHub onCountChange={setPendingCount} /></TabsContent>
          <TabsContent value="emails"><AdminEmailCenter /></TabsContent>
          <TabsContent value="analytics"><AdminPropertyAnalytics /></TabsContent>
          <TabsContent value="mlm-funnel"><AdminMlmFunnelDashboard /></TabsContent>
          <TabsContent value="activity"><AdminActivityLogs /></TabsContent>
          <TabsContent value="content"><AdminContentManagement /></TabsContent>
          <TabsContent value="cms"><AdminContentHub /></TabsContent>
          <TabsContent value="other-payments"><AdminOtherPayments /></TabsContent>
          <TabsContent value="permissions"><AdminRolePermissions /></TabsContent>
          {isSuperAdmin && <TabsContent value="travels"><AdminTravelDashboard /></TabsContent>}
        </Tabs>
      </main>

    </div>
  );
};

export default AdminConsole;
