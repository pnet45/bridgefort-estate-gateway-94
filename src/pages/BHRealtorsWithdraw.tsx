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
import {
  ArrowLeft, Eye, EyeOff, Landmark, Loader2, Clock, AlertTriangle, ShieldCheck,
} from 'lucide-react';

interface BankDetails {
  bank_name: string;
  account_number: string;
  account_name: string;
}

interface WithdrawalRow {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  bank_name: string;
  account_number: string;
}

const BHRealtorsWithdraw: React.FC = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [walletBalance, setWalletBalance] = useState(0);
  const [balanceHidden, setBalanceHidden] = useState(false);
  const [bank, setBank] = useState<BankDetails | null>(null);
  const [amount, setAmount] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<WithdrawalRow[]>([]);

  useEffect(() => {
    document.title = 'Withdraw Commission | BHRealtors';
  }, []);

  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const { data: profileRow } = await supabase
          .from('profiles')
          .select('wallet_balance, banking_details')
          .eq('id', user.id)
          .single();

        setWalletBalance(Number(profileRow?.wallet_balance ?? 0));

        if (profileRow?.banking_details) {
          try {
            setBank(JSON.parse(profileRow.banking_details));
          } catch {
            setBank(null);
          }
        }

        const { data: requests } = await supabase
          .from('withdrawal_requests')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        setHistory((requests || []) as WithdrawalRow[]);
      } catch (error) {
        console.error('Error loading withdrawal data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user.email) return;

    const numericAmount = Number(amount);

    if (!bank || !bank.bank_name || !bank.account_number || !bank.account_name) {
      toast({
        title: 'Bank details missing',
        description: 'Please complete your Bank Account Details on your BHRealtors profile before requesting a withdrawal.',
        variant: 'destructive',
      });
      return;
    }

    if (!numericAmount || numericAmount <= 0) {
      toast({ title: 'Enter a valid amount', variant: 'destructive' });
      return;
    }

    if (numericAmount > walletBalance) {
      toast({
        title: 'Insufficient balance',
        description: 'The amount requested exceeds your available commission balance.',
        variant: 'destructive',
      });
      return;
    }

    if (!password) {
      toast({ title: 'Password required', description: 'Please enter your password to confirm this withdrawal request.', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      // Re-verify the account password before allowing a withdrawal request.
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password,
      });

      if (authError) {
        toast({ title: 'Incorrect password', description: 'Please re-enter your password.', variant: 'destructive' });
        setSubmitting(false);
        return;
      }

      const { error: insertError } = await supabase.from('withdrawal_requests').insert({
        user_id: user.id,
        amount: numericAmount,
        bank_name: bank.bank_name,
        account_number: bank.account_number,
        account_name: bank.account_name,
        status: 'pending',
      });

      if (insertError) throw insertError;

      toast({
        title: 'Withdrawal request submitted',
        description: 'Your request is pending admin approval. You will be notified once it is processed.',
      });

      setAmount('');
      setPassword('');

      const { data: requests } = await supabase
        .from('withdrawal_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setHistory((requests || []) as WithdrawalRow[]);
    } catch (error: any) {
      console.error('Withdrawal request error:', error);
      toast({ title: 'Request failed', description: error?.message || 'Please try again.', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      pending: 'bg-amber-100 text-amber-800',
      approved: 'bg-blue-100 text-blue-800',
      paid: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return <Badge className={map[status] || 'bg-slate-100 text-slate-800'}>{status}</Badge>;
  };

  if (!user) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow pt-28 pb-12 container mx-auto px-4">
          <p className="text-gray-700">Please sign in to withdraw your commission.</p>
          <Link to="/bridgefort-realtors-login"><Button className="mt-4">Go to Realtors Login</Button></Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <main className="flex-grow pt-28 pb-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <button
            onClick={() => navigate('/bh-realtors')}
            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-estate-blue mb-6"
          >
            <ArrowLeft className="h-4 w-4" /> Back to BHRealtors Dashboard
          </button>

          <h1 className="text-3xl font-bold text-estate-blue mb-1">Withdraw Commission</h1>
          <p className="text-slate-600 mb-8">Request a payout from your available commission wallet balance.</p>

          {loading ? (
            <div className="py-16 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-estate-blue" /></div>
          ) : (
            <div className="space-y-6">
              {/* Balance card */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6">
                <p className="text-sm uppercase tracking-[0.2em] text-slate-500 mb-2">Available balance</p>
                <div className="flex items-center gap-3">
                  <p className="text-3xl font-bold text-estate-blue">
                    {balanceHidden ? '₦••••••' : `₦${walletBalance.toLocaleString()}`}
                  </p>
                  <button
                    type="button"
                    onClick={() => setBalanceHidden((v) => !v)}
                    aria-label={balanceHidden ? 'Show balance' : 'Hide balance'}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    {balanceHidden ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Amount */}
                <div className="rounded-3xl border border-slate-200 bg-white p-6">
                  <Label htmlFor="wd-amount">Amount to withdraw (₦)</Label>
                  <Input
                    id="wd-amount"
                    type="number"
                    min={1}
                    max={walletBalance}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="e.g. 20000"
                    required
                  />
                  <p className="text-xs text-slate-500 mt-2">Maximum: ₦{walletBalance.toLocaleString()}</p>
                </div>

                {/* Bank details (read only) */}
                <div className="rounded-3xl border border-slate-200 bg-white p-6">
                  <p className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                    <Landmark className="h-4 w-4" /> Bank Account Details
                  </p>
                  {bank ? (
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div>
                        <Label className="text-xs text-slate-400">Bank Name</Label>
                        <p className="font-medium text-slate-800">{bank.bank_name}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-slate-400">Account Number</Label>
                        <p className="font-medium text-slate-800">{bank.account_number}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-slate-400">Account Name</Label>
                        <p className="font-medium text-slate-800">{bank.account_name}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-amber-700 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" /> No bank details on file. Complete your BHRealtors registration first.
                    </p>
                  )}
                  <p className="text-xs text-slate-400 mt-3">
                    These are the details you supplied during registration and cannot be edited here. Contact support if they need to change.
                  </p>
                </div>

                {/* Info */}
                <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 space-y-2">
                  <p className="text-sm text-amber-900 flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                    Withdrawals may be subject to applicable taxes and bank charges, which will be deducted before disbursement.
                  </p>
                  <p className="text-sm text-amber-900 flex items-start gap-2">
                    <Clock className="h-4 w-4 mt-0.5 shrink-0" />
                    Expected disbursement time is 24–72 hours, depending on bank processing delays.
                  </p>
                </div>

                {/* Password confirm */}
                <div className="rounded-3xl border border-slate-200 bg-white p-6">
                  <Label htmlFor="wd-password" className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4" /> Confirm your password to submit
                  </Label>
                  <Input
                    id="wd-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Your account password"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={submitting || !bank}
                  className="w-full bg-estate-blue hover:bg-estate-darkBlue"
                >
                  {submitting ? (
                    <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Submitting request…</span>
                  ) : (
                    'Submit Withdrawal Request'
                  )}
                </Button>
              </form>

              {/* History */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6">
                <p className="text-sm font-semibold text-slate-700 mb-4">Your withdrawal requests</p>
                {history.length === 0 ? (
                  <p className="text-sm text-slate-500">You haven't requested a withdrawal yet.</p>
                ) : (
                  <div className="space-y-3">
                    {history.map((h) => (
                      <div key={h.id} className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-sm">
                        <div>
                          <p className="font-semibold text-slate-800">₦{Number(h.amount).toLocaleString()}</p>
                          <p className="text-xs text-slate-500">{new Date(h.created_at).toLocaleString()}</p>
                        </div>
                        {statusBadge(h.status)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BHRealtorsWithdraw;
