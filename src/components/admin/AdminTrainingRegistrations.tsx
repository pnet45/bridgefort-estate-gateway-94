import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { AGRICULTURAL_TRAINING_TITLE, AGRICULTURAL_TRAINING_DATE } from '@/components/training/AgriculturalTrainingProgramme';
import { CalendarDays, Download, Mail, Phone, RefreshCw, Search, Sprout, Users } from 'lucide-react';

interface Registration {
  id: string;
  name: string;
  gender: string | null;
  email: string;
  phone: string;
  country: string | null;
  state: string | null;
  local_government: string | null;
  address: string | null;
  need_reminder: boolean | null;
  invite_another: boolean | null;
  invitee_name: string | null;
  invitee_phone: string | null;
  is_pbo: string | null;
  registered_at: string | null;
  referrer_name: string | null;
  referrer_phone: string | null;
  referrer_email: string | null;
}

const AdminTrainingRegistrations = () => {
  const [rows, setRows] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { toast } = useToast();

  const fetchRegistrations = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('training_registrations')
      .select('id,name,gender,email,phone,country,state,local_government,address,need_reminder,invite_another,invitee_name,invitee_phone,is_pbo,registered_at,referrer_name,referrer_phone,referrer_email')
      .eq('event_title', AGRICULTURAL_TRAINING_TITLE)
      .order('registered_at', { ascending: false });

    if (error) {
      console.error('Training registration fetch failed:', error);
      toast({ title: 'Could not load registrations', description: error.message, variant: 'destructive' });
      setRows([]);
    } else {
      setRows((data || []) as Registration[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) => [row.name, row.email, row.phone, row.state, row.local_government, row.is_pbo]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(q)));
  }, [rows, search]);

  const exportCsv = () => {
    const headers = ['Name', 'Email', 'Phone', 'Gender', 'PBO', 'Country', 'State', 'LGA', 'Address', 'Reminder', 'Invitee', 'Registered At'];
    const values = filteredRows.map((r) => [
      r.name, r.email, r.phone, r.gender || '', r.is_pbo || '', r.country || '', r.state || '', r.local_government || '',
      r.address || '', r.need_reminder ? 'Yes' : 'No', r.invitee_name || '', r.registered_at ? new Date(r.registered_at).toLocaleString() : ''
    ]);
    const escape = (value: string) => `"${String(value).replace(/"/g, '""')}"`;
    const csv = [headers, ...values].map((line) => line.map(escape).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'farming-to-wealth-atp-2026-registrations.csv';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-emerald-200/30 bg-gradient-to-br from-emerald-950 via-emerald-900 to-green-900 text-white">
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2 text-lime-200"><Sprout className="h-5 w-5" /><span className="text-xs font-bold uppercase tracking-[0.2em]">Agricultural Training</span></div>
              <h2 className="text-2xl font-black md:text-3xl">Farming to Wealth — Registrations</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-emerald-100/80">View and manage participants registered for the Agricultural Training Programme. Registration records are pulled directly from the training registrations database.</p>
              <div className="mt-4 flex flex-wrap gap-3 text-sm text-emerald-50/90">
                <span className="inline-flex items-center gap-2"><CalendarDays className="h-4 w-4" /> {AGRICULTURAL_TRAINING_DATE}</span>
                <span className="inline-flex items-center gap-2"><Users className="h-4 w-4" /> {rows.length} registered</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={fetchRegistrations} variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white hover:text-emerald-950"><RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh</Button>
              <Button onClick={exportCsv} className="bg-lime-300 font-bold text-emerald-950 hover:bg-lime-200" disabled={!filteredRows.length}><Download className="mr-2 h-4 w-4" /> Export CSV</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200/50 bg-white/80 backdrop-blur-xl">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <CardTitle className="text-lg">Participants</CardTitle>
            <div className="relative w-full md:max-w-sm"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, email, phone, state..." className="pl-9" /></div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">Loading registrations...</div>
          ) : filteredRows.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center text-center"><Users className="mb-3 h-8 w-8 text-muted-foreground" /><p className="font-medium">No registrations found</p><p className="text-sm text-muted-foreground">New registrations for this event will appear here.</p></div>
          ) : (
            <div className="overflow-x-auto rounded-xl border">
              <table className="w-full min-w-[1050px] text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500"><tr>
                  <th className="px-4 py-3">Participant</th><th className="px-4 py-3">Contact</th><th className="px-4 py-3">Location</th><th className="px-4 py-3">PBO</th><th className="px-4 py-3">Invitee</th><th className="px-4 py-3">Registered</th>
                </tr></thead>
                <tbody className="divide-y bg-white">
                  {filteredRows.map((row) => (
                    <tr key={row.id} className="align-top hover:bg-slate-50/80">
                      <td className="px-4 py-4"><div className="font-semibold text-slate-900">{row.name}</div><div className="mt-1 text-xs text-slate-500">{row.gender || 'Gender not provided'}</div></td>
                      <td className="px-4 py-4"><a className="flex items-center gap-2 text-blue-700 hover:underline" href={`mailto:${row.email}`}><Mail className="h-3.5 w-3.5" />{row.email}</a><a className="mt-1 flex items-center gap-2 text-slate-600 hover:underline" href={`tel:${row.phone}`}><Phone className="h-3.5 w-3.5" />{row.phone}</a></td>
                      <td className="px-4 py-4"><div>{[row.local_government, row.state, row.country].filter(Boolean).join(', ') || 'Not provided'}</div><div className="mt-1 max-w-xs text-xs text-slate-500">{row.address || ''}</div></td>
                      <td className="px-4 py-4"><Badge variant="outline">{row.is_pbo || 'Not stated'}</Badge></td>
                      <td className="px-4 py-4">{row.invitee_name ? <><div className="font-medium">{row.invitee_name}</div><div className="text-xs text-slate-500">{row.invitee_phone || ''}</div></> : <span className="text-slate-400">—</span>}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-xs text-slate-500">{row.registered_at ? new Date(row.registered_at).toLocaleString() : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminTrainingRegistrations;
