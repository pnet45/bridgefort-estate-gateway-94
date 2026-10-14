import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.0";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { PDFDocument, StandardFonts, rgb } from "https://esm.sh/pdf-lib@1.17.1";
import { bridgefortEmail } from "../_shared/email-template.ts";
import { sendTrackedEmail } from "../_shared/email-delivery.ts";

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...headers, "Content-Type": "application/json" } });
const money = (v: unknown) => new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(Number(v || 0));
const escapeHtml = (v: unknown) => String(v ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
const replaceTokens = (s: string, t: Record<string,string>) => s.replace(/{{\s*([a-zA-Z0-9_]+)\s*}}/g, (_m,k) => t[k] ?? "");

const small = ["zero","one","two","three","four","five","six","seven","eight","nine","ten","eleven","twelve","thirteen","fourteen","fifteen","sixteen","seventeen","eighteen","nineteen"];
const tens = ["","","twenty","thirty","forty","fifty","sixty","seventy","eighty","ninety"];
function numberWords(n: number): string {
  if (!Number.isFinite(n) || n < 0 || n > 999999999999) return String(n);
  n = Math.floor(n);
  if (n < 20) return small[n];
  if (n < 100) return tens[Math.floor(n/10)] + (n%10 ? "-" + small[n%10] : "");
  if (n < 1000) return small[Math.floor(n/100)] + " hundred" + (n%100 ? " and " + numberWords(n%100) : "");
  for (const [size,label] of [[1e9,"billion"],[1e6,"million"],[1e3,"thousand"]] as [number,string][]) {
    if (n >= size) return numberWords(Math.floor(n/size)) + " " + label + (n%size ? " " + numberWords(n%size) : "");
  }
  return String(n);
}
function htmlToText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|h[1-6]|li|tr|section|article)>/gi, "\n\n")
    .replace(/<li\b[^>]*>/gi, "• ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&").replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">").replace(/&quot;/gi, '"').replace(/&#39;|&apos;/gi, "'")
    .replace(/&#(\d+);/g, (_m, n) => String.fromCodePoint(Number(n)))
    .replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/[–—]/g, "-")
    .replace(/\u00a0/g, " ").replace(/[ \t]+/g, " ")
    .replace(/ *\n */g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}
async function renderPdf(text: string, propertyName: string): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const pageSize: [number, number] = [595.28, 841.89];
  const margin = 48, fontSize = 9.25, lineHeight = 13;
  let page = pdf.addPage(pageSize);
  let y = pageSize[1] - margin;
  const addPage = () => { page = pdf.addPage(pageSize); y = pageSize[1] - margin; };
  page.drawText("BRIDGEFORT HOMES DEVELOPMENT LTD", { x: margin, y, size: 10, font: bold, color: rgb(0.15,0.08,0.28) });
  y -= 18;
  page.drawText(propertyName.slice(0,90), { x: margin, y, size: 8, font: regular, color: rgb(0.38,0.38,0.38) });
  y -= 22;
  page.drawLine({ start: {x: margin, y}, end: {x: pageSize[0]-margin, y}, thickness: 1.4, color: rgb(0.72,0.54,0.17) });
  y -= 22;
  const paragraphs = text.split(/\n\s*\n/);
  for (const para of paragraphs) {
    const p = para.trim();
    if (!p) continue;
    const isHeading = p.length < 75 && (/^(CONTRACT OF SALE|DEED OF ASSIGNMENT|[0-9]+\.|WHEREAS|NOW THIS|SCHEDULE|THE ASSIGNOR|THE ASSIGNEE|IN WITNESS|COMMON SEAL|SIGNED, SEALED|TRANSACTION SUMMARY)/i.test(p));
    const font = isHeading ? bold : regular;
    const size = isHeading ? 10 : fontSize;
    const maxWidth = pageSize[0] - margin*2;
    const words = p.split(/\s+/);
    let line = "";
    const lines: string[] = [];
    for (const word of words) {
      const candidate = line ? line + " " + word : word;
      if (font.widthOfTextAtSize(candidate, size) > maxWidth && line) { lines.push(line); line = word; }
      else line = candidate;
    }
    if (line) lines.push(line);
    if (y - lines.length * lineHeight < margin + 18) addPage();
    for (const l of lines) {
      if (y < margin + 18) addPage();
      page.drawText(l, { x: margin, y, size, font, color: rgb(0.12,0.12,0.12), maxWidth });
      y -= lineHeight;
    }
    y -= isHeading ? 5 : 7;
  }
  const pages = pdf.getPages();
  pages.forEach((p, i) => {
    p.drawLine({ start:{x:margin,y:28}, end:{x:pageSize[0]-margin,y:28}, thickness:0.5, color:rgb(0.82,0.82,0.82) });
    p.drawText("Bridgefort Homes Development Ltd  |  Transaction document", {x:margin,y:15,size:7,font:regular,color:rgb(0.4,0.4,0.4)});
    p.drawText("Page " + (i+1) + " of " + pages.length, {x:pageSize[0]-margin-55,y:15,size:7,font:regular,color:rgb(0.4,0.4,0.4)});
  });
  return await pdf.save();
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  let admin: any = null;
  let orderId = "";
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return json({ error: "Authentication required" }, 401);
    const url = Deno.env.get("SUPABASE_URL") || "";
    const anon = Deno.env.get("SUPABASE_ANON_KEY") || "";
    const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const auth = createClient(url, anon, { global: { headers: { Authorization: authHeader } } });
    const { data: authData, error: authError } = await auth.auth.getUser(authHeader.slice(7));
    if (authError || !authData.user) return json({ error: "Authentication required" }, 401);
    const caller = authData.user.id;
    admin = createClient(url, service, { auth: { persistSession: false, autoRefreshToken: false } });
    const [approvePermission, allPermission] = await Promise.all([
      admin.rpc("admin_has_permission", { _permission: "admin:approve_payments", _user_id: caller }),
      admin.rpc("admin_has_permission", { _permission: "admin:all", _user_id: caller }),
    ]);
    if (!(approvePermission.data || allPermission.data)) return json({ error: "Payment approval permission is required." }, 403);

    const { payment_request_id } = await req.json();
    if (!payment_request_id || typeof payment_request_id !== "string") return json({ error: "payment_request_id is required." }, 400);
    const { data: request, error: requestError } = await admin.from("payment_requests")
      .select("id,user_id,type,reference,status,description").eq("id", payment_request_id).maybeSingle();
    if (requestError) throw requestError;
    if (!request || request.status !== "approved") return json({ success: false, skipped: true, reason: "Payment request is not approved." });
    if (String(request.type).toLowerCase() !== "property") return json({ success: true, skipped: true, reason: "Not a property purchase payment." });
    if (!request.reference) return json({ success: true, skipped: true, reason: "Payment request has no gateway reference." });

    const { data: gatewayEvent } = await admin.from("payment_gateway_events")
      .select("order_id,user_id,status").eq("reference", request.reference).maybeSingle();
    orderId = String(gatewayEvent?.order_id || "");
    if (!orderId) {
      const { data: byRef } = await admin.from("orders").select("id,user_id").eq("payment_reference", request.reference).maybeSingle();
      orderId = String(byRef?.id || "");
    }
    if (!orderId) return json({ success: true, skipped: true, reason: "No purchase order is linked to this payment." });
    if (gatewayEvent?.user_id && gatewayEvent.user_id !== request.user_id) return json({ error: "Payment/order ownership mismatch." }, 409);

    const { data: order, error: orderError } = await admin.from("orders")
      .select("id,user_id,customer_email,customer_name,total_amount,amount_paid,balance,payment_status,items,created_at")
      .eq("id", orderId).maybeSingle();
    if (orderError) throw orderError;
    if (!order || order.user_id !== request.user_id) return json({ error: "Purchase order not found for this client." }, 404);
    const total = Number(order.total_amount || 0), paid = Number(order.amount_paid || 0);
    const balance = Number(order.balance ?? Math.max(total-paid,0));
    if (!(total > 0 && paid >= total && balance <= 0 && ["paid","completed"].includes(String(order.payment_status||"").toLowerCase()))) {
      return json({ success: true, skipped: true, reason: "The order is not fully paid and confirmed; no Contract of Sale was sent." });
    }

    const { data: existing } = await admin.from("transaction_documents")
      .select("id,status").eq("order_id", orderId).eq("document_type","contract_of_sale").eq("status","sent").limit(1).maybeSingle();
    if (existing) return json({ success: true, already_sent: true, reason: "A Contract of Sale has already been recorded for this order." });

    const { data: claim, error: claimError } = await admin.from("transaction_document_auto_send_claims")
      .insert({ order_id: orderId, status: "processing", attempts: 1, updated_at: new Date().toISOString() }).select("order_id").maybeSingle();
    if (claimError || !claim) {
      const { data: oldClaim } = await admin.from("transaction_document_auto_send_claims").select("status,updated_at,attempts").eq("order_id",orderId).maybeSingle();
      if (oldClaim?.status === "sent" || (oldClaim?.status === "processing" && Date.now()-new Date(oldClaim.updated_at).getTime() < 10*60*1000)) {
        return json({ success: true, skipped: true, reason: "Automatic Contract of Sale delivery is already being processed or was sent." });
      }
      const { data: retry } = await admin.from("transaction_document_auto_send_claims").update({
        status:"processing", attempts:Number(oldClaim?.attempts||0)+1, last_error:null, updated_at:new Date().toISOString()
      }).eq("order_id",orderId).eq("status","failed").select("order_id").maybeSingle();
      if (!retry) return json({ success: true, skipped: true, reason: "Automatic delivery is already claimed; refresh the documentation queue if it needs attention." });
    }

    const { data: template, error: templateError } = await admin.from("transaction_document_templates")
      .select("name,subject_template,body_html_template,enabled").eq("document_type","contract_of_sale").maybeSingle();
    if (templateError) throw templateError;
    if (!template?.enabled) throw Object.assign(new Error("The Contract of Sale template is disabled. Legal counsel must approve and enable it before automatic delivery."), { status: 409 });
    if (/\[(?:TO BE CONFIRMED|ESTATE-SPECIFIC|CURRENT APPROVED|VERIFY|INSERT AND VERIFY|SURVEY COORDINATES)/i.test(template.body_html_template)) {
      throw Object.assign(new Error("The legal template still contains unresolved review fields. Complete and approve those fields before sending."), { status: 409 });
    }

    const items = Array.isArray(order.items) ? order.items : [];
    const names = items.map((i:any)=>i.property_name||i.estate_name||i.name).filter(Boolean);
    const propertyName = names.join(", ") || "Bridgefort Homes Property";
    const locations = items.map((i:any)=>i.location||i.address||i.estate_location).filter(Boolean);
    const propertyAddress = locations[0] || "";
    const quantities = items.reduce((sum:number,i:any)=>sum+Math.max(1,Number(i.quantity||1)),0) || 1;
    const sizes = items.map((i:any)=>i.size||i.plot_size||i.size_sqm).filter(Boolean);
    const plotSize = sizes.join(", ") || "As specified in the approved purchase/allocation record";
    const { data: profile } = await admin.from("profiles").select("first_name,last_name,address,current_residence,phone_number").eq("id",order.user_id).maybeSingle();
    const { data: account } = await admin.from("users").select("email").eq("id",order.user_id).maybeSingle();
    const recipient = String(order.customer_email || account?.email || "").trim();
    if (!recipient || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient)) throw new Error("Client email is missing or invalid; Contract of Sale was not sent.");
    const clientName = String(order.customer_name || [profile?.first_name,profile?.last_name].filter(Boolean).join(" ") || "Purchaser");
    const tokens: Record<string,string> = {
      client_name:escapeHtml(clientName), client_address:escapeHtml(profile?.address||profile?.current_residence||""),
      client_email:escapeHtml(recipient), client_phone:escapeHtml(profile?.phone_number||""),
      property_name:escapeHtml(propertyName), property_address:escapeHtml(propertyAddress),
      plot_count:String(quantities), plot_count_words:numberWords(quantities), plot_size:escapeHtml(plotSize),
      purchase_price:escapeHtml(money(total)), purchase_price_words:numberWords(total),
      amount_paid:escapeHtml(money(paid)), order_reference:escapeHtml(order.id),
      document_date:new Date().toLocaleDateString("en-NG",{day:"numeric",month:"long",year:"numeric",timeZone:"Africa/Lagos"}),
    };
    const html = replaceTokens(template.body_html_template,tokens);
    const plainText = htmlToText(html);
    const pdfBytes = await renderPdf(plainText, propertyName);
    const fileName = "Contract-of-Sale-" + order.id.slice(0,8) + ".pdf";
    const storagePath = order.id + "/contract_of_sale/auto-" + Date.now() + "-" + fileName;
    const { error: uploadError } = await admin.storage.from("transaction-documents").upload(storagePath,pdfBytes,{contentType:"application/pdf",upsert:false});
    if (uploadError) throw uploadError;
    const base64 = btoa(Array.from(pdfBytes,b=>String.fromCharCode(b)).join(""));
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) throw new Error("Email delivery is not configured.");
    const resend = new Resend(resendKey);
    const subject = replaceTokens(template.subject_template,tokens);
    const emailHtml = bridgefortEmail(`<h1>Contract of Sale</h1><p>Dear ${escapeHtml(clientName)},</p><p>Your payment for <strong>${escapeHtml(propertyName)}</strong> has been confirmed as complete. Please find your personalized Contract of Sale attached as a PDF.</p><p>Estate: ${escapeHtml(propertyName)}<br/>Location: ${escapeHtml(propertyAddress)}<br/>Plots: ${quantities}<br/>Plot size: ${escapeHtml(plotSize)}<br/>Total purchase price: ${escapeHtml(money(total))}<br/>Amount paid: ${escapeHtml(money(paid))}</p><p>Please review the attached document and contact Bridgefort Homes Development Ltd if any transaction detail requires correction.</p><p>Kind regards,<br/>Bridgefort Homes Development Ltd</p>`);
    const send = await sendTrackedEmail({
      supabase:admin,resend,eventKey:"auto_contract_of_sale:"+orderId,recipientEmail:recipient,recipientUserId:order.user_id,
      recipientName:clientName,templateKey:"auto_contract_of_sale",sourceFunction:"auto-send-contract-of-sale",sourceReference:orderId,
      metadata:{order_id:orderId,document_type:"contract_of_sale",storage_path:storagePath,file_name:fileName,trigger_payment_request_id:payment_request_id},
      payload:{from:"Bridgefort Homes Development Ltd <info@bridgeforthomes.com>",to:[recipient],subject,html:emailHtml,text:`Dear ${clientName}, your Contract of Sale for ${propertyName} is attached as a PDF.`,attachments:[{filename:fileName,content:base64,contentType:"application/pdf"}]},
    });
    if (send.error) throw new Error(send.error.message || "Email provider rejected the message.");
    const sentAt = new Date().toISOString();
    const { error: recordError } = await admin.from("transaction_documents").insert({
      order_id:orderId,user_id:order.user_id,document_type:"contract_of_sale",storage_path:storagePath,file_name:fileName,
      status:"sent",sent_by:caller,sent_at:sentAt,provider_message_id:send.data?.id||null,
    });
    if (recordError) throw recordError;
    await admin.from("transaction_document_auto_send_claims").update({status:"sent",last_error:null,updated_at:sentAt,sent_at:sentAt}).eq("order_id",orderId);
    const { data: journey } = await admin.from("service_journeys").select("id,notes").eq("order_id",orderId).eq("service_type","DOCUMENTATION").limit(1).maybeSingle();
    const note = sentAt + " — automatically emailed Contract of Sale to " + recipient + " after final payment approval.";
    if (journey) await admin.from("service_journeys").update({status:"IN_PROGRESS",outcome:"Contract of Sale sent",notes:[journey.notes,note].filter(Boolean).join("\n"),updated_at:sentAt}).eq("id",journey.id);
    else await admin.from("service_journeys").insert({customer_id:order.user_id,service_type:"DOCUMENTATION",status:"IN_PROGRESS",priority:"NORMAL",source:"automatic_contract_delivery",order_id:orderId,source_record_type:"order",source_record_id:orderId,outcome:"Contract of Sale sent",notes:note,created_at:sentAt,updated_at:sentAt});
    return json({success:true,document_type:"contract_of_sale",recipient,file_name:fileName,message_id:send.data?.id||null});
  } catch (error:any) {
    console.error("auto-send-contract-of-sale failed",error);
    if (admin && orderId) await admin.from("transaction_document_auto_send_claims").update({status:"failed",last_error:String(error?.message||"Unknown error").slice(0,1000),updated_at:new Date().toISOString()}).eq("order_id",orderId);
    return json({success:false,error:error?.message||"Automatic Contract of Sale delivery failed."},error?.status||500);
  }
});
