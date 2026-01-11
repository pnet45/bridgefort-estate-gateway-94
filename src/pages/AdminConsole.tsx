import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { Toaster } from '@/components/ui/toaster';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  Users, 
  FileText, 
  Mail, 
  Settings, 
  LayoutDashboard,
  LogOut,
  Bell,
  Home,
  UserCheck,
  CheckSquare,
  Calendar,
  StickyNote,
  Megaphone,
  FolderOpen,
  MessageSquare
} from 'lucide-react';
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
import { toast } from '@/hooks/use-toast';

const AdminConsole = () => {
  const { user, userRole, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const checkAdminAccess = async () => {
      if (!user) {
        navigate('/admin-login');
        return;
      }

      const { data: isAdmin, error } = await supabase
        .rpc('has_role', { _user_id: user.id, _role: 'admin' });

      if (error || !isAdmin) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to access the admin console",
          variant: "destructive"
        });
        navigate('/dashboard');
        return;
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      setProfile(profileData);

      const { count } = await supabase
        .from('pending_admin_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      setPendingCount(count || 0);
      setLoading(false);
    };

    checkAdminAccess();
  }, [user, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin-login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Admin Header */}
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white">Admin Console</h1>
                  <p className="text-xs text-slate-400">PWAN Bridgefort</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-400 hover:text-white relative"
              >
                <Bell className="h-5 w-5" />
                {pendingCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">
                    {pendingCount}
                  </span>
                )}
              </Button>

              <div className="flex items-center gap-3 px-3 py-1.5 bg-slate-700/50 rounded-lg">
                <div className="h-8 w-8 bg-primary/20 rounded-full flex items-center justify-center">
                  <span className="text-primary font-medium text-sm">
                    {profile?.first_name?.[0] || user?.email?.[0]?.toUpperCase() || 'A'}
                  </span>
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-white">
                    {profile?.first_name || 'Admin'}
                  </p>
                  <p className="text-xs text-slate-400">{userRole}</p>
                </div>
              </div>

              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="text-slate-400 hover:text-white"
              >
                <Home className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Main Site</span>
              </Button>

              <Button
                variant="ghost"
                onClick={handleSignOut}
                className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-slate-800 border border-slate-700 p-1 flex-wrap h-auto gap-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="crm" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2">
              <CheckSquare className="h-4 w-4" />
              <span className="hidden sm:inline">CRM</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger value="approvals" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2 relative">
              <UserCheck className="h-4 w-4" />
              <span className="hidden sm:inline">Approvals</span>
              {pendingCount > 0 && (
                <span className="ml-1 h-5 w-5 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">
                  {pendingCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="emails" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2">
              <Mail className="h-4 w-4" />
              <span className="hidden sm:inline">Emails</span>
            </TabsTrigger>
            <TabsTrigger value="content" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Content</span>
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <AdminDashboardStats />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <AdminInbox />
              </div>
              <div className="space-y-6">
                <AdminOnlineUsers />
                <AdminChat />
              </div>
            </div>
          </TabsContent>

          {/* CRM Tab */}
          <TabsContent value="crm" className="space-y-6">
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

          <TabsContent value="users">
            <UserManagementTab />
          </TabsContent>

          <TabsContent value="approvals">
            <AdminApprovalTab onCountChange={setPendingCount} />
          </TabsContent>

          <TabsContent value="emails">
            <AdminEmailCenter />
          </TabsContent>

          <TabsContent value="content">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Content Management</h2>
              <p className="text-slate-400">Blog posts, properties, and site content management.</p>
              <div className="mt-4 flex gap-4">
                <Button onClick={() => navigate('/create-post')}>Create Blog Post</Button>
                <Button variant="outline" onClick={() => navigate('/blog')}>View Blog</Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Toaster />
    </div>
  );
};

export default AdminConsole;
