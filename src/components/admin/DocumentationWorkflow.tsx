import React, { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { FileText, RefreshCw, Search, Save, Upload, Mail, Printer, CheckCircle2, Clock3, ShieldCheck, FileUp } from "lucide-react";

type DocumentType = "contract_of_sale" | "survey_plan" | "plot_demarcation" | "deed_of_assignment";
type PurchaseOrder = {
  id: string; user_id: string; customer_email: string | null; customer_name: string | null;
  total_amount: number | null; amount_paid: number | null; balance: number | null;
  payment_status: string | null; items: any; created_at: string;
};
type Template = { id?: string; document_type: DocumentType; name: string; subject_template: string; body_html_template: string; enabled: boolean; };
type SentDocument = { id: string; order_id: string; document_type: DocumentType; file_name: string; status: string; sent_at: string; storage_path: string; };
type FeePayment = { order_id: string | null; user_id: string; status: string; amount: number | null; created_at: string; };

const DOCS: { type: DocumentType; label: string; feeGated: boolean; description: string }[] = [
  { type: "contract_of_sale", label: "Contract of Sale", feeGated: false, description: "Available only after full property payment is confirmed." },
  { type: "survey_plan", label: "Survey Plan", feeGated: true, description: "Covered by confirmed Documentation Fees payment." },
  { type: "plot_demarcation", label: "Plot Demarcation", feeGated: true, description: "Covered by confirmed Documentation Fees payment." },
  { type: "deed_of_assignment", label: "Deed of Assignment", feeGated: true, description: "Covered by confirmed Documentation Fees payment." },
];
const money = (value: unknown) => new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(Number(value || 0));
const titleCase = (value: string) => value.replace(/[_-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
const escapeHtml = (value: unknown) => String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
const fillTemplate = (value: string, tokens: Record<string, string>) => value.replace(/{{\s*([a-zA-Z0-9_]+)\s*}}/g, (_m, key) => tokens[key] ?? "");

const DocumentationWorkflow: React.FC = () => {
  const { user, permissions } = useAuth();
  const canManage = permissions.includes("admin:manage_documentation") || permissions.includes("admin:all") || permissions.includes("super_admin");
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [fees, setFees] = useState<FeePayment[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [sent, setSent] = useState<SentDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [sendingKey, setSendingKey] = useState("");
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"queue" | "templates">("queue");
  const [selectedType, setSelectedType] = useState<Record<string, DocumentType>>({});
  const [selectedFiles, setSelectedFiles] = useState<Record<string, File | null>>({});
  const [editingTemplate, setEditingTemplate] = useState<DocumentType>("contract_of_sale");
  const [draft, setDraft] = useState<Template | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [orderResult, feeResult, templateResult, sentResult] = await Promise.all([
        supabase.from("orders").select("id,user_id,customer_email,customer_name,total_amount,amount_paid,balance,payment_status,items,created_at").order("created_at", { ascending: false }).limit(500),
        supabase.from("estate_documentation_payments").select("order_id,user_id,status,amount,created_at").order("created_at", { ascending: false }).limit(1000),
        supabase.from("transaction_document_templates").select("*").order("name"),
        supabase.from("transaction_documents").select("id,order_id,document_type,file_name,status,sent_at,storage_path").order("sent_at", { ascending: false }).limit(1000),
      ]);
      if (orderResult.error) throw orderResult.error;
      if (feeResult.error) throw feeResult.error;
      if (templateResult.error) throw templateResult.error;
      if (sentResult.error) throw sentResult.error;
      setOrders((orderResult.data || []) as PurchaseOrder[]);
      setFees((feeResult.data || []) as FeePayment[]);
      setTemplates((templateResult.data || []) as Template[]);
      setSent((sentResult.data || []) as SentDocument[]);
    } catch (error: any) {
      toast({ title: "Could not load documentation workflow", description: error?.message || "Check your access and try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const templateFor = (type: DocumentType) => templates.find((t) => t.document_type === type);
  useEffect(() => {
    const t = templateFor(editingTemplate);
    if (t) setDraft({ ...t });
  }, [editingTemplate, templates]);

  const enriched = useMemo(() => {
    const query = search.trim().toLowerCase();
    return orders.map((order) => {
      const items = Array.isArray(order.items) ? order.items : [];
      const propertyName = items.map((item: any) => item.property_name || item.estate_name || item.name).filter(Boolean).join(", ") || "Bridgefort Homes Property";
      const propertyAddress = items.map((item: any) => item.location || item.address || item.estate_location).filter(Boolean)[0] || "";
      const plotCount = items.reduce((sum: number, item: any) => sum + Math.max(1, Number(item.quantity || 1)), 0) || 1;
      const plotSize = items.map((item: any) => item.size || item.plot_size || item.size_sqm).filter(Boolean).join(", ") || "See purchase details";
      const total = Number(order.total_amount || 0);
      const paid = Number(order.amount_paid || 0);
      const balance = Number(order.balance ?? Math.max(total - paid, 0));
      const status = String(order.payment_status || "").toLowerCase();
      const propertyPaid = total > 0 && balance <= 0 && (paid >= total || ["paid", "completed"].includes(status));
      const feePayment = fees.find((fee) => fee.order_id === order.id && fee.user_id === order.user_id && ["approved", "paid", "completed"].includes(String(fee.status).toLowerCase()));
      const clientName = order.customer_name || "Client name unavailable";
      const clientEmail = order.customer_email || "";
      return { order, propertyName, propertyAddress, plotCount, plotSize, total, paid, balance, propertyPaid, feePayment, clientName, clientEmail, items };
    }).filter((row) => {
      if (!query) return true;
      return [row.clientName, row.clientEmail, row.propertyName, row.propertyAddress, row.order.id].some((value) => String(value || "").toLowerCase().includes(query));
    });
  }, [orders, fees, search]);

  const tokensFor = (row: (typeof enriched)[number]) => ({
    client_name: escapeHtml(row.clientName),
    client_address: "",
    client_email: escapeHtml(row.clientEmail),
    client_phone: "",
    property_name: escapeHtml(row.propertyName),
    property_address: escapeHtml(row.propertyAddress),
    plot_count: String(row.plotCount),
    plot_size: escapeHtml(row.plotSize),
    purchase_price: escapeHtml(money(row.total)),
    amount_paid: escapeHtml(money(row.paid)),
    order_reference: escapeHtml(row.order.id),
    document_date: new Date().toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric", timeZone: "Africa/Lagos" }),
  });

  const openPreview = (row: (typeof enriched)[number], type: DocumentType) => {
    const template = templateFor(type);
    if (!template) return toast({ title: "Template not found", description: "Save or restore this document template first.", variant: "destructive" });
    const tokens = tokensFor(row);
    const html = fillTemplate(template.body_html_template, tokens);
    const subject = fillTemplate(template.subject_template, tokens);
    const preview = window.open("", "_blank", "noopener,noreferrer,width=900,height=720");
    if (!preview) return toast({ title: "Preview blocked", description: "Allow pop-ups for this site to preview and print the document.", variant: "destructive" });
    preview.document.write(`<!doctype html><html><head><title>${escapeHtml(subject)}</title><meta charset="utf-8"/><style>body{font-family:Arial,sans-serif;color:#1f2937;line-height:1.65;max-width:800px;margin:40px auto;padding:24px}h1{color:#241047}p{margin:12px 0}.notice{border:1px solid #d97706;background:#fffbeb;padding:12px;margin:20px 0;font-size:12px}@media print{body{margin:0;padding:12mm}.notice{display:block}}</style></head><body>${html}<div class="notice">Review all transaction details and use the company-approved legal wording before issuing. Print or save this preview as a PDF, then attach the PDF in the admin console.</div><script>window.onload=()=>setTimeout(()=>window.print(),250);<\/script></body></html>`);
    preview.document.close();
  };

  const saveTemplate = async () => {
    if (!canManage || !draft || !draft.name.trim() || !draft.subject_template.trim() || !draft.body_html_template.trim()) return;
    setSavingTemplate(true);
    const { error } = await supabase.from("transaction_document_templates").upsert({
      document_type: draft.document_type, name: draft.name, subject_template: draft.subject_template,
      body_html_template: draft.body_html_template, enabled: draft.enabled, updated_by: user?.id || null, updated_at: new Date().toISOString(),
    }, { onConflict: "document_type" });
    setSavingTemplate(false);
    if (error) return toast({ title: "Template not saved", description: error.message, variant: "destructive" });
    toast({ title: "Template saved", description: "The latest template will be used for future document emails." });
    await load();
  };

  const sendDocument = async (row: (typeof enriched)[number]) => {
    if (!canManage) return;
    const type = selectedType[row.order.id] || "contract_of_sale";
    const doc = DOCS.find((d) => d.type === type)!;
    const file = selectedFiles[row.order.id];
    if (!row.clientEmail) return toast({ title: "Client email missing", description: "Add a valid email to the transaction record before sending.", variant: "destructive" });
    if (type === "contract_of_sale" && !row.propertyPaid) return toast({ title: "Payment not complete", description: "The Contract of Sale is locked until full property payment is confirmed.", variant: "destructive" });
    if (doc.feeGated && !row.feePayment) return toast({ title: "Documentation fee not confirmed", description: "Survey, demarcation and deed are locked until Documentation Fees payment is confirmed.", variant: "destructive" });
    if (!file || file.type !== "application/pdf" || !file.name.toLowerCase().endsWith(".pdf")) return toast({ title: "PDF required", description: "Upload the personalized PDF generated from the template preview.", variant: "destructive" });
    if (file.size > 10 * 1024 * 1024) return toast({ title: "File too large", description: "PDF files must be 10 MB or smaller.", variant: "destructive" });

    const key = `${row.order.id}:${type}`;
    setSendingKey(key);
    try {
      const storagePath = `${row.order.id}/${type}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const { error: uploadError } = await supabase.storage.from("transaction-documents").upload(storagePath, file, { contentType: "application/pdf", upsert: false });
      if (uploadError) throw uploadError;
      const { data, error } = await supabase.functions.invoke("send-transaction-document", {
        body: { order_id: row.order.id, document_type: type, storage_path: storagePath, file_name: file.name },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Email could not be sent.");
      toast({ title: "Document emailed", description: `${doc.label} was sent to ${row.clientEmail} and added to the service journey.` });
      setSelectedFiles((previous) => ({ ...previous, [row.order.id]: null }));
      await load();
    } catch (error: any) {
      toast({ title: "Document not sent", description: error?.message || "Please check the PDF and retry.", variant: "destructive" });
    } finally {
      setSendingKey("");
    }
  };

  const docsForOrder = (orderId: string) => sent.filter((d) => d.order_id === orderId);
  const sentCount = sent.filter((d) => d.status === "sent").length;
  const propertyReady = enriched.filter((row) => row.propertyPaid).length;
  const documentationReady = enriched.filter((row) => !!row.feePayment).length;

  return <div className="space-y-5 min-w-0">
    <div className="rounded-2xl bg-gradient-to-r from-[#241047] to-[#3c2362] p-5 sm:p-6 text-white shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div><div className="flex items-center gap-2 text-sm text-white/75"><ShieldCheck className="h-4 w-4"/> Payment-gated document delivery</div><h2 className="mt-2 text-2xl font-bold">Transaction Documentation</h2><p className="mt-1 max-w-2xl text-sm text-white/80">Prepare, personalize, and email transaction PDFs. Eligibility is checked again by the server before any email is sent.</p></div>
        <Button variant="secondary" onClick={() => void load()} disabled={loading} className="shrink-0 gap-2"><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}/>Refresh</Button>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3 xl:grid-cols-4">
        {[{label:"Purchase fully paid",value:propertyReady},{label:"Documentation fee paid",value:documentationReady},{label:"Documents sent",value:sentCount},{label:"Orders in view",value:enriched.length}].map((m)=><div key={m.label} className="rounded-xl border border-white/15 bg-white/10 p-3"><p className="text-xs text-white/70">{m.label}</p><p className="mt-1 text-2xl font-bold">{m.value}</p></div>)}
      </div>
    </div>

    <div className="flex flex-wrap gap-2 border-b pb-3">
      <Button variant={tab === "queue" ? "default" : "outline"} onClick={() => setTab("queue")} className="gap-2"><FileText className="h-4 w-4"/>Eligible clients & delivery</Button>
      <Button variant={tab === "templates" ? "default" : "outline"} onClick={() => setTab("templates")} className="gap-2"><Save className="h-4 w-4"/>Document templates</Button>
    </div>

    {tab === "queue" ? <div className="space-y-4">
      <div className="relative max-w-xl"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/><Input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search client, email, property or order reference..." className="pl-9"/></div>
      {loading ? <Card><CardContent className="py-12 text-center text-muted-foreground">Loading payment and documentation records…</CardContent></Card> : !enriched.length ? <Card><CardContent className="py-12 text-center"><FileText className="mx-auto h-9 w-9 text-muted-foreground"/><p className="mt-3 font-semibold">No matching purchase records</p><p className="mt-1 text-sm text-muted-foreground">Try another search or refresh the records.</p></CardContent></Card> : enriched.map((row) => {
        const currentType = selectedType[row.order.id] || "contract_of_sale";
        const selectedDoc = DOCS.find((d) => d.type === currentType)!;
        const ready = selectedDoc.feeGated ? !!row.feePayment : row.propertyPaid;
        const key = `${row.order.id}:${currentType}`;
        const history = docsForOrder(row.order.id);
        return <Card key={row.order.id} className="overflow-hidden border-slate-200 bg-white">
          <CardHeader className="pb-3"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div className="min-w-0"><CardTitle className="text-base text-slate-900">{row.clientName}</CardTitle><p className="mt-1 break-all text-sm text-slate-600">{row.clientEmail || "Client email missing"}</p><p className="mt-2 font-semibold text-slate-900">{row.propertyName}</p><p className="text-xs text-slate-600">{row.propertyAddress || "Property address not recorded"} · {row.plotCount} {row.plotCount === 1 ? "plot" : "plots"} · {row.plotSize}</p><p className="mt-2 text-xs text-slate-500">Order {row.order.id.slice(0,8)} · {new Date(row.order.created_at).toLocaleDateString("en-NG")}</p></div><div className="flex flex-wrap gap-2"><Badge variant={row.propertyPaid ? "default" : "secondary"}>{row.propertyPaid ? "Property fully paid" : `Balance ${money(row.balance)}`}</Badge><Badge variant={row.feePayment ? "default" : "outline"}>{row.feePayment ? "Documentation fee paid" : "Documentation fee pending"}</Badge></div></div></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3"><div className="rounded-lg bg-slate-50 p-3"><p className="text-xs text-slate-500">Purchase price</p><p className="mt-1 font-semibold text-slate-900">{money(row.total)}</p></div><div className="rounded-lg bg-slate-50 p-3"><p className="text-xs text-slate-500">Amount paid</p><p className="mt-1 font-semibold text-slate-900">{money(row.paid)}</p></div><div className="rounded-lg bg-slate-50 p-3"><p className="text-xs text-slate-500">Outstanding</p><p className="mt-1 font-semibold text-slate-900">{money(row.balance)}</p></div></div>
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
              <div className="space-y-2"><label className="text-sm font-medium text-slate-800">Document type</label><select value={currentType} onChange={(e)=>setSelectedType((prev)=>({...prev,[row.order.id]:e.target.value as DocumentType}))} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring">{DOCS.map((doc)=><option key={doc.type} value={doc.type}>{doc.label}</option>)}</select><p className="text-xs text-slate-500">{selectedDoc.description}</p><div className="rounded-lg border border-slate-200 p-3 text-sm">{ready ? <span className="inline-flex items-center gap-2 text-emerald-700"><CheckCircle2 className="h-4 w-4"/>Eligible for sending</span> : <span className="inline-flex items-center gap-2 text-amber-700"><Clock3 className="h-4 w-4"/>Payment requirement not met</span>}</div><Button variant="outline" onClick={()=>openPreview(row,currentType)} disabled={!templateFor(currentType)} className="w-full gap-2"><Printer className="h-4 w-4"/>Personalize & print template</Button></div>
              <div className="space-y-2"><label className="text-sm font-medium text-slate-800">Attach personalized PDF</label><Input type="file" accept="application/pdf,.pdf" onChange={(e)=>setSelectedFiles((prev)=>({...prev,[row.order.id]:e.target.files?.[0] || null}))} className="h-auto py-2 file:mr-3 file:rounded file:border-0 file:bg-muted file:px-3 file:py-1.5"/><p className="text-xs text-slate-500">Print the preview to PDF, then attach it here. PDF only, max 10 MB.</p><Button onClick={()=>void sendDocument(row)} disabled={!canManage || !ready || !selectedFiles[row.order.id] || sendingKey===key} className="w-full gap-2">{sendingKey===key ? <RefreshCw className="h-4 w-4 animate-spin"/> : <Mail className="h-4 w-4"/>}{sendingKey===key ? "Sending…" : `Send ${selectedDoc.label}`}</Button>{!canManage&&<p className="text-xs text-amber-700">You have view-only access. Ask an administrator for documentation management permission.</p>}</div>
            </div>
            {history.length > 0 && <div className="border-t pt-3"><p className="mb-2 text-sm font-semibold text-slate-800">Delivery history</p><div className="space-y-2">{history.slice(0,6).map((doc)=><div key={doc.id} className="flex flex-col gap-1 rounded-lg bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><p className="text-sm font-medium text-slate-800">{titleCase(doc.document_type)} · {doc.file_name}</p><p className="text-xs text-slate-500">{new Date(doc.sent_at).toLocaleString("en-NG")}</p></div><Badge variant={doc.status === "sent" ? "default" : "destructive"}>{doc.status}</Badge></div>)}</div></div>}
          </CardContent>
        </Card>;
      })}
    </div> : <div className="grid grid-cols-1 gap-5 xl:grid-cols-[260px_minmax(0,1fr)]">
      <Card><CardHeader><CardTitle className="text-base">Templates</CardTitle></CardHeader><CardContent className="space-y-2">{DOCS.map((doc)=>{const t=templateFor(doc.type);return <Button key={doc.type} variant={editingTemplate===doc.type?"default":"outline"} className="w-full justify-start" onClick={()=>setEditingTemplate(doc.type)}>{doc.label}{!t&&<Badge variant="destructive" className="ml-auto">Missing</Badge>}</Button>;})}</CardContent></Card>
      <Card><CardHeader><CardTitle className="text-base">Personalization template</CardTitle><p className="text-sm text-muted-foreground">Use placeholders that are replaced with each order's transaction details in the preview and email body.</p></CardHeader><CardContent className="space-y-4">
        {!canManage&&<p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">You have view-only access to templates.</p>}
        {draft ? <><div className="grid grid-cols-1 gap-3 md:grid-cols-2"><div className="space-y-1"><label className="text-sm font-medium">Template name</label><Input value={draft.name} disabled={!canManage} onChange={(e)=>setDraft({...draft,name:e.target.value})}/></div><div className="space-y-1"><label className="text-sm font-medium">Email subject</label><Input value={draft.subject_template} disabled={!canManage} onChange={(e)=>setDraft({...draft,subject_template:e.target.value})}/></div></div><div className="space-y-1"><label className="text-sm font-medium">HTML body template</label><Textarea value={draft.body_html_template} disabled={!canManage} onChange={(e)=>setDraft({...draft,body_html_template:e.target.value})} rows={14} className="font-mono text-xs"/></div><div className="rounded-lg border border-slate-200 p-3"><p className="text-sm font-semibold">Available placeholders</p><p className="mt-1 break-words text-xs text-muted-foreground">{["{{client_name}}","{{client_address}}","{{client_email}}","{{client_phone}}","{{property_name}}","{{property_address}}","{{plot_count}}","{{plot_size}}","{{purchase_price}}","{{amount_paid}}","{{order_reference}}","{{document_date}}"].join(" · ")}</p></div><div className="flex flex-wrap items-center justify-between gap-3"><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={draft.enabled} disabled={!canManage} onChange={(e)=>setDraft({...draft,enabled:e.target.checked})}/>Template enabled</label><Button onClick={()=>void saveTemplate()} disabled={!canManage||savingTemplate} className="gap-2"><Save className="h-4 w-4"/>{savingTemplate?"Saving…":"Save template"}</Button></div></> : <div className="py-10 text-center text-sm text-muted-foreground">Loading template…</div>}
      </CardContent></Card>
    </div>}
    <p className="text-xs text-muted-foreground">Privacy & controls: private PDF storage, server-side payment eligibility checks, audited send history, and a linked Customer 360 service journey. Starter legal templates must be replaced with approved company documents before issue.</p>
  </div>;
};

export default DocumentationWorkflow;
