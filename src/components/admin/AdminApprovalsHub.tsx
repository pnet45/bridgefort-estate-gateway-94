import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserCheck, Wallet, CreditCard } from 'lucide-react';
import AdminApprovalTab from './AdminApprovalTab';
import AdminWithdrawalRequests from './AdminWithdrawalRequests';
import AdminPaymentRequests from './AdminPaymentRequests';

// Segments every kind of admin-facing request — account/document approvals,
// commission withdrawals, and gateway payment approvals — under one place,
// each keeping its own full history (not just pending items).
const AdminApprovalsHub: React.FC<{ onCountChange?: (n: number) => void }> = ({ onCountChange }) => {
  const [innerTab, setInnerTab] = useState('admin-requests');

  return (
    <Tabs value={innerTab} onValueChange={setInnerTab}>
      <TabsList className="bg-slate-900 border border-slate-700 mb-4">
        <TabsTrigger value="admin-requests" className="text-white data-[state=active]:bg-primary gap-1.5" style={{ color: '#fff' }}>
          <UserCheck className="h-4 w-4" /> Admin Requests
        </TabsTrigger>
        <TabsTrigger value="withdrawals" className="text-white data-[state=active]:bg-primary gap-1.5" style={{ color: '#fff' }}>
          <Wallet className="h-4 w-4" /> Withdrawal Requests
        </TabsTrigger>
        <TabsTrigger value="payments" className="text-white data-[state=active]:bg-primary gap-1.5" style={{ color: '#fff' }}>
          <CreditCard className="h-4 w-4" /> Payment Requests
        </TabsTrigger>
      </TabsList>

      <TabsContent value="admin-requests"><AdminApprovalTab onCountChange={onCountChange} /></TabsContent>
      <TabsContent value="withdrawals"><AdminWithdrawalRequests /></TabsContent>
      <TabsContent value="payments"><AdminPaymentRequests /></TabsContent>
    </Tabs>
  );
};

export default AdminApprovalsHub;
