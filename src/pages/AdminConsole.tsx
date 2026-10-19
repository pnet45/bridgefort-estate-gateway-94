import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Users, FileText, BookOpen, Mail, LayoutDashboard, LogOut, Bell, Home, UserCheck, CheckSquare, Building, Activity, TrendingUp, DollarSign, Settings, Plane, Network, Images, Building2, Sprout, MapPinned, PanelLeftClose, PanelLeftOpen, Menu, X, Sun, Moon } from 'lucide-react';
import { useIsSuperAdmin } from '@/hooks/useIsSuperAdmin';
import { getAllowedAdminTabs, isAdminRole } from '@/lib/rbac';
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
import AdminClientAllocations from '@/components/admin/AdminClientAllocations';
import DocumentationWorkflow from '@/components/admin/DocumentationWorkflow';
import AdminActivityLogs from '@/components/admin/AdminActivityLogs';
import AdminNotificationCenter from '@/components/admin/AdminNotificationCenter';
import NotificationBell from '@/components/notifications/NotificationBell';
import AdminPropertyAnalytics from '@/components/admin/AdminPropertyAnalytics';
import AdminMlmFunnelDashboard from '@/components/admin/AdminMlmFunnelDashboard';
import AdminContentManagement from '@/components/admin/AdminContentManagement';
import AdminContentHub from '@/components/admin/AdminContentHub';
import AdminCircularGalleryContent from '@/components/admin/content/AdminCircularGalleryContent';
import AdminOtherPayments from '@/components/admin/AdminOtherPayments';
import AdminRolePermissions from '@/components/admin/AdminRolePermissions';
import AdminCRMWorkspace from '@/components/admin/AdminCRMWorkspace';
import AdminBirthdayWidget from '@/components/admin/AdminBirthdayWidget';
import AdminEstateViewsLeaderboard from '@/components/admin/AdminEstateViewsLeaderboard';
import AdminTravelDashboard from '@/components/admin/AdminTravelDashboard';
import AdminDepartmentManagement from '@/components/admin/AdminDepartmentManagement';
import AdminTrainingRegistrations from '@/components/admin/AdminTrainingRegistrations';
import AdminEstateSubscribers from '@/components/admin/AdminEstateSubscribers';
import AdminLeoKnowledgeManagement from '@/components/admin/AdminLeoKnowledgeManagement';
import { toast } from '@/hooks/use-toast';

type TawkWindow = Window & { Tawk_API?: { hideWidget?: () => void; showWidget?: () => void; onLoad?: () => void } };
const ADMIN_TAB_CLASS = 'text-slate-800 hover:bg-slate-100 data-[state=active]:bg-[#241047] data-[state=active]:text-white gap-2 text-sm font-medium whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2';
const getAdminDisplayLabel = (role: string | null | undefined) => { if (!role) return 'Administrator'; if (role === 'admin_acct') return 'Manager Admin'; return isAdminRole(role) ? 'Administrator' : 'Administrator'; };

const AdminConsole = () => {
  useLayoutEffect(() => { window.scrollTo(0, 0); }, []);
  const { user, userRole, signOut, permissions, hasPermission, profile, loading: authLoading } = useAuth();
  const { isSuperAdmin, loading: superAdminLoading } = useIsSuperAdmin();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const allowedTabs = useMemo(() => { const tabs = new Set(getAllowedAdminTabs(permissions)); if (isSuperAdmin) { tabs.add('travels'); tabs.add('documentation'); } return Array.from(tabs); }, [permissions, isSuperAdmin]);
  const [loading, setLoading] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [adminTheme, setAdminTheme] = useState<'light' | 'dark'>(() => localStorage.getItem('bridgefort-admin-theme') === 'light' ? 'light' : 'dark');
  useEffect(() => { localStorage.setItem('bridgefort-admin-theme', adminTheme); }, [adminTheme]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(() => searchParams.get('tab') || 'overview');
  const handleTabChange = (tab: string) => { if (!allowedTabs.includes(tab)) return; setMobileMenuOpen(false); setActiveTab(tab); const nextParams = new URLSearchParams(searchParams); nextParams.set('tab', tab); setSearchParams(nextParams, { replace: true }); };
  useEffect(() => { const tab = searchParams.get('tab'); if (tab && tab !== activeTab && allowedTabs.includes(tab)) setActiveTab(tab); }, [searchParams, activeTab, allowedTabs]);
  useEffect(() => { if (authLoading || superAdminLoading) return; if (!allowedTabs.length) { navigate('/dashboard'); return; } if (!allowedTabs.includes(activeTab)) { const fallbackTab = allowedTabs[0]; setActiveTab(fallbackTab); const nextParams = new URLSearchParams(searchParams); nextParams.set('tab', fallbackTab); setSearchParams(nextParams, { replace: true }); } }, [allowedTabs, activeTab, navigate, searchParams, setSearchParams, authLoading, superAdminLoading]);
  useEffect(() => { const checkAdminAccess = async () => { if (authLoading) return; if (!user) { navigate('/admin-login'); return; } const isAllowed = hasPermission('admin:view_dashboard') || hasPermission('admin:all') || isAdminRole(userRole); if (!isAllowed) { toast({ title: 'Access Denied', description: "You don't have permission to access the admin console", variant: 'destructive' }); navigate('/dashboard'); return; } const { count } = await supabase.from('pending_admin_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'); setPendingCount(count || 0); setLoading(false); }; checkAdminAccess(); }, [user, navigate, userRole, hasPermission, permissions, authLoading]);
  useEffect(() => { const w = window as TawkWindow; const hideTawk = () => w.Tawk_API?.hideWidget?.(); hideTawk(); const previousOnLoad = w.Tawk_API?.onLoad; w.Tawk_API = w.Tawk_API || {}; w.Tawk_API.onLoad = () => { previousOnLoad?.(); hideTawk(); }; return () => w.Tawk_API?.showWidget?.(); }, []);
  const handleSignOut = async () => { if (user) await supabase.from('admin_presence').update({ is_online: false, status: 'offline', last_seen: new Date().toISOString() }).eq('user_id', user.id); localStorage.removeItem('admin_email_active_mailbox'); await signOut(); navigate('/admin-login'); };
  if (authLoading || loading) return <div className="admin-theme min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" /></div>;
  return <div className={`admin-theme admin-theme-${adminTheme} min-h-screen overflow-x-hidden`}>
    <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50"><div className="max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8"><div className="flex items-center justify-between min-h-16 py-2 gap-2"><div className="flex items-center gap-3 min-w-0"><Button type="button" variant="ghost" size="icon" onClick={() => setMobileMenuOpen(value => !value)} className="lg:hidden shrink-0 text-white hover:bg-slate-700" aria-label={mobileMenuOpen ? 'Close admin menu' : 'Open admin menu'}>{mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</Button><div className="p-2 bg-primary/10 rounded-lg shrink-0"><Shield className="h-6 w-6 text-primary" /></div><div className="min-w-0"><h1 className="text-base sm:text-lg font-bold text-white truncate">Admin Console</h1><p className="text-[11px] sm:text-xs text-slate-400 truncate">Bridgefort Homes Development Ltd</p></div></div><div className="flex items-center gap-1 sm:gap-2"><div className="relative"><Button variant="ghost" size="icon" onClick={() => setNotificationOpen(!notificationOpen)} className="text-slate-400 hover:text-white relative" aria-label="Open admin notifications"><Bell className="h-5 w-5" />{pendingCount > 0 && <span className="absolute -top-1 -right-1 h-5 min-w-5 px-1 bg-red-500 rounded-full text-[10px] flex items-center justify-center text-white">{pendingCount > 99 ? '99+' : pendingCount}</span>}</Button><AdminNotificationCenter isOpen={notificationOpen} onClose={() => setNotificationOpen(false)} onNavigate={handleTabChange} /></div><NotificationBell audience="admin" triggerClassName="text-slate-400 hover:text-white hidden sm:inline-flex" /><div className="hidden md:flex items-center gap-3 px-3 py-1.5 bg-slate-700/50 rounded-lg max-w-56"><div className="h-8 w-8 bg-primary/20 rounded-full flex items-center justify-center shrink-0"><span className="text-primary font-medium text-sm">{profile?.first_name?.[0] || user?.email?.[0]?.toUpperCase() || 'A'}</span></div><div className="min-w-0"><p className="text-sm font-medium text-white truncate">{profile?.first_name || 'Admin'}</p><p className="text-xs text-slate-400 truncate">{getAdminDisplayLabel(userRole)}</p></div></div><Button type="button" variant="ghost" size="icon" onClick={() => setAdminTheme(value => value === 'dark' ? 'light' : 'dark')} className="admin-theme-toggle shrink-0" aria-label={`Switch to ${adminTheme === 'dark' ? 'light' : 'dark'} theme`} title={`Switch to ${adminTheme === 'dark' ? 'light' : 'dark'} theme`}>{adminTheme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}<span className="sr-only">{adminTheme === 'dark' ? 'Light theme' : 'Dark theme'}</span></Button><Button variant="ghost" size="icon" onClick={() => navigate('/')} className="text-slate-400 hover:text-white sm:w-auto sm:px-3" aria-label="Main site"><Home className="h-4 w-4 sm:mr-1" /><span className="hidden sm:inline">Main Site</span></Button><Button variant="ghost" size="icon" onClick={handleSignOut} className="text-red-400 hover:text-red-300 hover:bg-red-900/20 sm:w-auto sm:px-3" aria-label="Logout"><LogOut className="h-4 w-4 sm:mr-1" /><span className="hidden sm:inline">Logout</span></Button></div></div></div></header>
    <main className="max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6 lg:py-8 [&_*]:min-w-0"><Tabs value={activeTab} onValueChange={handleTabChange} className={`space-y-5 lg:grid lg:items-start lg:gap-6 lg:space-y-0 ${sidebarCollapsed ? "lg:grid-cols-[4.5rem_minmax(0,1fr)]" : "lg:grid-cols-[15rem_minmax(0,1fr)]"}`}>
      {mobileMenuOpen && <button type="button" aria-label="Close admin navigation" onClick={() => setMobileMenuOpen(false)} className="lg:hidden fixed inset-0 top-16 z-[55] bg-slate-950/60 backdrop-blur-[2px]" />}
      <div className="min-w-0">
      <button type="button" onClick={() => setSidebarCollapsed(value => !value)} aria-label={sidebarCollapsed ? "Expand admin navigation" : "Collapse admin navigation"} className="hidden lg:flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white shadow-sm hover:bg-slate-50 text-slate-700 p-2.5 mb-2 transition-colors">{sidebarCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <><PanelLeftClose className="h-4 w-4 shrink-0" /><span className="text-sm font-semibold">Collapse menu</span></>}</button>
      <TabsList aria-label="Admin workspace navigation" className={`bg-white border border-slate-200 shadow-xl lg:shadow-sm p-3 flex h-auto gap-1.5 justify-start rounded-none lg:rounded-xl w-[min(86vw,19rem)] lg:w-full max-w-full overflow-x-hidden overflow-y-auto flex-col items-stretch fixed left-0 top-16 bottom-0 z-[60] transition-transform duration-200 ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"} lg:static lg:translate-x-0 lg:sticky lg:top-24 lg:max-h-[calc(100dvh-8rem)]`}>
        {hasPermission('admin:view_dashboard') && <TabsTrigger value="overview" className={`${ADMIN_TAB_CLASS} lg:w-full lg:justify-start lg:min-h-10 ${sidebarCollapsed ? "lg:justify-center lg:px-2" : ""}`}><LayoutDashboard className="h-4 w-4 shrink-0"/><span className={sidebarCollapsed ? "lg:hidden" : ""}>Dashboard</span></TabsTrigger>}
        {hasPermission('admin:view_properties') && <TabsTrigger value="properties" className={`${ADMIN_TAB_CLASS} lg:w-full lg:justify-start lg:min-h-10 ${sidebarCollapsed ? "lg:justify-center lg:px-2" : ""}`}><Building className="h-4 w-4 shrink-0"/><span className={sidebarCollapsed ? "lg:hidden" : ""}>Properties</span></TabsTrigger>}
        {hasPermission('admin:view_allocations') && <TabsTrigger value="allocations" className={`${ADMIN_TAB_CLASS} lg:w-full lg:justify-start lg:min-h-10 ${sidebarCollapsed ? "lg:justify-center lg:px-2" : ""}`}><MapPinned className="h-4 w-4 shrink-0"/><span className={sidebarCollapsed ? "lg:hidden" : ""}>Allocations</span></TabsTrigger>}
        {(hasPermission('admin:view_documentation') || isSuperAdmin || hasPermission('admin:all')) && <TabsTrigger value="documentation" className={`${ADMIN_TAB_CLASS} lg:w-full lg:justify-start lg:min-h-10 ${sidebarCollapsed ? "lg:justify-center lg:px-2" : ""}`}><FileText className="h-4 w-4 shrink-0"/><span className={sidebarCollapsed ? "lg:hidden" : ""}>Documentation</span></TabsTrigger>}
        {hasPermission('admin:view_crm') && <TabsTrigger value="crm" className={`${ADMIN_TAB_CLASS} lg:w-full lg:justify-start lg:min-h-10 ${sidebarCollapsed ? "lg:justify-center lg:px-2" : ""}`}><CheckSquare className="h-4 w-4 shrink-0"/><span className={sidebarCollapsed ? "lg:hidden" : ""}>CRM</span></TabsTrigger>}
        {hasPermission('admin:view_users') && <TabsTrigger value="users" className={`${ADMIN_TAB_CLASS} mt-3 border-t border-slate-200 pt-3 lg:w-full lg:justify-start lg:min-h-10 ${sidebarCollapsed ? "lg:justify-center lg:px-2" : ""}`}><Users className="h-4 w-4 shrink-0"/><span className={sidebarCollapsed ? "lg:hidden" : ""}>Users</span></TabsTrigger>}
        {hasPermission('admin:view_approvals') && <TabsTrigger value="approvals" className={`${ADMIN_TAB_CLASS} relative lg:w-full lg:justify-start lg:min-h-10 ${sidebarCollapsed ? "lg:justify-center lg:px-2" : ""}`}><UserCheck className="h-4 w-4 shrink-0"/><span className={sidebarCollapsed ? "lg:hidden" : ""}>Approvals</span>{pendingCount > 0 && <span className="ml-1 h-5 min-w-5 px-1 bg-red-500 rounded-full text-[10px] flex items-center justify-center text-white">{pendingCount > 99 ? '99+' : pendingCount}</span>}</TabsTrigger>}
        {hasPermission('admin:view_subscribers') && <TabsTrigger value="subscribers" className={`${ADMIN_TAB_CLASS} lg:w-full lg:justify-start lg:min-h-10 ${sidebarCollapsed ? "lg:justify-center lg:px-2" : ""}`}><Users className="h-4 w-4 shrink-0"/><span className={sidebarCollapsed ? "lg:hidden" : ""}>Subscribers</span></TabsTrigger>}
        {hasPermission('admin:view_email_center') && <TabsTrigger value="emails" className={`${ADMIN_TAB_CLASS} lg:w-full lg:justify-start lg:min-h-10 ${sidebarCollapsed ? "lg:justify-center lg:px-2" : ""}`}><Mail className="h-4 w-4 shrink-0"/><span className={sidebarCollapsed ? "lg:hidden" : ""}>Emails</span></TabsTrigger>}
        {hasPermission('admin:view_analytics') && <TabsTrigger value="analytics" className={`${ADMIN_TAB_CLASS} mt-3 border-t border-slate-200 pt-3 lg:w-full lg:justify-start lg:min-h-10 ${sidebarCollapsed ? "lg:justify-center lg:px-2" : ""}`}><TrendingUp className="h-4 w-4 shrink-0"/><span className={sidebarCollapsed ? "lg:hidden" : ""}>Analytics</span></TabsTrigger>}
        {hasPermission('admin:view_mlm_funnel') && <TabsTrigger value="mlm-funnel" className={`${ADMIN_TAB_CLASS} lg:w-full lg:justify-start lg:min-h-10 ${sidebarCollapsed ? "lg:justify-center lg:px-2" : ""}`}><Network className="h-4 w-4 shrink-0"/><span className={sidebarCollapsed ? "lg:hidden" : ""}>BHRealtors Funnel</span></TabsTrigger>}
        {hasPermission('admin:view_activity') && <TabsTrigger value="activity" className={`${ADMIN_TAB_CLASS} lg:w-full lg:justify-start lg:min-h-10 ${sidebarCollapsed ? "lg:justify-center lg:px-2" : ""}`}><Activity className="h-4 w-4 shrink-0"/><span className={sidebarCollapsed ? "lg:hidden" : ""}>Activity</span></TabsTrigger>}
        {hasPermission('admin:view_content') && <TabsTrigger value="content" className={`${ADMIN_TAB_CLASS} mt-3 border-t border-slate-200 pt-3 lg:w-full lg:justify-start lg:min-h-10 ${sidebarCollapsed ? "lg:justify-center lg:px-2" : ""}`}><FileText className="h-4 w-4 shrink-0"/><span className={sidebarCollapsed ? "lg:hidden" : ""}>Content</span></TabsTrigger>}
        {hasPermission('admin:view_content') && <TabsTrigger value="leo-knowledge" className={`${ADMIN_TAB_CLASS} lg:w-full lg:justify-start lg:min-h-10 ${sidebarCollapsed ? "lg:justify-center lg:px-2" : ""}`}><BookOpen className="h-4 w-4 shrink-0"/><span className={sidebarCollapsed ? "lg:hidden" : ""}>Leo Knowledge</span></TabsTrigger>}
        {hasPermission('admin:view_dashboard') && <TabsTrigger value="training" className={`${ADMIN_TAB_CLASS} lg:w-full lg:justify-start lg:min-h-10 ${sidebarCollapsed ? "lg:justify-center lg:px-2" : ""}`}><Sprout className="h-4 w-4 shrink-0"/><span className={sidebarCollapsed ? "lg:hidden" : ""}>Training</span></TabsTrigger>}
        {hasPermission('admin:view_cms') && <TabsTrigger value="cms" className={`${ADMIN_TAB_CLASS} lg:w-full lg:justify-start lg:min-h-10 ${sidebarCollapsed ? "lg:justify-center lg:px-2" : ""}`}><FileText className="h-4 w-4 shrink-0"/><span className={sidebarCollapsed ? "lg:hidden" : ""}>CMS Hub</span></TabsTrigger>}
        {hasPermission('admin:view_cms') && <TabsTrigger value="gallery" className={`${ADMIN_TAB_CLASS} lg:w-full lg:justify-start lg:min-h-10 ${sidebarCollapsed ? "lg:justify-center lg:px-2" : ""}`}><Images className="h-4 w-4 shrink-0"/><span className={sidebarCollapsed ? "lg:hidden" : ""}>Circular Gallery</span></TabsTrigger>}
        {hasPermission('admin:view_other_payments') && <TabsTrigger value="other-payments" className={`${ADMIN_TAB_CLASS} mt-3 border-t border-slate-200 pt-3 lg:w-full lg:justify-start lg:min-h-10 ${sidebarCollapsed ? "lg:justify-center lg:px-2" : ""}`}><DollarSign className="h-4 w-4 shrink-0"/><span className={sidebarCollapsed ? "lg:hidden" : ""}>Other Payments</span></TabsTrigger>}
        {hasPermission('admin:manage_permissions') && <TabsTrigger value="permissions" className={`${ADMIN_TAB_CLASS} mt-3 border-t border-slate-200 pt-3 lg:w-full lg:justify-start lg:min-h-10 ${sidebarCollapsed ? "lg:justify-center lg:px-2" : ""}`}><Settings className="h-4 w-4 shrink-0"/><span className={sidebarCollapsed ? "lg:hidden" : ""}>Permissions</span></TabsTrigger>}
        {hasPermission('admin:manage_departments') && <TabsTrigger value="departments" className={`${ADMIN_TAB_CLASS} lg:w-full lg:justify-start lg:min-h-10 ${sidebarCollapsed ? "lg:justify-center lg:px-2" : ""}`}><Building2 className="h-4 w-4 shrink-0"/><span className={sidebarCollapsed ? "lg:hidden" : ""}>Departments</span></TabsTrigger>}
        {hasPermission('admin:view_travels') && <TabsTrigger value="travels" className={`${ADMIN_TAB_CLASS} lg:w-full lg:justify-start lg:min-h-10 ${sidebarCollapsed ? "lg:justify-center lg:px-2" : ""}`}><Plane className="h-4 w-4 shrink-0"/><span className={sidebarCollapsed ? "lg:hidden" : ""}>Travels</span>{isSuperAdmin&&<span className="ml-1 text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded">Restricted</span>}</TabsTrigger>}
      </TabsList>
      </div>
      <TabsContent value="overview" className="min-w-0 space-y-6"><AdminDashboardStats/><div className="grid grid-cols-1 lg:grid-cols-3 gap-6"><div className="lg:col-span-2 space-y-6"><AdminInbox/><AdminEstateViewsLeaderboard/></div><div className="space-y-6"><AdminOnlineUsers/><AdminChat/></div></div></TabsContent>
      <TabsContent value="properties" className="min-w-0"><AdminPropertyManagement/></TabsContent>
      <TabsContent value="allocations" className="min-w-0"><AdminClientAllocations/></TabsContent>
      {(hasPermission('admin:view_documentation') || isSuperAdmin || hasPermission('admin:all')) && <TabsContent value="documentation" className="min-w-0"><DocumentationWorkflow/></TabsContent>}
      <TabsContent value="crm" className="min-w-0 space-y-6"><AdminBirthdayWidget/><AdminCRMWorkspace/><div className="grid grid-cols-1 lg:grid-cols-2 gap-6"><AdminTaskManager/><AdminCalendar/></div><div className="grid grid-cols-1 lg:grid-cols-3 gap-6"><AdminNotices/><AdminNotes/><AdminFileSharing/></div></TabsContent>
      <TabsContent value="users" className="min-w-0"><UserManagementTab/></TabsContent>
      <TabsContent value="approvals" className="min-w-0"><AdminApprovalsHub onCountChange={setPendingCount}/></TabsContent>
      <TabsContent value="subscribers" className="min-w-0"><AdminEstateSubscribers/></TabsContent>
      <TabsContent value="emails" className="min-w-0"><AdminEmailCenter/></TabsContent>
      <TabsContent value="analytics" className="min-w-0"><AdminPropertyAnalytics/></TabsContent>
      <TabsContent value="mlm-funnel" className="min-w-0"><AdminMlmFunnelDashboard/></TabsContent>
      <TabsContent value="activity" className="min-w-0"><AdminActivityLogs/></TabsContent>
      <TabsContent value="content" className="min-w-0"><AdminContentManagement/></TabsContent>
      <TabsContent value="leo-knowledge" className="min-w-0"><AdminLeoKnowledgeManagement/></TabsContent>
      <TabsContent value="training" className="min-w-0"><AdminTrainingRegistrations/></TabsContent>
      <TabsContent value="cms" className="min-w-0"><AdminContentHub/></TabsContent>
      <TabsContent value="gallery" className="min-w-0"><AdminCircularGalleryContent/></TabsContent>
      <TabsContent value="other-payments" className="min-w-0"><AdminOtherPayments/></TabsContent>
      <TabsContent value="permissions" className="min-w-0"><AdminRolePermissions/></TabsContent>
      {hasPermission('admin:manage_departments')&&<TabsContent value="departments" className="min-w-0"><AdminDepartmentManagement/></TabsContent>}
      {hasPermission('admin:view_travels')&&<TabsContent value="travels" className="min-w-0"><AdminTravelDashboard/></TabsContent>}
    </Tabs></main>
  </div>;
};
export default AdminConsole;
