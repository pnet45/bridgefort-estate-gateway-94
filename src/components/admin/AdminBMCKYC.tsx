import React, { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { RefreshCw, Loader2, ShieldCheck, FileText, CheckCircle2, XCircle, AlertCircle, Clock } from 'lucide-react';

type KycRow = {
  kyc_id: string; user_id: string; email: string | null; status: string;
  identity_data: Record<string, unknown>; documents: Record<string, unknown>;
  submitted_at: string | null; reviewed_at: string | null; reviewed_by: string | null; review_note: string | null;
};
type SignedDocument = { key: string; name: string; url: string };

export default function AdminBMCKYC() {
  const [rows, setRows] = useState<KycRow[]>([]);
  const [signedDocuments, setSignedDocuments] = useState<Record<string, SignedDocument[]>>({});
  const [reasons, setReasons] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc('admin_list_bmc_identity_kyc' as never, {} as never) as unknown as { data: KycRow[] | null; error: { message: string } | null };
    if (error) {
      toast({ title: 'Unable to load BMC KYC queue', description: error.message, variant: 'destructive' });
      setRows([]);
      setLoading(false);
      return;
    }
    const nextRows = Array.isArray(data) ? data : [];
    setRows(nextRows);
    const links: Record<string, SignedDocument[]> = {};
    await Promise.all(nextRows.map(async row => {
      const items = await Promise.all(Object.entries(row.documents || {}).map(async ([key, raw]) => {
        const value = raw as Record<string, string> | string;
        const path = typeof value === 'string' ? value : value.path || value.url;
        if (!path || !path.startsWith(row.user_id + '/')) return null;
        const { data: signed, error: signError } = await supabase.storage.from('kyc-documents').createSignedUrl(path, 10 * 60);
        if (signError || !signed?.signedUrl) return null;
        return { key, name: typeof value === 'string' ? key : value.name || key, url: signed.signedUrl };
      }));
      links[row.kyc_id] = items.filter((item): item is SignedDocument => Boolean(item));
    }));
    setSignedDocuments(links);
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const review = async (row: KycRow, decision: 'approve' | 'reject' | 'request_correction' | 'under_review') => {
    const reason = (reasons[row.kyc_id] || '').trim();
    if (decision !== 'approve' && decision !== 'under_review' && reason.length < 5) {
      toast({ title: 'Reason required', description: 'Provide a clear reason for rejection or requested correction.', variant: 'destructive' });
      return;
    }
    setSavingId(row.kyc_id);
    const { error } = await supabase.rpc('admin_review_bmc_identity_kyc' as never, {
      _kyc_id: row.kyc_id, _decision: decision, _reason: reason || null,
    } as never);
    if (error) {
      toast({ title: 'KYC review failed', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'BMC identity review updated', description: decision === 'approve' ? 'Central identity verification is now approved across the Bridgefort businesses.' : 'The review decision has been recorded.' });
      setReasons(current => ({ ...current, [row.kyc_id]: '' }));
      if (decision === 'approve') {
        const { data: emailResult, error: emailError } = await supabase.functions.invoke('send-bmc-kyc-approval-email', { body: { kyc_id: row.kyc_id } });
        if (emailError || !emailResult?.success) {
          toast({ title: 'Approval saved; email needs retry', description: emailError?.message || emailResult?.error || 'The KYC approval is saved, but the notification could not be confirmed.', variant: 'destructive' });
        } else {
          toast({ title: 'Approval email sent', description: emailResult.duplicate ? 'The idempotent email event was already delivered.' : 'The BMC has been notified of the approval.' });
        }
      }
      await load();
    }
    setSavingId(null);
  };

  const pending = rows.filter(row => ['PENDING','UNDER_REVIEW'].includes(row.status)).length;
  const verified = rows.filter(row => row.status === 'VERIFIED').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Central BMC KYC Review</h2>
          <p className="mt-1 text-sm text-muted-foreground">One identity verification shared by Bridgefort Homes, Travels and Agrovest. Document links expire after 10 minutes.</p>
        </div>
        <Button variant="outline" onClick={() => void load()} disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />} Refresh
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Submissions</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{rows.length}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Awaiting review</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold text-amber-600">{pending}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Verified BMC identities</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold text-emerald-600">{verified}</p></CardContent></Card>
      </div>
      {loading ? <div className="flex items-center gap-2 p-6 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading KYC submissions…</div> : rows.length === 0 ? <p className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">No central BMC KYC submissions have been received.</p> : (
        <div className="space-y-4">
          {rows.map(row => (
            <Card key={row.kyc_id}>
              <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div><CardTitle className="text-lg">{String(row.identity_data.first_name || '')} {String(row.identity_data.last_name || '')}</CardTitle><p className="mt-1 text-sm text-muted-foreground">{row.email || row.user_id} · Submitted {row.submitted_at ? new Date(row.submitted_at).toLocaleString() : '—'}</p></div>
                  <Badge variant="outline">{row.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
                  {Object.entries(row.identity_data || {}).map(([key,value]) => <div key={key} className="rounded-lg bg-muted/40 p-3"><p className="text-xs capitalize text-muted-foreground">{key.replaceAll('_',' ')}</p><p className="mt-1 break-words font-medium">{String(value ?? '—')}</p></div>)}
                </div>
                <div className="flex flex-wrap gap-2">
                  {(signedDocuments[row.kyc_id] || []).map(doc => <a key={doc.key} href={doc.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-muted"><FileText className="h-4 w-4" /> {doc.name}</a>)}
                  {(signedDocuments[row.kyc_id] || []).length === 0 && <p className="text-sm text-muted-foreground">No document links could be generated. Refresh and confirm reviewer storage permission.</p>}
                </div>
                {row.status === 'VERIFIED' && (
                  <div className="border-t pt-4">
                    <Button size="sm" variant="outline" onClick={async () => {
                      const { data: emailResult, error: emailError } = await supabase.functions.invoke('send-bmc-kyc-approval-email', { body: { kyc_id: row.kyc_id } });
                      if (emailError || !emailResult?.success) toast({ title: 'Approval email retry failed', description: emailError?.message || emailResult?.error || 'Please retry later.', variant: 'destructive' });
                      else toast({ title: 'Approval email confirmed', description: emailResult.duplicate ? 'This approval email was already delivered.' : 'The approval email has been sent.' });
                    }}>
                      <ShieldCheck className="mr-2 h-4 w-4" /> Retry approval email
                    </Button>
                  </div>
                )}
                {row.status !== 'VERIFIED' && (
                  <div className="space-y-3 border-t pt-4">
                    <Textarea value={reasons[row.kyc_id] || ''} onChange={event => setReasons(current => ({ ...current, [row.kyc_id]: event.target.value }))} placeholder="Review note (required for rejection or correction request)" rows={2} />
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" onClick={() => void review(row,'approve')} disabled={savingId === row.kyc_id}><CheckCircle2 className="mr-2 h-4 w-4" /> Approve KYC</Button>
                      <Button size="sm" variant="outline" onClick={() => void review(row,'under_review')} disabled={savingId === row.kyc_id}><Clock className="mr-2 h-4 w-4" /> Mark under review</Button>
                      <Button size="sm" variant="outline" onClick={() => void review(row,'request_correction')} disabled={savingId === row.kyc_id}><AlertCircle className="mr-2 h-4 w-4" /> Request correction</Button>
                      <Button size="sm" variant="destructive" onClick={() => void review(row,'reject')} disabled={savingId === row.kyc_id}><XCircle className="mr-2 h-4 w-4" /> Reject</Button>
                      {savingId === row.kyc_id && <Loader2 className="h-4 w-4 animate-spin" />}
                    </div>
                  </div>
                )}
                {row.review_note && <p className="rounded-lg bg-muted/40 p-3 text-sm text-muted-foreground">Last review note: {row.review_note}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
