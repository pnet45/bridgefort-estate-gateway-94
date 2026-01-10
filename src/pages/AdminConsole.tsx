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
  UserCheck
} from 'lucide-react';
import UserManagementTab from '@/components/dashboard/tabs/UserManagementTab';
import AdminApprovalTab from '@/components/admin/AdminApprovalTab';
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

      // Verify admin role
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

      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      setProfile(profileData);

      // Fetch pending admin requests count
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
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger 
              value="users" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2"
            >
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">User Management</span>
            </TabsTrigger>
            <TabsTrigger 
              value="approvals" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2 relative"
            >
              <UserCheck className="h-4 w-4" />
              <span className="hidden sm:inline">Admin Approvals</span>
              {pendingCount > 0 && (
                <span className="ml-1 h-5 w-5 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">
                  {pendingCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="content" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2"
            >
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Content</span>
            </TabsTrigger>
            <TabsTrigger 
              value="emails" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2"
            >
              <Mail className="h-4 w-4" />
              <span className="hidden sm:inline">Emails</span>
            </TabsTrigger>
            <TabsTrigger 
              value="settings" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2"
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Total Users"
                value="--"
                icon={<Users className="h-5 w-5" />}
                color="blue"
              />
              <StatCard
                title="Pending Approvals"
                value={pendingCount.toString()}
                icon={<UserCheck className="h-5 w-5" />}
                color="yellow"
              />
              <StatCard
                title="Blog Posts"
                value="--"
                icon={<FileText className="h-5 w-5" />}
                color="green"
              />
              <StatCard
                title="Emails Sent"
                value="--"
                icon={<Mail className="h-5 w-5" />}
                color="purple"
              />
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <QuickAction
                  title="Create User"
                  icon={<Users className="h-6 w-6" />}
                  onClick={() => {}}
                />
                <QuickAction
                  title="Send Email"
                  icon={<Mail className="h-6 w-6" />}
                  onClick={() => navigate('/bridgefortmails')}
                />
                <QuickAction
                  title="New Blog Post"
                  icon={<FileText className="h-6 w-6" />}
                  onClick={() => navigate('/create-post')}
                />
                <QuickAction
                  title="View Site"
                  icon={<Home className="h-6 w-6" />}
                  onClick={() => navigate('/')}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="users">
            <UserManagementTab />
          </TabsContent>

          <TabsContent value="approvals">
            <AdminApprovalTab onCountChange={setPendingCount} />
          </TabsContent>

          <TabsContent value="content">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Content Management</h2>
              <p className="text-slate-400">Blog posts, properties, and site content management coming soon.</p>
            </div>
          </TabsContent>

          <TabsContent value="emails">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Email Management</h2>
              <p className="text-slate-400 mb-4">Send emails to users and manage email templates.</p>
              <Button onClick={() => navigate('/bridgefortmails')}>
                Open Email Center
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Admin Settings</h2>
              <p className="text-slate-400">System settings and configuration coming soon.</p>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Toaster />
    </div>
  );
};

const StatCard = ({ 
  title, 
  value, 
  icon, 
  color 
}: { 
  title: string; 
  value: string; 
  icon: React.ReactNode; 
  color: 'blue' | 'green' | 'yellow' | 'purple';
}) => {
  const colorClasses = {
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    green: 'bg-green-500/10 text-green-400 border-green-500/20',
    yellow: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  };

  return (
    <div className={`p-6 rounded-xl border ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400">{title}</p>
          <p className="text-3xl font-bold text-white mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

const QuickAction = ({ 
  title, 
  icon, 
  onClick 
}: { 
  title: string; 
  icon: React.ReactNode; 
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className="p-4 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 rounded-xl transition-colors group"
  >
    <div className="text-primary group-hover:scale-110 transition-transform mb-2">
      {icon}
    </div>
    <p className="text-sm text-slate-300">{title}</p>
  </button>
);

export default AdminConsole;
