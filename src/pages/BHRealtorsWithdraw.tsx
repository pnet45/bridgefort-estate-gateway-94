import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Eye, EyeOff, Landmark, Loader2, Clock, AlertTriangle, ShieldCheck, Check, X } from 'lucide-react';

interface BankDetails { bank_name: string; account_number: string; account_name: string; }
interface WithdrawalRow { id: string; amount: number; status: string; created_at: string; }

const BHRealtorsWithdraw: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [walletBalance, setWalletBalance] = useState(0);
  const [balanceHidden, setBalanceHidden] = useState(false);
  const [bank, setBank] = useState<BankDetails | null>(null);
  const [amount, setAmount] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVerified, setPasswordVerified] = useState<boolean | null>(null);
  const [verifyingPassword, setVerifyingPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<WithdrawalRow[]>([]);

  useEffect(() => { document.title = 'Withdraw Commission | BHRealtors'; }, []);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [{ data: profileRow, error: profileError }, { data: requests, error: requestsError }] = await Promise.all([
        supabase.from('profiles').select('wallet_balance, banking_details').eq('id', user.id).single(),
        supabase.from('withdrawal_requests').select('id, amount, status, created_at').eq('user_id', user.id).order('created_at', { ascending: false }),
      ]);
      if (profileError) throw profileError;
      if (requestsError) throw requestsError;
      setWalletBalance(Number(profileRow?.wallet_balance ?? 0));
      if (profileRow?.banking_details) {
        try { setBank(JSON.parse(profileRow.banking_details)); } catch { setBank(null); }
      } else setBank(null);
      setHistory((requests || []) as WithdrawalRow[]);
    } catch (error) {
      console.error('Error loading withdrawal data:', error);
      toast({ title: 'Unable to load wallet', description: 'Please refresh and try again.', variant: 'destructive' });
    } finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, [user]);

  const numericAmount = Number(amount);
  const amountError = !amount ? null : !numericAmount || numericAmount <= 0
    ? 'Enter an amount greater than ₦0.'
    : numericAmount > walletBalance ? `This exceeds your available balance of ₦${walletBalance.toLocaleString()}.` : null;

  const verifyPassword = async () => {
    if (!password || !user?.email) return;
    setVerifyingPassword(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: user.email, password });
      setPasswordVerified(!error);
    } catch { setPasswordVerified(false); }
    finally { setVerifyingPassword(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!bank?.bank_name || !bank.account_number || !bank.account_name) {
      toast({ title: 'Bank details missing', description: 'Complete your BHRealtors bank details before requesting a withdrawal.', variant: 'destructive' }); return;
    }
    if (!numericAmount || numericAmount <= 0 || numericAmount > walletBalance) {
      toast({ title: 'Invalid withdrawal amount', description: amountError || 'Enter a valid amount within your available balance.', variant: 'destructive' }); return;
    }
    if (passwordVerified !== true) {
      toast({ title: 'Password verification required', description: 'Verify your password before submitting the withdrawal.', variant: 'destructive' }); return;
    }

    setSubmitting(true);
    try {
      // The database RPC locks the wallet row and creates the request in the
      // same transaction. This prevents double-spending across tabs/devices.
      const { error } = await supabase.rpc('submit_withdrawal_request', {
        p_user_id: user.id,
        p_amount: numericAmount,
        p_bank_name: bank.bank_name,
        p_account_number: bank.account_number,
        p_account_name: bank.account_name,
      });
      if (error) throw error;

      await refreshProfile();
      await loadData();
      setAmount(''); setPassword(''); setPasswordVerified(null);
      toast({ title: 'Withdrawal request submitted', description: 'Your request is pending admin approval.' });
    } catch (error: any) {
      console.error('Withdrawal request error:', error);
      toast({ title: 'Request failed', description: error?.message || 'Please try again.', variant: 'destructive' });
    } finally { setSubmitting(false); }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = { pending: 'bg-amber-100 text-amber-800', approved: 'bg-blue-100 text-blue-800', paid: 'bg-green-100 text-green-800', rejected: 'bg-red-100 text-red-800' };
    return <Badge className={map[status] || 'bg-slate-100 text-slate-800'}>{status}</Badge>;
  };

  if (!user) return (
    <div className="flex flex-col min-h-screen"><Navbar /><main className="flex-grow pt-28 pb-12 container-custom"><p>Please sign in to withdraw your commission.</p><Link to="/bridgefort-realtors-login"><Button className="mt-4">Go to Realtors Login</Button></Link></main><Footer /></div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <main className="flex-grow pt-28 pb-12"><div className="container-custom max-w-3xl">
        <button onClick={() => navigate('/bh-realtors')} className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-estate-blue mb-6"><ArrowLeft className="h-4 w-4" /> Back to BHRealtors Dashboard</button>
        <h1 className="text-3xl font-bold text-estate-blue mb-1">Withdraw Commission</h1>
        <p className="text-slate-600 mb-8">Request a payout from your available commission wallet balance.</p>

        {loading ? <div className="py-16 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-estate-blue" /></div> : <div className="space-y-6">
          <div className="rounded-3xl border border-white/60 bg-white/70 backdrop-blur-xl p-6 shadow-sm">
            <div className="flex items-center justify-between"><p className="text-sm uppercase tracking-[0.2em] text-slate-500">Available balance</p><button type="button" onClick={() => loadData()} className="text-xs text-estate-blue">Refresh</button></div>
            <div className="flex items-center gap-3 mt-2"><p className="text-3xl font-bold text-estate-blue">{balanceHidden ? '₦••••••' : `₦${walletBalance.toLocaleString()}`}</p><button type="button" onClick={() => setBalanceHidden(v => !v)} aria-label="Toggle balance">{balanceHidden ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button></div>
            <p className="text-xs text-slate-500 mt-2">Only available commissions can be withdrawn. Associate commissions remain locked until upgrade.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6"><Label htmlFor="wd-amount">Amount to withdraw (₦)</Label><Input id="wd-amount" type="number" min={1} max={walletBalance} value={amount} onChange={e => setAmount(e.target.value)} placeholder="e.g. 20000" required />{amountError ? <p className="text-xs text-destructive mt-2">{amountError}</p> : <p className="text-xs text-slate-500 mt-2">Maximum: ₦{walletBalance.toLocaleString()}</p>}</div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6"><p className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2"><Landmark className="h-4 w-4" /> Bank Account Details</p>{bank ? <div className="grid sm:grid-cols-3 gap-4"><div><Label className="text-xs text-slate-400">Bank</Label><p>{bank.bank_name}</p></div><div><Label className="text-xs text-slate-400">Account Number</Label><p>{bank.account_number}</p></div><div><Label className="text-xs text-slate-400">Account Name</Label><p>{bank.account_name}</p></div></div> : <p className="text-sm text-amber-700 flex gap-2"><AlertTriangle className="h-4 w-4" /> Complete your registration bank details first.</p>}</div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6"><Label htmlFor="wd-password" className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Confirm your password</Label><Input id="wd-password" type="password" value={password} onChange={e => { setPassword(e.target.value); setPasswordVerified(null); }} onBlur={verifyPassword} placeholder="Your account password" required />{verifyingPassword ? <p className="text-xs text-slate-500 mt-2 flex gap-1"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Verifying…</p> : passwordVerified === true ? <p className="text-xs text-emerald-600 mt-2 flex gap-1"><Check className="h-3.5 w-3.5" /> Password verified</p> : passwordVerified === false ? <p className="text-xs text-destructive mt-2 flex gap-1"><X className="h-3.5 w-3.5" /> Incorrect password</p> : <p className="text-xs text-slate-400 mt-2">Password verification is required for withdrawal.</p>}</div>

            <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900"><p className="flex gap-2"><AlertTriangle className="h-4 w-4 shrink-0" /> Withdrawal requests are reviewed by authorized admins before payout.</p><p className="flex gap-2 mt-2"><Clock className="h-4 w-4 shrink-0" /> Approved payouts are normally processed within the company's payout window.</p></div>
            <Button type="submit" disabled={submitting || passwordVerified !== true || !!amountError || !bank} className="w-full bg-estate-blue hover:bg-estate-darkBlue">{submitting ? <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Submitting request…</span> : 'Submit Withdrawal Request'}</Button>
          </form>

          <div className="rounded-3xl border border-slate-200 bg-white p-6"><p className="font-semibold mb-4">Your withdrawal requests</p>{history.length === 0 ? <p className="text-sm text-slate-500">You haven't requested a withdrawal yet.</p> : <div className="space-y-3">{history.map(h => <div key={h.id} className="flex items-center justify-between rounded-xl bg-slate-50 p-3"><div><p className="font-semibold">₦{Number(h.amount).toLocaleString()}</p><p className="text-xs text-slate-500">{new Date(h.created_at).toLocaleString()}</p></div>{statusBadge(h.status)}</div>)}</div>}</div>
        </div>}
      </div></main><Footer />
    </div>
  );
};

export default BHRealtorsWithdraw;
