import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, Loader2, ShieldCheck } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';

type MigrationResult = {
  success?: boolean;
  migrated?: number;
  skipped?: number;
  remaining_plaintext?: number;
  next?: string;
  error?: string;
};

const AdminGmailSecurityMigration: React.FC = () => {
  const { hasPermission } = useAuth();
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<MigrationResult | null>(null);

  if (!hasPermission('admin:all')) return null;

  const runMigration = async () => {
    setRunning(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke('gmail-token-migrate', {
        body: {},
      });
      if (error) throw error;
      const next = (data ?? {}) as MigrationResult;
      setResult(next);
    } catch (error: any) {
      setResult({ success: false, error: error?.message || 'Gmail credential migration failed.' });
    } finally {
      setRunning(false);
    }
  };

  const complete = result?.success === true && Number(result.remaining_plaintext ?? -1) === 0;

  return (
    <Card className="border-amber-500/20 bg-slate-900/70">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-white">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
              Gmail Credential Security
            </CardTitle>
            <CardDescription className="mt-2 text-slate-400">
              Encrypts existing Gmail OAuth credentials server-side. No tokens or encryption keys are exposed in the admin interface.
            </CardDescription>
          </div>
          <Badge variant="outline" className="border-emerald-500/30 text-emerald-300">Admin Only</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
          <div className="flex gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
            <p className="text-sm leading-6 text-slate-300">
              This is a one-time security migration. Existing Gmail connections remain intact during encryption. Plaintext credentials are cleared only after encryption succeeds.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button disabled={running} className="bg-emerald-600 hover:bg-emerald-500">
                {running ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Migrating…</> : 'Encrypt Existing Gmail Credentials'}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Encrypt existing Gmail credentials?</AlertDialogTitle>
                <AlertDialogDescription>
                  Bridgefort will migrate eligible Gmail OAuth credentials into encrypted storage and clear the plaintext copies after each successful encryption. Do not close the browser until the request completes.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={runMigration}>Confirm Migration</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {complete && (
            <span className="inline-flex items-center gap-2 text-sm text-emerald-300">
              <CheckCircle2 className="h-4 w-4" /> Encryption migration complete
            </span>
          )}
        </div>

        {result && (
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-slate-700 bg-slate-800/60 p-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">Migrated</p>
              <p className="mt-1 text-xl font-semibold text-white">{result.migrated ?? 0}</p>
            </div>
            <div className="rounded-lg border border-slate-700 bg-slate-800/60 p-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">Already encrypted</p>
              <p className="mt-1 text-xl font-semibold text-white">{result.skipped ?? 0}</p>
            </div>
            <div className="rounded-lg border border-slate-700 bg-slate-800/60 p-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">Plaintext remaining</p>
              <p className={`mt-1 text-xl font-semibold ${Number(result.remaining_plaintext ?? 0) === 0 ? 'text-emerald-300' : 'text-amber-300'}`}>
                {result.remaining_plaintext ?? '—'}
              </p>
            </div>
          </div>
        )}

        {result?.error && (
          <p className="text-sm text-red-300">{result.error}</p>
        )}
        {result?.next && !complete && (
          <p className="text-sm text-slate-400">{result.next}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminGmailSecurityMigration;
