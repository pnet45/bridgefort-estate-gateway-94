import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { UserCheck, Wallet, CreditCard, ShieldCheck, Home } from 'lucide-react';
import { useAuth } from '@/contexts/auth';
import AdminApprovalTab from './AdminApprovalTab';
import AdminWithdrawalRequests from './AdminWithdrawalRequests';
import AdminPaymentRequests from './AdminPaymentRequests';
import AdminListingApprovals from './AdminListingApprovals';

const ADMIN_APPROVAL_ROLES = new Set(['super_admin', 'admin_dir', 'admin_acct', 'admin', 'admin_it']);
const PAYMENT_APPROVER_ROLES = new Set(['super_admin', 'admin_dir', 'admin_acct', 'admin']);
const LISTING_APPROVER_ROLES = new Set(['super_admin', 'admin_dir', 'admin_it', 'admin']);
const WITHDRAWAL_APPROVER_ROLES = new Set(['super_admin', 'admin_dir', 'admin_acct', 'admin']);

const AdminApprovalsHub: React.FC<{ onCountChange?: (n: number) => void }> = ({ onCountChange }) => {
  const { hasPermission, userRole } = useAuth();
  const [innerTab, setInnerTab] = useState('admin-requests');
  const role = userRole || '';

  const canViewAdminRequests = hasPermission('admin:view_approvals') || hasPermission('admin:all') || ADMIN_APPROVAL_ROLES.has(role);
  const canApprovePayments = hasPermission('admin:approve_payments') || hasPermission('admin:all') || PAYMENT_APPROVER_ROLES.has(role);
  const canApproveWithdrawals = hasPermission('admin:approve_withdrawals') || hasPermission('admin:all') || WITHDRAWAL_APPROVER_ROLES.has(role);
  const canApproveListings = hasPermission('admin:approve_listings') || hasPermission('admin:all') || LISTING_APPROVER_ROLES.has(role);

  const firstAvailable = canViewAdminRequests ? 'admin-requests' : canApproveListings ? 'listings' : canApprovePayments ? 'payments' : canApproveWithdrawals ? 'withdrawals' : '';
  const activeTab = !firstAvailable ? '' : ((innerTab === 'admin-requests' && !canViewAdminRequests) ||
    (innerTab === 'listings' && !canApproveListings) ||
    (innerTab === 'withdrawals' && !canApproveWithdrawals) ||
    (innerTab === 'payments' && !canApprovePayments) ? firstAvailable : innerTab);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-700 bg-gradient-to-r from-slate-900 to-slate-800 p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3"><div className="rounded-xl border border-primary/20 bg-primary/10 p-2.5"><ShieldCheck className="h-5 w-5 text-primary" /></div><div><h2 className="text-lg font-semibold text-white">Approval Centre</h2><p className="text-xs sm:text-sm text-slate-400">Review and process requests assigned to your administrator permissions.</p></div></div>
          <Badge variant="outline" className="w-fit border-slate-600 bg-slate-950/40 text-slate-300">Permission protected</Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setInnerTab}>
        <div className="overflow-x-auto pb-1"><TabsList className="h-auto min-w-max bg-slate-900 border border-slate-700 p-1.5 gap-1">
          {canViewAdminRequests && <TabsTrigger value="admin-requests" className="text-white data-[state=active]:bg-primary gap-1.5 px-3 py-2"><UserCheck className="h-4 w-4" /> Admin Requests</TabsTrigger>}
          {canApproveListings && <TabsTrigger value="listings" className="text-white data-[state=active]:bg-primary gap-1.5 px-3 py-2"><Home className="h-4 w-4" /> Listing Requests</TabsTrigger>}
          {canApproveWithdrawals && <TabsTrigger value="withdrawals" className="text-white data-[state=active]:bg-primary gap-1.5 px-3 py-2"><Wallet className="h-4 w-4" /> Withdrawals</TabsTrigger>}
          {canApprovePayments && <TabsTrigger value="payments" className="text-white data-[state=active]:bg-primary gap-1.5 px-3 py-2"><CreditCard className="h-4 w-4" /> Payments</TabsTrigger>}
        </TabsList></div>
        {canViewAdminRequests && <TabsContent value="admin-requests" className="mt-4"><AdminApprovalTab onCountChange={onCountChange} /></TabsContent>}
        {canApproveListings && <TabsContent value="listings" className="mt-4"><AdminListingApprovals /></TabsContent>}
        {canApproveWithdrawals && <TabsContent value="withdrawals" className="mt-4"><AdminWithdrawalRequests /></TabsContent>}
        {canApprovePayments && <TabsContent value="payments" className="mt-4"><AdminPaymentRequests /></TabsContent>}
      </Tabs>
    </div>
  );
};

export default AdminApprovalsHub;
