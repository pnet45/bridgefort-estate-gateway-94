import React, { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, RefreshCw, MailWarning } from "lucide-react";
import { toast } from "sonner";

type DocumentType = "contract_of_sale" | "deed_of_assignment";
type Control = { document_type: DocumentType; enabled: boolean; updated_at?: string | null };

const DOCUMENTS: { type: DocumentType; label: string; description: string }[] = [
  { type: "contract_of_sale", label: "Contract of Sale email", description: "Allows eligible Contract of Sale emails, including the automatic final-payment workflow." },
  { type: "deed_of_assignment", label: "Deed of Assignment email", description: "Allows eligible Deed of Assignment emails after documentation fees are confirmed." },
];

export default function TransactionDocumentDeliveryAutomation() {
  const { user, permissions } = useAuth();
  const canManage = permissions.includes("admin:manage_documentation") ||
    permissions.includes("admin:all") || permissions.includes("super_admin");
  const [controls, setControls] = useState<Control[]>([]);
  const [templateReady, setTemplateReady] = useState<Partial<Record<DocumentType, boolean>>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<DocumentType | "">("");
  const [loadError, setLoadError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    const [controlResult, templateResult] = await Promise.all([
      supabase.from("transaction_document_automation_controls")
        .select("document_type,enabled,updated_at")
        .in("document_type", DOCUMENTS.map((doc) => doc.type)),
      supabase.from("transaction_document_templates")
        .select("document_type,name,body_html_template,enabled")
        .in("document_type", DOCUMENTS.map((doc) => doc.type)),
    ]);
    if (controlResult.error || templateResult.error) {
      setControls([]);
      setTemplateReady({});
      setLoadError(controlResult.error?.message || templateResult.error?.message || "Delivery settings could not be verified.");
    } else {
      const rows = controlResult.data || [];
      const templates = templateResult.data || [];
      setControls(rows as Control[]);
      setTemplateReady(Object.fromEntries(DOCUMENTS.map((doc) => {
        const template = templates.find((row: any) => row.document_type === doc.type) as any;
        const ready = !!template?.enabled &&
          !/legal review required/i.test(String(template?.name || "")) &&
          !/\[(?:TO BE CONFIRMED|ESTATE-SPECIFIC|CURRENT APPROVED|VERIFY|INSERT AND VERIFY|SURVEY COORDINATES)/i.test(String(template?.body_html_template || ""));
        return [doc.type, ready];
      })) as Partial<Record<DocumentType, boolean>>);
      const missing = DOCUMENTS.filter((doc) => !rows.some((row: any) => row.document_type === doc.type));
      if (missing.length) setLoadError("Automation controls are not fully installed. Delivery remains blocked until the database migration is applied.");
    }
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const toggle = async (type: DocumentType, enabled: boolean) => {
    if (!canManage || loadError || loading || saving) return;
    if (enabled && !templateReady[type]) {
      toast.error("Cannot enable delivery yet. First enable the matching approved template and resolve all legal-review placeholders.");
      return;
    }
    const current = controls.find((control) => control.document_type === type);
    if (!current) {
      toast.error("The server-side automation control is missing. Email delivery remains blocked.");
      return;
    }
    setSaving(type);
    const { data, error } = await supabase
      .from("transaction_document_automation_controls")
      .update({ enabled, updated_by: user?.id || null, updated_at: new Date().toISOString() })
      .eq("document_type", type)
      .select("document_type,enabled,updated_at")
      .maybeSingle();
    if (error || !data) {
      toast.error(error?.message || "The automation setting was not saved. Email delivery remains unchanged.");
      await load();
    } else {
      setControls((previous) => previous.map((item) => item.document_type === type ? data as Control : item));
      toast.success(enabled ? "Document email automation enabled. No email was sent by this switch." : "Document email automation disabled.");
    }
    setSaving("");
  };

  if (!canManage) return null;

  return (
    <Card className="mb-4 border-amber-200 bg-amber-50/60">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-2">
          <div className="mt-0.5 rounded-lg bg-white p-2 text-amber-700"><ShieldCheck className="h-4 w-4" /></div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-sm">Legal document email controls</CardTitle>
              <Badge variant="outline" className="border-amber-300 bg-white text-amber-800">Default: Off</Badge>
            </div>
            <p className="mt-1 text-xs leading-5 text-slate-600">Turning a switch on never sends an email by itself. Activation is permitted only after the matching template is enabled and all legal-review placeholders are resolved. Server-side payment and permission checks still apply.</p>
          </div>
          <button type="button" onClick={() => void load()} aria-label="Refresh legal document automation controls" className="rounded-lg p-2 text-slate-500 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5b2a86]" disabled={loading}>
            <RefreshCw className={loading ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
          </button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        {loadError ? <div role="alert" className="flex items-start gap-2 rounded-lg border border-red-200 bg-white p-3 text-xs leading-5 text-red-700"><MailWarning className="mt-0.5 h-4 w-4 shrink-0" /><span>{loadError} No Contract of Sale or Deed of Assignment email can be sent through this workflow while the control cannot be verified.</span></div> : null}
        {DOCUMENTS.map((doc) => {
          const control = controls.find((item) => item.document_type === doc.type);
          return <div key={doc.type} className="flex items-center justify-between gap-3 rounded-xl border border-white bg-white p-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-800">{doc.label}</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">{doc.description}</p>
              {!templateReady[doc.type] ? <p className="mt-2 text-xs leading-5 text-amber-700">Activation is blocked until the template is enabled, legally approved, and all review placeholders are resolved.</p> : null}
              <Badge variant="outline" className={control?.enabled ? "mt-2 border-emerald-200 bg-emerald-50 text-emerald-700" : "mt-2 border-slate-200 bg-slate-50 text-slate-600"}>{control?.enabled ? "On" : "Off"}</Badge>
            </div>
            <Switch
              checked={control?.enabled === true}
              onCheckedChange={(value) => void toggle(doc.type, value)}
              disabled={loading || !!loadError || !control || !!saving || !canManage || (!templateReady[doc.type] && control?.enabled !== true)}
              aria-label={`Enable ${doc.label}`}
            />
          </div>;
        })}
        <p className="text-[11px] leading-5 text-slate-500">An Off or unavailable control fails closed. No document email is triggered by saving these settings.</p>
      </CardContent>
    </Card>
  );
}
