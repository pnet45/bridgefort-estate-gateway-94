import React, { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { RefreshCw, Loader2, CheckCircle2, XCircle, RotateCcw, ShieldAlert, History, Coins } from 'lucide-react';

type AuditEvent = { audit_id: string; event_type: string; previous_status: string | null; new_status: string; actor_user_id: string | null; review_note: string | null; created_at: string; };

type Commission = {
  commission_id: string;
  division: 'homes' | 'agrovest' | 'travels';
  referrer_user_id: string;
  referrer_name: string | null;
  source_type: string;
  gross_customer_payment: number;
  commission_rate: number;
  commission_amount: number;
  status: 'held' | 'earned' | 'paid' | 'reversed';
  payment_reference: string | null;
  created_at: string;
  paid_at: string | null;
  payout_reference: string | null;
};

type Application = {
  id: string;
  user_id: string;
  division: 'homes' | 'travels' | 'agrovest';
  application_status: 'pending_review' | 'referral_only' | 'legacy_existing' | 'approved' | 'rejected' | 'suspended' | 'withdrawn';
  requested_at: string;
  reviewed_at: string | null;
  review_note: string | null;
  first_name: string | null;
  last_name: string | null;
  referral_code: string | null;
  agreement_version: string | null;
  agreement_accepted_at: string | null;
  privacy_notice_acknowledged: boolean | null;
};

const divisionNames = {
  homes: 'Bridgefort Homes',
  travels: 'Bridgefort Travels',
  agrovest: 'Bridgefort Agrovest',
};

const statusNames: Record<Application['application_status'], string> = {
  pending_review: 'Pending review',
  referral_only: 'Referral attribution only',
  legacy_existing: 'Legacy BH-Realtors',
  approved: 'Approved',
  rejected: 'Rejected',
  suspended: 'Suspended',
  withdrawn: 'Withdrawn',
};

export default function AdminBMCApplications({ canManage }: { canManage: boolean }) {
  const [rows, setRows] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});
  const [auditByApplication, setAuditByApplication] = useState<Record<string, AuditEvent[]>>({});
  const [expandedAuditId, setExpandedAuditId] = useState<string | null>(null);
  const [auditLoadingId, setAuditLoadingId] = useState<string | null>(null);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [commissionLoading, setCommissionLoading] = useState(false);
  const [payoutReferences, setPayoutReferences] = useState<Record<string, string>>({});
  const [reversalReasons, setReversalReasons] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc('admin_list_bmc_division_applications' as never, {} as never) as unknown as {
      data: Array<Omit<Application, 'id'> & { application_id: string }> | null;
      error: { message: string } | null;
    };
    if (error) {
      console.error('BMC application queue failed:', error);
      toast({ title: 'Unable to load BMC applications', description: 'Confirm the BMC database migration has been applied and that you have approval permissions.', variant: 'destructive' });
      setRows([]);
    } else {
      setRows(Array.isArray(data) ? data.map((row) => ({ ...row, id: row.application_id })) as Application[] : []);
    }
    if (canManage) {
      setCommissionLoading(true);
      const { data: commissionData, error: commissionError } = await supabase.rpc('admin_list_bmc_division_commissions' as never, { _division: null } as never) as unknown as {
        data: Commission[] | null;
        error: { message: string } | null;
      };
      if (commissionError) {
        console.error('BMC commission ledger failed:', commissionError);
        toast({ title: 'Unable to load BMC commissions', description: 'Check BMC commission management permission and migration status.', variant: 'destructive' });
        setCommissions([]);
      } else {
        setCommissions(Array.isArray(commissionData) ? commissionData : []);
      }
      setCommissionLoading(false);
    }
    setLoading(false);
  }, [canManage]);

  useEffect(() => { void load(); }, [load]);

  const toggleAudit = async (applicationId: string) => {
    if (expandedAuditId === applicationId) { setExpandedAuditId(null); return; }
    setExpandedAuditId(applicationId);
    if (auditByApplication[applicationId]) return;
    setAuditLoadingId(applicationId);
    const { data, error } = await supabase.rpc('admin_list_bmc_division_audit' as never, { _application_id: applicationId } as never) as unknown as { data: AuditEvent[] | null; error: { message: string } | null };
    if (error) {
      console.error('BMC audit history failed:', error);
      toast({ title: 'Unable to load review history', description: 'Check your approval permission and try again.', variant: 'destructive' });
      setExpandedAuditId(null);
    } else {
      setAuditByApplication((current) => ({ ...current, [applicationId]: Array.isArray(data) ? data : [] }));
    }
    setAuditLoadingId(null);
  };

  const changeStatus = async (application: Application, nextStatus: Application['application_status']) => {
    const reviewNote = (reviewNotes[application.id] || '').trim();
    if ((nextStatus === 'rejected' || nextStatus === 'suspended') && !reviewNote) {
      toast({ title: 'Review reason required', description: 'Record a reason before rejecting or suspending a BMC application.', variant: 'destructive' });
      return;
    }
    setSavingId(application.id);
    const { error } = await supabase.rpc('admin_review_bmc_division_application' as never, {
      _application_id: application.id,
      _decision: nextStatus,
      _review_note: reviewNote || null,
    } as never);
    if (error) {
      console.error('BMC application status update failed:', error);
      toast({ title: 'Status update failed', description: 'The server rejected this change. Check your approval permission and try again.', variant: 'destructive' });
    } else {
      toast({ title: 'BMC application updated', description: `${divisionNames[application.division]} status changed to ${statusNames[nextStatus]}.` });
      setAuditByApplication((current) => { const next = { ...current }; delete next[application.id]; return next; });
      setReviewNotes((current) => ({ ...current, [application.id]: '' }));
      await load();
    }
    setSavingId(null);
  };

  const markCommissionPaid = async (commission: Commission) => {
    const payoutReference = (payoutReferences[commission.commission_id] || '').trim();
    if (payoutReference.length < 3) {
      toast({ title: 'Payout reference required', description: 'Enter the verified bank transfer or payout reference.', variant: 'destructive' });
      return;
    }
    const { error } = await supabase.rpc('admin_mark_bmc_commission_paid' as never, {
      _commission_id: commission.commission_id,
      _payout_reference: payoutReference,
    } as never);
    if (error) {
      toast({ title: 'Commission payout update failed', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Commission marked as paid', description: 'The payout reference has been recorded.' });
    setPayoutReferences((current) => ({ ...current, [commission.commission_id]: '' }));
    await load();
  };

  const reverseCommission = async (commission: Commission) => {
    const reason = (reversalReasons[commission.commission_id] || '').trim();
    if (reason.length < 5) {
      toast({ title: 'Reversal reason required', description: 'Record the verified refund or cancellation reason.', variant: 'destructive' });
      return;
    }
    const { error } = await supabase.rpc('admin_reverse_bmc_division_commission' as never, {
      _commission_id: commission.commission_id,
      _reason: reason,
    } as never);
    if (error) {
      toast({ title: 'Commission reversal failed', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Commission reversed', description: 'The reversal reason is recorded in the commission ledger.' });
    setReversalReasons((current) => ({ ...current, [commission.commission_id]: '' }));
    await load();
  };

  const pending = rows.filter((row) => row.application_status === 'pending_review').length;
  const approved = rows.filter((row) => row.application_status === 'approved').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-foreground">BMC Division Applications</h2>
          <p className="mt-1 text-sm text-muted-foreground">Review each division independently. Decisions are recorded in a restricted audit trail.</p>
        </div>
        <Button variant="outline" onClick={() => void load()} disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />} Refresh
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total division records</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold text-foreground">{rows.length}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Awaiting review</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold text-amber-600">{pending}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Approved divisions</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold text-emerald-600">{approved}</p></CardContent></Card>
      </div>

      {canManage && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Coins className="h-5 w-5" /> BMC Division Commissions</CardTitle>
            <p className="text-sm text-muted-foreground">Homes, Agrovest and Travels use the unified BMC referral identity and commission ledger. Referrals are attributed immediately; commissions remain held until central KYC and the relevant division approval are complete. Legacy BH-Realtors referral codes and historical commission records remain preserved.</p>
          </CardHeader>
          <CardContent>
            {commissionLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading commission ledger…</div>
            ) : commissions.length === 0 ? (
              <p className="rounded-lg bg-muted/40 p-3 text-sm text-muted-foreground">No Agrovest or Travels commissions have been earned yet.</p>
            ) : (
              <div className="space-y-3">
                {commissions.map((commission) => (
                  <div key={commission.commission_id} className="rounded-xl border border-border p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-foreground">{commission.referrer_name || ('BMC ' + commission.referrer_user_id.slice(0, 8))} · <span className="capitalize">{commission.division}</span></p>
                        <p className="mt-1 text-xs text-muted-foreground">Customer payment: {Number(commission.gross_customer_payment).toLocaleString('en-NG', { style: 'currency', currency: 'NGN' })} · {commission.commission_rate}% direct commission</p>
                        <p className="mt-1 text-xs text-muted-foreground">Payment reference: {commission.payment_reference || 'Not supplied'} · {new Date(commission.created_at).toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-foreground">{Number(commission.commission_amount).toLocaleString('en-NG', { style: 'currency', currency: 'NGN' })}</p>
                        <Badge variant="outline">{commission.status}</Badge>
                      </div>
                    </div>
                    {commission.status === 'earned' && (
                      <div className="mt-4 grid gap-3 md:grid-cols-2">
                        <div className="space-y-2">
                          <Input value={payoutReferences[commission.commission_id] || ''} onChange={(event) => setPayoutReferences((current) => ({ ...current, [commission.commission_id]: event.target.value }))} placeholder="Verified payout reference" maxLength={120} />
                          <Button size="sm" onClick={() => void markCommissionPaid(commission)}>Mark paid</Button>
                        </div>
                        <div className="space-y-2">
                          <Textarea value={reversalReasons[commission.commission_id] || ''} onChange={(event) => setReversalReasons((current) => ({ ...current, [commission.commission_id]: event.target.value }))} placeholder="Verified full refund / cancellation reason" rows={2} maxLength={1000} />
                          <Button size="sm" variant="destructive" onClick={() => void reverseCommission(commission)}>Reverse unpaid commission</Button>
                        </div>
                      </div>
                    )}
                    {commission.status === 'paid' && <p className="mt-2 text-xs text-muted-foreground">Paid {commission.paid_at ? new Date(commission.paid_at).toLocaleString() : ''} · Payout reference: {commission.payout_reference || 'Not recorded'}</p>}
                    {commission.status === 'reversed' && <p className="mt-2 text-xs text-muted-foreground">Reversed. The reason is retained in the database audit record.</p>}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex items-center gap-3 rounded-xl border border-border p-6 text-sm text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /> Loading applications…</div>
      ) : rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center">
          <ShieldAlert className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 font-medium text-foreground">No BMC division applications found</p>
          <p className="mt-1 text-sm text-muted-foreground">New applications will appear here after the BMC migration is enabled.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((application) => (
            <Card key={application.id}>
              <CardContent className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-foreground">{divisionNames[application.division]}</h3>
                    <Badge variant="outline">{statusNames[application.application_status]}</Badge>
                  </div>
                  <p className="text-sm text-foreground">{[application.first_name, application.last_name].filter(Boolean).join(' ') || 'Name not available'}</p>
                  <p className="text-xs text-muted-foreground">Partner account: {application.user_id.slice(0, 8)}…{application.referral_code ? ` · Legacy BH-Realtors code: ${application.referral_code}` : ''} · Submitted {new Date(application.requested_at).toLocaleDateString()}</p>
                  <p className="text-xs text-muted-foreground">
                    {application.agreement_version && application.agreement_accepted_at
                      ? `BMC Agreement v${application.agreement_version} accepted ${new Date(application.agreement_accepted_at).toLocaleDateString()}`
                      : 'BMC Agreement acceptance missing'}
                    {' · '}
                    {application.privacy_notice_acknowledged ? 'BMC Privacy Notice acknowledged' : 'BMC Privacy acknowledgement missing'}
                  </p>
                  {application.reviewed_at && <p className="text-xs text-muted-foreground">Last reviewed {new Date(application.reviewed_at).toLocaleString()}</p>}
                  {application.review_note && <p className="rounded-md bg-muted/50 p-2 text-xs text-muted-foreground">Previous review note: {application.review_note}</p>}
                </div>
                {canManage && <div className="w-full space-y-2 md:w-72">
                  <Textarea
                    value={reviewNotes[application.id] || ''}
                    onChange={(event) => setReviewNotes((current) => ({ ...current, [application.id]: event.target.value }))}
                    placeholder="Review note (required for rejection or suspension)"
                    rows={2}
                    maxLength={1000}
                    aria-label={`Review note for ${divisionNames[application.division]}`}
                  />
                </div>}
                <div className="flex w-full flex-wrap gap-2 md:w-auto">
                  <Button size="sm" variant="ghost" onClick={() => void toggleAudit(application.id)} disabled={auditLoadingId === application.id}>
                    {auditLoadingId === application.id ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <History className="mr-1 h-4 w-4" />}
                    {expandedAuditId === application.id ? 'Hide history' : 'Review history'}
                  </Button>
                </div>
                {expandedAuditId === application.id && (
                  <div className="w-full rounded-lg border border-border bg-muted/30 p-3">
                    <p className="mb-2 text-sm font-semibold text-foreground">Application audit history</p>
                    {(auditByApplication[application.id] || []).length === 0 ? <p className="text-xs text-muted-foreground">No audit events recorded.</p> : (
                      <ol className="space-y-3">
                        {(auditByApplication[application.id] || []).map((event) => (
                          <li key={event.audit_id} className="border-l-2 border-border pl-3">
                            <p className="text-xs font-medium text-foreground">{event.event_type.replace(/_/g, ' ')} · {new Date(event.created_at).toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">{event.previous_status ? `${statusNames[event.previous_status as Application['application_status']] || event.previous_status} → ` : ''}{statusNames[event.new_status as Application['application_status']] || event.new_status}</p>
                            {event.actor_user_id && <p className="text-xs text-muted-foreground">Reviewer ID: {event.actor_user_id.slice(0, 8)}…</p>}
                            {event.review_note && <p className="mt-1 text-xs text-muted-foreground">{event.review_note}</p>}
                          </li>
                        ))}
                      </ol>
                    )}
                  </div>
                )}
                {canManage && <div className="flex flex-wrap gap-2">
                  {application.application_status === 'pending_review' && (
                    <>
                      <Button size="sm" onClick={() => void changeStatus(application, 'approved')} disabled={savingId === application.id}>
                        {savingId === application.id ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-1 h-4 w-4" />} Approve
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => void changeStatus(application, 'rejected')} disabled={savingId === application.id}>
                        <XCircle className="mr-1 h-4 w-4" /> Reject
                      </Button>
                    </>
                  )}
                  {application.application_status === 'approved' && (
                    <Button size="sm" variant="outline" onClick={() => void changeStatus(application, 'suspended')} disabled={savingId === application.id}>Suspend</Button>
                  )}
                  {application.application_status === 'suspended' && (
                    <Button size="sm" onClick={() => void changeStatus(application, 'approved')} disabled={savingId === application.id}>Reinstate</Button>
                  )}
                  {application.application_status === 'rejected' && (
                    <Button size="sm" variant="outline" onClick={() => void changeStatus(application, 'pending_review')} disabled={savingId === application.id}>
                      <RotateCcw className="mr-1 h-4 w-4" /> Reopen review
                    </Button>
                  )}
                  {application.application_status === 'legacy_existing' && (
                    <span className="text-xs text-muted-foreground">Legacy account retained; review before granting new division access.</span>
                  )}
                </div>}
                {!canManage && <p className="text-xs text-muted-foreground">Read-only access. A designated BMC manager must make approval decisions.</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
