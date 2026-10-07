import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Activity, AlertTriangle, CheckCircle2, Clock3, Mail, RefreshCw, Search, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

type DeliveryEvent = {
  id: string;
  event_key: string;
  recipient_email: string;
  recipient_name: string | null;
  subject: string | null;
  provider: string;
  sender_email: string | null;
  template_key: string | null;
  source_function: string | null;
  status: string;
  attempt_count: number;
  provider_message_id: string | null;
  error_message: string | null;
  queued_at: string;
  sent_at: string | null;
  created_at: string;
  updated_at: string;
};

const statusTone: Record<string, string> = {
  sent: "bg-emerald-50 text-emerald-700 border-emerald-200",
  failed: "bg-red-50 text-red-700 border-red-200",
  queued: "bg-amber-50 text-amber-700 border-amber-200",
  sending: "bg-blue-50 text-blue-700 border-blue-200",
};

export default function AdminEmailDeliveryMonitor() {
  const [events, setEvents] = useState<DeliveryEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("all");
  const [source, setSource] = useState("all");
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const client = supabase as any;
      const { data, error } = await client
        .from("email_delivery_events")
        .select("id,event_key,recipient_email,recipient_name,subject,provider,sender_email,template_key,source_function,status,attempt_count,provider_message_id,error_message,queued_at,sent_at,created_at,updated_at")
        .order("created_at", { ascending: false })
        .limit(250);
      if (error) throw error;
      setEvents((data || []) as DeliveryEvent[]);
    } catch (error) {
      console.error("Email delivery monitor:", error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const timer = window.setInterval(load, 30000);
    return () => window.clearInterval(timer);
  }, [load]);

  const sources = useMemo(() => Array.from(new Set(events.map(e => e.source_function).filter(Boolean) as string[])).sort(), [events]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return events.filter(e => {
      if (status !== "all" && e.status !== status) return false;
      if (source !== "all" && e.source_function !== source) return false;
      if (!q) return true;
      return [e.recipient_email, e.recipient_name, e.subject, e.source_function, e.template_key, e.event_key]
        .some(v => String(v || "").toLowerCase().includes(q));
    });
  }, [events, search, source, status]);

  const stats = useMemo(() => {
    const since = Date.now() - 24 * 60 * 60 * 1000;
    const recent = events.filter(e => new Date(e.created_at).getTime() >= since);
    return {
      total: recent.length,
      sent: recent.filter(e => e.status === "sent").length,
      failed: recent.filter(e => e.status === "failed").length,
      pending: recent.filter(e => e.status === "queued" || e.status === "sending").length,
      attempts: recent.reduce((sum, e) => sum + Number(e.attempt_count || 0), 0),
    };
  }, [events]);

  return (
    <div className="min-w-0 flex-1 overflow-auto bg-slate-50 p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-[#5b2a86]" />
              <h2 className="text-xl font-semibold text-slate-900">Unified Email Monitoring</h2>
              <Badge className="rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-50">Live</Badge>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              One delivery history for automated and Resend-based emails, with idempotency and automatic retry recovery.
            </p>
          </div>
          <Button variant="outline" onClick={load} disabled={loading} className="rounded-xl">
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            ["24h deliveries", stats.total, Mail, "text-slate-700"],
            ["Sent", stats.sent, CheckCircle2, "text-emerald-600"],
            ["Failed", stats.failed, XCircle, "text-red-600"],
            ["Pending", stats.pending, Clock3, "text-amber-600"],
          ].map(([label, value, Icon, tone]) => (
            <Card key={String(label)} className="rounded-2xl border-slate-200 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">{label}</span>
                  <Icon className={`h-4 w-4 ${tone}`} />
                </div>
                <div className="mt-2 text-2xl font-bold text-slate-900">{String(value)}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {stats.failed > 0 && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <strong>{stats.failed} failed delivery record{stats.failed === 1 ? "" : "s"}</strong> detected in the last 24 hours.
              Retryable messages are picked up automatically every 15 minutes, up to three attempts.
            </div>
          </div>
        )}

        <Card className="rounded-2xl border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Delivery ledger</CardTitle>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_190px_240px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search recipient, subject or source…" className="rounded-xl pl-9" />
              </div>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="rounded-xl"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="queued">Queued</SelectItem>
                  <SelectItem value="sending">Sending</SelectItem>
                </SelectContent>
              </Select>
              <Select value={source} onValueChange={setSource}>
                <SelectTrigger className="rounded-xl"><SelectValue placeholder="Source" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All email sources</SelectItem>
                  {sources.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-sm">
                <thead className="border-y border-slate-200 bg-slate-50 text-left text-xs text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Recipient</th>
                    <th className="px-4 py-3 font-medium">Subject</th>
                    <th className="px-4 py-3 font-medium">Source</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Attempts</th>
                    <th className="px-4 py-3 font-medium">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading && !events.length ? (
                    <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-400">Loading delivery history…</td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-400">No delivery records match the current filters.</td></tr>
                  ) : filtered.map(event => (
                    <tr key={event.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-800">{event.recipient_name || "—"}</div>
                        <div className="text-xs text-slate-500">{event.recipient_email}</div>
                      </td>
                      <td className="max-w-[320px] px-4 py-3">
                        <div className="truncate text-slate-700">{event.subject || "—"}</div>
                        {event.error_message && <div className="mt-1 max-w-[320px] truncate text-xs text-red-600" title={event.error_message}>{event.error_message}</div>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-xs font-medium text-slate-700">{event.source_function || "—"}</div>
                        <div className="text-[11px] text-slate-400">{event.template_key || "—"}</div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className={`rounded-full ${statusTone[event.status] || ""}`}>{event.status}</Badge>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{event.attempt_count}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">{new Date(event.sent_at || event.updated_at || event.created_at).toLocaleString("en-NG")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
