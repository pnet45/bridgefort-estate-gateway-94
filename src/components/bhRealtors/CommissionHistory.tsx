import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Loader2, ReceiptText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface CommissionRow {
  id: string;
  commission_source: string | null;
  sponsor_level: number | null;
  commission_rate: number | null;
  commission_amount: number;
  status: string;
  description: string | null;
  created_at: string;
}

const naira = (n: number) => `₦${Number(n || 0).toLocaleString('en-NG', { maximumFractionDigits: 0 })}`;

const sourceLabel = (source: string | null) => {
  if (source === 'property_sale') return 'Estate-land sale';
  if (source === 'membership') return 'Membership referral';
  return source ? source.replace(/_/g, ' ') : 'Commission';
};

const statusClass: Record<string, string> = {
  available: 'bg-emerald-100 text-emerald-700',
  locked: 'bg-amber-100 text-amber-700',
  withdrawn: 'bg-slate-100 text-slate-600',
};

const CommissionHistory: React.FC = () => {
  const [rows, setRows] = useState<CommissionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error: fetchError } = await supabase
        .from('mlm_commissions')
        .select('id, commission_source, sponsor_level, commission_rate, commission_amount, status, description, created_at')
        .order('created_at', { ascending: false })
        .limit(15);
      if (cancelled) return;
      if (fetchError) setError(true);
      else setRows((data || []) as CommissionRow[]);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <section className="rounded-3xl border border-white/50 bg-white/60 backdrop-blur-xl p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2"><ReceiptText className="h-5 w-5 text-estate-purple" /><h2 className="font-bold text-lg">Commission history</h2></div>
          <p className="text-xs text-slate-500 mt-1">Every commission is shown from the financial ledger.</p>
        </div>
        <Badge variant="outline">Latest 15</Badge>
      </div>
      {loading ? <div className="py-8 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-estate-purple" /></div> : error ? <p className="text-sm text-slate-500 py-5">Commission history is temporarily unavailable.</p> : !rows.length ? <div className="text-center py-8 text-slate-400"><ReceiptText className="mx-auto mb-2 opacity-50" size={28} /><p className="text-sm">No commissions have been recorded yet.</p></div> : <div className="space-y-2">{rows.map(row => <div key={row.id} className="rounded-2xl border border-white/60 bg-white/55 p-3.5"><div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className="font-semibold text-slate-900 capitalize">{sourceLabel(row.commission_source)}</span><Badge className={statusClass[row.status] || 'bg-slate-100 text-slate-600'}>{row.status}</Badge>{row.sponsor_level ? <span className="text-[11px] rounded-full bg-slate-100 text-slate-500 px-2 py-0.5">Level {row.sponsor_level}</span> : null}</div><p className="text-xs text-slate-500 mt-1 truncate">{row.description || 'Commission earned'}</p><p className="text-[11px] text-slate-400 mt-1">{new Date(row.created_at).toLocaleString('en-NG')} {row.commission_rate != null ? `• ${row.commission_rate}%` : ''}</p></div><p className="font-bold text-estate-purple whitespace-nowrap">+{naira(row.commission_amount)}</p></div></div>)}</div>}
    </section>
  );
};

export default CommissionHistory;
