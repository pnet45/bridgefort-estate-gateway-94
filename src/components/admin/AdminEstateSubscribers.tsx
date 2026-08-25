import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  CalendarClock,
  Eye,
  FileCheck2,
  Loader2,
  RefreshCw,
  ReceiptText,
  Search,
  Users,
  Wallet,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';

type Subscriber = {
  subscription_number: string;
  subscriber_name: string;
  estate_name: string;
  estate_code: string;
  client_id: string | null;
  order_id: string | null;
  subscription_status: string;
  payment_plan: string | null;
  subscription_amount: number;
  subscribed_at: string;
  client_email: string | null;
  plot_count: number;
  order_total: number;
  amount_paid: number;
  outstanding_balance: number;
};

type HistoryItem = Record<string, any>;

type SubscriberHistory = {
  payments: HistoryItem[];
  installments: HistoryItem[];
  documentation: HistoryItem[];
};

const money = (value: number | null | undefined) =>
  `₦${Number(value || 0).toLocaleString('en-NG')}`;

const dateTime = (value: string | null | undefined) => {
  if (!value) return '—';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '—';

  return date.toLocaleString('en-NG', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};

const dateOnly = (value: string | null | undefined) => {
  if (!value) return '—';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '—';

  return date.toLocaleDateString('en-NG', {
    dateStyle: 'medium',
  });
};

const statusVariant = (
  status: string | null | undefined
): 'default' | 'secondary' | 'outline' => {
  const normalized = String(status || '').toLowerCase();

  if (
    normalized === 'paid' ||
    normalized === 'approved' ||
    normalized === 'completed'
  ) {
    return 'default';
  }

  if (
    normalized === 'partial' ||
    normalized === 'pending' ||
    normalized === 'processing'
  ) {
    return 'secondary';
  }

  return 'outline';
};

const AdminEstateSubscribers: React.FC = () => {
  const [rows, setRows] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState('');
  const [estate, setEstate] = useState('all');

  const [selected, setSelected] = useState<Subscriber | null>(null);

  const [history, setHistory] = useState<SubscriberHistory>({
    payments: [],
    installments: [],
    documentation: [],
  });

  const [historyLoading, setHistoryLoading] = useState(false);

  const loadSubscribers = async () => {
    setLoading(true);

    try {
      const { data, error } = await supabase.rpc(
        'admin_get_estate_subscribers',
        {
          _search: query.trim() || null,
          _estate_code: estate === 'all' ? null : estate,
        }
      );

      if (error) throw error;

      setRows((data || []) as Subscriber[]);
    } catch (error: any) {
      console.error('Subscriber loading error:', error);

      toast({
        title: 'Could not load subscribers',
        description:
          error?.message || 'Please refresh and try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const openSubscriber = async (subscriber: Subscriber) => {
    setSelected(subscriber);

    setHistory({
      payments: [],
      installments: [],
      documentation: [],
    });

    if (!subscriber.order_id) {
      return;
    }

    setHistoryLoading(true);

    try {
      const { data, error } = await supabase.rpc(
        'admin_get_subscriber_history',
        {
          _order_id: subscriber.order_id,
        }
      );

      if (error) throw error;

      setHistory({
        payments: data?.payments || [],
        installments: data?.installments || [],
        documentation: data?.documentation || [],
      });
    } catch (error: any) {
      console.error('Subscriber history error:', error);

      toast({
        title: 'Could not load subscriber history',
        description:
          error?.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    loadSubscribers();
  }, [estate]);

  const estates = useMemo(
    () =>
      Array.from(
        new Map(
          rows.map((row) => [
            row.estate_code,
            row.estate_name,
          ])
        ).entries()
      ),
    [rows]
  );

  return (
    <Card className="border-slate-700 bg-slate-950 text-white shadow-xl dark:border-slate-700 dark:bg-slate-950 dark:text-white light:border-slate-200 light:bg-white light:text-slate-900">
      <CardHeader className="border-b border-slate-700 bg-white/[0.03] dark:border-slate-700 dark:bg-white/[0.03] light:border-slate-200 light:bg-slate-50">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-white dark:text-white light:text-slate-900">
              <Users className="h-5 w-5 text-primary" />

              Estate Subscribers

              <Badge className="bg-primary/20 text-primary">
                {rows.length}
              </Badge>
            </CardTitle>

            <p className="mt-1 text-sm text-slate-300 dark:text-slate-300 light:text-slate-600">
              Search and review subscribers, plots, payments,
              installments and documentation.
            </p>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={loadSubscribers}
            disabled={loading}
            className="text-slate-300 hover:bg-white/10 hover:text-white dark:text-slate-300 dark:hover:text-white light:text-slate-700 light:hover:text-slate-950"
          >
            <RefreshCw
              className={
                loading
                  ? 'h-4 w-4 animate-spin'
                  : 'h-4 w-4'
              }
            />
          </Button>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <Input
              value={query}
              onChange={(event) =>
                setQuery(event.target.value)
              }
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  loadSubscribers();
                }
              }}
              placeholder="Subscriber name, subscription no., estate or email..."
              className="border-slate-600 bg-slate-900 pl-8 text-white placeholder:text-slate-400 dark:border-slate-600 dark:bg-slate-900 dark:text-white light:border-slate-300 light:bg-white light:text-slate-900 light:placeholder:text-slate-500"
            />
          </div>

          <select
            value={estate}
            onChange={(event) =>
              setEstate(event.target.value)
            }
            className="rounded-md border border-slate-600 bg-slate-900 px-3 text-sm text-white dark:border-slate-600 dark:bg-slate-900 dark:text-white light:border-slate-300 light:bg-white light:text-slate-900"
          >
            <option value="all">All estates</option>

            {estates.map(([code, name]) => (
              <option key={code} value={code}>
                {code} — {name}
              </option>
            ))}
          </select>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : rows.length === 0 ? (
          <p className="py-10 text-center text-slate-300 dark:text-slate-300 light:text-slate-600">
            No estate subscribers found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 text-slate-300 dark:border-slate-700 dark:text-slate-300 light:border-slate-200 light:text-slate-600">
                  <th className="p-3 text-left">
                    Subscriber
                  </th>

                  <th className="p-3 text-left">
                    Subscription
                  </th>

                  <th className="p-3 text-left">
                    Estate
                  </th>

                  <th className="p-3 text-left">
                    Plots
                  </th>

                  <th className="p-3 text-left">
                    Paid
                  </th>

                  <th className="p-3 text-left">
                    Balance
                  </th>

                  <th className="p-3 text-left">
                    Plan
                  </th>

                  <th className="p-3 text-left">
                    Status
                  </th>

                  <th className="p-3" />
                </tr>
              </thead>

              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.subscription_number}
                    className="border-b border-slate-800 hover:bg-slate-800/60 dark:border-slate-800 dark:hover:bg-slate-800/60 light:border-slate-200 light:hover:bg-slate-50"
                  >
                    <td className="p-3 font-semibold text-white dark:text-white light:text-slate-900">
                      <div>{row.subscriber_name}</div>

                      <div className="text-xs font-normal text-slate-300 dark:text-slate-300 light:text-slate-500">
                        {row.client_email || '—'}
                      </div>
                    </td>

                    <td className="p-3 font-semibold text-primary">
                      {row.subscription_number}
                    </td>

                    <td className="p-3 text-white dark:text-white light:text-slate-900">
                      {row.estate_name}
                    </td>

                    <td className="p-3 text-white dark:text-white light:text-slate-900">
                      {row.plot_count}
                    </td>

                    <td className="p-3 text-white dark:text-white light:text-slate-900">
                      {money(row.amount_paid)}
                    </td>

                    <td className="p-3 font-bold text-white dark:text-white light:text-slate-900">
                      {money(row.outstanding_balance)}
                    </td>

                    <td className="p-3 text-slate-200 dark:text-slate-200 light:text-slate-700">
                      {row.payment_plan || '—'}
                    </td>

                    <td className="p-3">
                      <Badge
                        variant={statusVariant(
                          row.subscription_status
                        )}
                      >
                        {row.subscription_status}
                      </Badge>
                    </td>

                    <td className="p-3">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="gap-1 text-slate-200 hover:bg-white/10 hover:text-white dark:text-slate-200 dark:hover:text-white light:text-slate-700 light:hover:text-slate-950"
                        onClick={() =>
                          openSubscriber(row)
                        }
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>

      <Dialog
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto border-slate-700 bg-slate-950 text-white dark:border-slate-700 dark:bg-slate-950 dark:text-white light:border-slate-200 light:bg-white light:text-slate-900">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {selected?.subscriber_name}
            </DialogTitle>

            <DialogDescription className="text-slate-300 dark:text-slate-300 light:text-slate-600">
              {selected?.subscription_number} •{' '}
              {selected?.estate_name}
            </DialogDescription>
          </DialogHeader>

          {selected && (
            <div className="space-y-5">
              {/* Financial Summary */}
              <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                <div className="rounded-xl border border-slate-700 bg-white/[0.03] p-4 dark:border-slate-700 dark:bg-white/[0.03] light:border-slate-200 light:bg-slate-50">
                  <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-500">
                    Plots
                  </p>

                  <p className="text-2xl font-extrabold">
                    {selected.plot_count}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-700 bg-white/[0.03] p-4 dark:border-slate-700 dark:bg-white/[0.03] light:border-slate-200 light:bg-slate-50">
                  <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-500">
                    Order Total
                  </p>

                  <p className="text-xl font-bold">
                    {money(selected.order_total)}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-700 bg-white/[0.03] p-4 dark:border-slate-700 dark:bg-white/[0.03] light:border-slate-200 light:bg-slate-50">
                  <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-500">
                    Amount Paid
                  </p>

                  <p className="text-xl font-bold">
                    {money(selected.amount_paid)}
                  </p>
                </div>

                <div className="rounded-xl border border-primary/40 bg-primary/10 p-4">
                  <p className="text-xs text-slate-300 dark:text-slate-300 light:text-slate-600">
                    Outstanding Balance
                  </p>

                  <p className="text-2xl font-extrabold">
                    {money(selected.outstanding_balance)}
                  </p>
                </div>
              </div>

              {/* Subscriber Information */}
              <div className="rounded-xl border border-slate-700 p-4 dark:border-slate-700 light:border-slate-200">
                <h3 className="mb-4 font-semibold">
                  Subscriber Information
                </h3>

                <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                  <div>
                    <p className="text-slate-400 dark:text-slate-400 light:text-slate-500">
                      Name
                    </p>
                    <p className="font-semibold">
                      {selected.subscriber_name}
                    </p>
                  </div>

                  <div>
                    <p className="text-slate-400 dark:text-slate-400 light:text-slate-500">
                      Email
                    </p>
                    <p>
                      {selected.client_email || '—'}
                    </p>
                  </div>

                  <div>
                    <p className="text-slate-400 dark:text-slate-400 light:text-slate-500">
                      Estate
                    </p>
                    <p>{selected.estate_name}</p>
                  </div>

                  <div>
                    <p className="text-slate-400 dark:text-slate-400 light:text-slate-500">
                      Subscription Number
                    </p>
                    <p className="font-bold text-primary">
                      {selected.subscription_number}
                    </p>
                  </div>

                  <div>
                    <p className="text-slate-400 dark:text-slate-400 light:text-slate-500">
                      Payment Plan
                    </p>
                    <p>
                      {selected.payment_plan || '—'}
                    </p>
                  </div>

                  <div>
                    <p className="text-slate-400 dark:text-slate-400 light:text-slate-500">
                      Subscription Status
                    </p>

                    <Badge
                      variant={statusVariant(
                        selected.subscription_status
                      )}
                    >
                      {selected.subscription_status}
                    </Badge>
                  </div>

                  <div>
                    <p className="text-slate-400 dark:text-slate-400 light:text-slate-500">
                      Subscription Date
                    </p>
                    <p>
                      {dateTime(selected.subscribed_at)}
                    </p>
                  </div>

                  <div>
                    <p className="text-slate-400 dark:text-slate-400 light:text-slate-500">
                      Order ID
                    </p>

                    <p className="break-all text-xs">
                      {selected.order_id || '—'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Installments */}
              <div className="rounded-xl border border-slate-700 p-4 dark:border-slate-700 light:border-slate-200">
                <div className="mb-4 flex items-center gap-2">
                  <CalendarClock className="h-5 w-5 text-primary" />

                  <h3 className="font-semibold">
                    Installment Schedule
                  </h3>
                </div>

                {historyLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : history.installments.length === 0 ? (
                  <p className="text-sm text-slate-400 dark:text-slate-400 light:text-slate-500">
                    No installment schedule found.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {history.installments.map(
                      (installment, index) => (
                        <div
                          key={
                            installment.id ||
                            installment.installment_number ||
                            index
                          }
                          className="grid grid-cols-1 gap-3 rounded-lg border border-slate-700 bg-white/[0.03] p-3 md:grid-cols-[1fr_auto] dark:border-slate-700 dark:bg-white/[0.03] light:border-slate-200 light:bg-slate-50"
                        >
                          <div>
                            <p className="font-semibold">
                              Installment{' '}
                              {installment.installment_number ??
                                index + 1}
                            </p>

                            {installment.due_date && (
                              <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-500">
                                Due{' '}
                                {dateOnly(
                                  installment.due_date
                                )}
                              </p>
                            )}
                          </div>

                          <div className="text-left md:text-right">
                            <p>
                              Due{' '}
                              {money(
                                installment.amount_due ??
                                  installment.scheduled_amount
                              )}
                            </p>

                            <p>
                              Paid{' '}
                              {money(
                                installment.amount_paid
                              )}
                            </p>

                            <Badge
                              variant={statusVariant(
                                installment.status
                              )}
                            >
                              {installment.status ||
                                'pending'}
                            </Badge>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>

              {/* Payment History */}
              <div className="rounded-xl border border-slate-700 p-4 dark:border-slate-700 light:border-slate-200">
                <div className="mb-4 flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-primary" />

                  <h3 className="font-semibold">
                    Payment History
                  </h3>
                </div>

                {historyLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : history.payments.length === 0 ? (
                  <p className="text-sm text-slate-400 dark:text-slate-400 light:text-slate-500">
                    No payment history available.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {history.payments.map(
                      (payment, index) => (
                        <div
                          key={
                            payment.id ||
                            payment.reference ||
                            index
                          }
                          className="rounded-lg border border-slate-700 bg-white/[0.03] p-4 dark:border-slate-700 dark:bg-white/[0.03] light:border-slate-200 light:bg-slate-50"
                        >
                          <div className="flex flex-col justify-between gap-2 md:flex-row">
                            <div>
                              <p className="font-semibold">
                                {payment.type ||
                                  payment.payment_type ||
                                  'Land Payment'}
                              </p>

                              <p className="mt-1 text-xs text-slate-400 dark:text-slate-400 light:text-slate-500">
                                Reference:{' '}
                                {payment.reference ||
                                  payment.payment_reference ||
                                  '—'}
                              </p>

                              {payment.created_at && (
                                <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-500">
                                  {dateTime(
                                    payment.created_at
                                  )}
                                </p>
                              )}
                            </div>

                            <div className="text-left md:text-right">
                              <p className="text-lg font-extrabold">
                                {money(payment.amount)}
                              </p>

                              <Badge
                                variant={statusVariant(
                                  payment.status
                                )}
                              >
                                {payment.status ||
                                  'unknown'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>

              {/* Documentation */}
              <div className="rounded-xl border border-slate-700 p-4 dark:border-slate-700 light:border-slate-200">
                <div className="mb-4 flex items-center gap-2">
                  <FileCheck2 className="h-5 w-5 text-primary" />

                  <h3 className="font-semibold">
                    Documentation
                  </h3>
                </div>

                {historyLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : history.documentation.length === 0 ? (
                  <p className="text-sm text-slate-400 dark:text-slate-400 light:text-slate-500">
                    No documentation payment recorded.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {history.documentation.map(
                      (documentation, index) => (
                        <div
                          key={
                            documentation.id ||
                            documentation.reference ||
                            index
                          }
                          className="rounded-lg border border-slate-700 bg-white/[0.03] p-4 dark:border-slate-700 dark:bg-white/[0.03] light:border-slate-200 light:bg-slate-50"
                        >
                          <div className="flex flex-col justify-between gap-2 md:flex-row">
                            <div>
                              <p className="font-semibold">
                                Documentation Bundle
                              </p>

                              <p className="mt-1 text-xs text-slate-400 dark:text-slate-400 light:text-slate-500">
                                {documentation.plot_count ||
                                  selected.plot_count}{' '}
                                plot(s)
                              </p>

                              {documentation.reference && (
                                <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-500">
                                  Reference:{' '}
                                  {
                                    documentation.reference
                                  }
                                </p>
                              )}
                            </div>

                            <div className="text-left md:text-right">
                              <p className="text-lg font-extrabold">
                                {money(
                                  documentation.amount
                                )}
                              </p>

                              <Badge
                                variant={statusVariant(
                                  documentation.status
                                )}
                              >
                                {documentation.status ||
                                  'unknown'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>

              {/* Timeline */}
              <div className="rounded-xl border border-slate-700 p-4 dark:border-slate-700 light:border-slate-200">
                <div className="mb-4 flex items-center gap-2">
                  <ReceiptText className="h-5 w-5 text-primary" />

                  <h3 className="font-semibold">
                    Subscriber Timeline
                  </h3>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="border-l-2 border-primary pl-4">
                    <p className="font-semibold">
                      Subscription created
                    </p>

                    <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-500">
                      {dateTime(selected.subscribed_at)}
                    </p>
                  </div>

                  {history.payments.map(
                    (payment, index) => (
                      <div
                        key={`timeline-${payment.id || index}`}
                        className="border-l-2 border-slate-600 pl-4 dark:border-slate-600 light:border-slate-300"
                      >
                        <p className="font-semibold">
                          Payment —{' '}
                          {money(payment.amount)}
                        </p>

                        <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-500">
                          {dateTime(payment.created_at)}
                        </p>
                      </div>
                    )
                  )}

                  {history.documentation.map(
                    (documentation, index) => (
                      <div
                        key={`documentation-${documentation.id || index}`}
                        className="border-l-2 border-slate-600 pl-4 dark:border-slate-600 light:border-slate-300"
                      >
                        <p className="font-semibold">
                          Documentation payment —{' '}
                          {money(
                            documentation.amount
                          )}
                        </p>

                        <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-500">
                          {dateTime(
                            documentation.created_at
                          )}
                        </p>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default AdminEstateSubscribers;