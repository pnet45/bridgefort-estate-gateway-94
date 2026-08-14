import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { UserCheck, Wallet, CreditCard, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/contexts/auth';
import AdminApprovalTab from './AdminApprovalTab';
import AdminWithdrawalRequests from './AdminWithdrawalRequests';
import AdminPaymentRequests from './AdminPaymentRequests';

// Central approval workspace. Each child keeps its own business logic/RLS path;
// this component only controls presentation and permission-aware visibility.
const AdminApprovalsHub: React.FC<{ onCountChange?: (n: number) => void }> = ({ onCountChange }) => {
  const { hasPermission } = useAuth();
  const [innerTab, setInnerTab] = useState('admin-requests');

  const canApprovePayments = hasPermission('admin:approve_payments') || hasPermission('admin:all');
  const canApproveWithdrawals = hasPermission('admin:approve_withdrawals') || hasPermission('admin:all');
  const canViewAdminRequests = hasPermission('admin:view_approvals') || hasPermission('admin:all');

  const firstAvailable = canViewAdminRequests ? 'admin-requests' : canApproveWithdrawals ? 'withdrawals' : 'payments';
  const activeTab = (innerTab === 'admin-requests' && !canViewAdminRequests) ||
    (innerTab === 'withdrawals' && !canApproveWithdrawals) ||
    (innerTab === 'payments' && !canApprovePayments) ? firstAvailable : innerTab;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-700 bg-gradient-to-r from-slate-900 to-slate-800 p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-xl border border-primary/20 bg-primary/10 p-2.5">
              <ShieldCheck className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Approval Centre</h2>
              <p className="text-xs sm:text-sm text-slate-400">Review and process requests assigned to your administrator permissions.</p>
            </div>
          </div>
          <Badge variant="outline" className="w-fit border-slate-600 bg-slate-950/40 text-slate-300">Permission protected</Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setInnerTab}>
        <div className="overflow-x-auto pb-1">
          <TabsList className="h-auto min-w-max bg-slate-900 border border-slate-700 p-1.5 gap-1">
            {canViewAdminRequests && (
              <TabsTrigger value="admin-requests" className="text-white data-[state=active]:bg-primary gap-1.5 px-3 py-2">
                <UserCheck className="h-4 w-4" /> Admin Requests
              </TabsTrigger>
            )}
            {canApproveWithdrawals && (
              <TabsTrigger value="withdrawals" className="text-white data-[state=active]:bg-primary gap-1.5 px-3 py-2">
                <Wallet className="h-4 w-4" /> Withdrawals
              </TabsTrigger>
            )}
            {canApprovePayments && (
              <TabsTrigger value="payments" className="text-white data-[state=active]:bg-primary gap-1.5 px-3 py-2">
                <CreditCard className="h-4 w-4" /> Payments
              </TabsTrigger>
            )}
          </TabsList>
        </div>

        {canViewAdminRequests && <TabsContent value="admin-requests" className="mt-4"><AdminApprovalTab onCountChange={onCountChange} /></TabsContent>}
        {canApproveWithdrawals && <TabsContent value="withdrawals" className="mt-4"><AdminWithdrawalRequests /></TabsContent>}
        {canApprovePayments && <TabsContent value="payments" className="mt-4"><AdminPaymentRequests /></TabsContent>}
      </Tabs>
    </div>
  );
};

export default AdminApprovalsHub;
