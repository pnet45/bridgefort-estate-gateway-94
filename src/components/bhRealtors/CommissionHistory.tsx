import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ReceiptText } from 'lucide-react';

export interface CommissionRow {
  id: string;
  commission_source: string | null;
  sponsor_level: number | null;
  commission_rate: number | null;
  commission_amount: number;
  status: string;
  description: string | null;
  created_at: string;
}

interface CommissionHistoryProps {
  rows?: CommissionRow[];
  loading?: boolean;
  error?: boolean;
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

const CommissionHistory: React.FC<CommissionHistoryProps> = ({ rows = [], loading = false, error = false }) => (
  <section className="rounded-3xl border border-white/50 bg-white/60 p-6 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/60">
    <div className="mb-5 flex items-center justify-between gap-3">
      <div>
        <div className="flex items-center gap-2"><ReceiptText className="h-5 w-5 text-estate-purple" /><h2 className="text-lg font-bold text-slate-950 dark:text-white">Commission history</h2></div>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-300">Your latest commission entries from the financial ledger.</p>
      </div>
      <Badge variant="outline">Latest {Math.min(rows.length, 15)}</Badge>
    </div>

    {loading ? (
      <div className="flex justify-center py-8"><div className="h-5 w-5 animate-spin rounded-full border-2 border-estate-purple border-t-transparent" /></div>
    ) : error ? (
      <p className="py-5 text-sm text-slate-500">Commission history is temporarily unavailable.</p>
    ) : !rows.length ? (
      <div className="py-8 text-center text-slate-400"><ReceiptText className="mx-auto mb-2 opacity-50" size={28} /><p className="text-sm">No commissions have been recorded yet.</p></div>
    ) : (
      <div className="space-y-2">
        {rows.slice(0, 15).map((row) => (
          <div key={row.id} className="rounded-2xl border border-white/60 bg-white/55 p-3.5 dark:border-white/10 dark:bg-white/[0.04]">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold capitalize text-slate-900 dark:text-white">{sourceLabel(row.commission_source)}</span>
                  <Badge className={statusClass[row.status] || 'bg-slate-100 text-slate-600'}>{row.status}</Badge>
                  {row.sponsor_level ? <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500 dark:bg-white/5 dark:text-slate-300">Level {row.sponsor_level}</span> : null}
                </div>
                <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-300">{row.description || 'Commission earned'}</p>
                <p className="mt-1 text-[11px] text-slate-400">{new Date(row.created_at).toLocaleString('en-NG')}{row.commission_rate != null ? ` • ${row.commission_rate}%` : ''}</p>
              </div>
              <p className="whitespace-nowrap font-bold text-estate-purple">+{naira(row.commission_amount)}</p>
            </div>
          </div>
        ))}
      </div>
    )}
  </section>
);

export default CommissionHistory;
