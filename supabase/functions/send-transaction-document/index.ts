import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.0";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { bridgefortEmail } from "../_shared/email-template.ts";
import { sendTrackedEmail } from "../_shared/email-delivery.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const allowedTypes = new Set(["contract_of_sale", "survey_plan", "plot_demarcation", "deed_of_assignment"]);
const money = (value: unknown) => new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(Number(value || 0));
const escapeHtml = (value: unknown) => String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
const replaceTokens = (template: string, tokens: Record<string, string>) => template.replace(/{{\s*([a-zA-Z0-9_]+)\s*}}/g, (_match, key) => tokens[key] ?? "");
const sanitizeTemplateHtml = (value: string) => value.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "").replace(/<\/?(?:iframe|object|embed|form|base|meta)\b[^>]*>/gi, "").replace(/\son\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "").replace(/\s(href|src|xlink:href)\s*=\s*(?:"\s*javascript:[^"]*"|'\s*javascript:[^']*'|javascript:[^\s>]+)/gi, ' $1="#"');

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) throw Object.assign(new Error("Unauthorized"), { status: 401 });
    const url = Deno.env.get("SUPABASE_URL")!;
    const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const token = authHeader.slice(7);
    const userClient = createClient(url, anon, { global: { headers: { Authorization: authHeader } } });
    const { data: authData, error: authError } = await userClient.auth.getUser(token);
    if (authError || !authData.user) throw Object.assign(new Error("Unauthorized"), { status: 401 });
    const userId = authData.user.id;
    const admin = createClient(url, serviceKey);
    const { data: allowed, error: permissionError } = await admin.rpc("admin_has_permission", {
      _permission: "admin:manage_documentation",
      _user_id: userId,
    });
    if (permissionError || !allowed) throw Object.assign(new Error("You do not have permission to send transaction documents."), { status: 403 });

    const input = await req.json();
    const orderId = String(input.order_id || "");
    const documentType = String(input.document_type || "");
    const storagePath = String(input.storage_path || "");
    const fileName = String(input.file_name || "transaction-document.pdf");
    if (!orderId || !allowedTypes.has(documentType) || !storagePath.startsWith(`${orderId}/`) || !fileName.toLowerCase().endsWith(".pdf")) {
      throw Object.assign(new Error("A valid order, document type and uploaded PDF are required."), { status: 400 });
    }

    // Fail closed: Contract of Sale and Deed of Assignment email delivery stays OFF until
    // an authorized administrator enables it under Admin Email Center > Automations.
    if (documentType === "contract_of_sale" || documentType === "deed_of_assignment") {
      const { data: deliveryControl, error: deliveryControlError } = await admin
        .from("transaction_document_automation_controls")
        .select("enabled")
        .eq("document_type", documentType)
        .maybeSingle();
      if (deliveryControlError) throw deliveryControlError;
      if (deliveryControl?.enabled !== true) {
        throw Object.assign(new Error(`${documentType === "contract_of_sale" ? "Contract of Sale" : "Deed of Assignment"} email delivery is switched off in Admin Automations. No email was sent.`), { status: 409 });
      }
    }

    const { data: order, error: orderError } = await admin.from("orders")
      .select("id,user_id,customer_email,customer_name,total_amount,amount_paid,balance,payment_status,items,created_at")
      .eq("id", orderId).maybeSingle();
    if (orderError) throw orderError;
    if (!order) throw Object.assign(new Error("Purchase record not found."), { status: 404 });

    const status = String(order.payment_status || "").toLowerCase();
    const total = Number(order.total_amount || 0);
    const paid = Number(order.amount_paid || 0);
    const balance = Number(order.balance ?? Math.max(total - paid, 0));
    const propertyPaid = total > 0 && balance <= 0 && paid >= total && ["paid", "completed"].includes(status);
    if (documentType === "contract_of_sale" && !propertyPaid) {
      throw Object.assign(new Error("Contract of Sale can only be sent after the property payment is fully confirmed."), { status: 409 });
    }

    if (documentType !== "contract_of_sale") {
      const { data: docPayments, error: docPaymentError } = await admin.from("estate_documentation_payments")
        .select("id,status,amount,total_bundle_amount,order_id,user_id")
        .eq("order_id", orderId).eq("user_id", order.user_id).in("status", ["approved", "paid", "completed"])
        .order("created_at", { ascending: false }).limit(10);
      if (docPaymentError) throw docPaymentError;
      const confirmedFullFeePayment = (docPayments || []).some((payment: any) => Number(payment.amount || 0) > 0 && Number(payment.total_bundle_amount || 0) > 0 && Number(payment.amount || 0) >= Number(payment.total_bundle_amount || 0));
      if (!confirmedFullFeePayment) {
        throw Object.assign(new Error("Survey, plot demarcation and Deed of Assignment can only be sent after the Documentation Fees payment is confirmed."), { status: 409 });
      }
    }

    const { data: storedFile, error: fileError } = await admin.storage.from("transaction-documents").download(storagePath);
    if (fileError || !storedFile) throw Object.assign(new Error("The uploaded PDF could not be retrieved. Please upload it again."), { status: 400 });
    if (storedFile.size > 10 * 1024 * 1024) throw Object.assign(new Error("PDF exceeds the 10 MB limit."), { status: 413 });
    const bytes = new Uint8Array(await storedFile.arrayBuffer());
    const base64 = btoa(Array.from(bytes, (byte) => String.fromCharCode(byte)).join(""));
    const prefix = new Uint8Array(bytes.slice(0, 5));
    if (new TextDecoder().decode(prefix) !== "%PDF-") throw Object.assign(new Error("The attachment is not a valid PDF file."), { status: 400 });

    const items = Array.isArray(order.items) ? order.items : [];
    const firstItem = items[0] || {};
    const itemNames = items.map((item: any) => item.property_name || item.estate_name || item.name).filter(Boolean);
    const propertyName = itemNames.join(", ") || "Bridgefort Homes Property";
    const quantities = items.reduce((sum: number, item: any) => sum + Math.max(1, Number(item.quantity || 1)), 0) || 1;
    const sizes = items.map((item: any) => item.size || item.plot_size || item.size_sqm).filter(Boolean);
    const location = items.map((item: any) => item.location || item.address || item.estate_location).filter(Boolean)[0] || "";
    const { data: profile } = await admin.from("profiles")
      .select("first_name,last_name,address,current_residence,phone_number")
      .eq("id", order.user_id).maybeSingle();
    const { data: account } = await admin.from("users").select("email").eq("id", order.user_id).maybeSingle();
    const recipient = String(order.customer_email || account?.email || "").trim();
    if (!recipient || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient)) {
      throw Object.assign(new Error("This client's email address is missing or invalid. Update the client record before sending."), { status: 409 });
    }
    const clientName = String(order.customer_name || [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || "Valued Client");
    const { data: template, error: templateError } = await admin.from("transaction_document_templates")
      .select("name,subject_template,body_html_template,enabled").eq("document_type", documentType).maybeSingle();
    if (templateError) throw templateError;
    if (!template?.enabled) throw Object.assign(new Error("This document template is not available."), { status: 409 });
    if (["contract_of_sale", "deed_of_assignment"].includes(documentType) && (
      /legal review required/i.test(String(template.name || "")) ||
      /\[(?:TO BE CONFIRMED|ESTATE-SPECIFIC|CURRENT APPROVED|VERIFY|INSERT AND VERIFY|SURVEY COORDINATES)/i.test(String(template.body_html_template || ""))
    )) {
      throw Object.assign(new Error("This legal template still requires counsel review. Complete the legal fields and rename it to an approved template before sending."), { status: 409 });
    }

    const tokens: Record<string, string> = {
      client_name: escapeHtml(clientName),
      client_address: escapeHtml(profile?.address || profile?.current_residence || ""),
      client_email: escapeHtml(recipient),
      client_phone: escapeHtml(profile?.phone_number || ""),
      property_name: escapeHtml(propertyName),
      property_address: escapeHtml(location || firstItem.address || ""),
      plot_count: String(quantities),
      plot_size: escapeHtml(sizes.join(", ") || "As specified in the attached document"),
      purchase_price: escapeHtml(money(order.total_amount)),
      amount_paid: escapeHtml(money(order.amount_paid)),
      order_reference: escapeHtml(order.id),
      document_date: new Date().toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric", timeZone: "Africa/Lagos" }),
    };
    const subject = replaceTokens(template.subject_template, tokens);
    const html = bridgefortEmail(sanitizeTemplateHtml(replaceTokens(template.body_html_template, tokens)));
    const text = html.replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) throw Object.assign(new Error("Email delivery is not configured."), { status: 503 });
    const resend = new Resend(resendKey);
    const sendResult = await sendTrackedEmail({
      supabase: admin, resend,
      eventKey: `transaction_document:${orderId}:${documentType}:${crypto.randomUUID()}`,
      recipientEmail: recipient, recipientUserId: order.user_id, recipientName: clientName,
      templateKey: `transaction_document_${documentType}`, sourceFunction: "send-transaction-document",
      sourceReference: orderId,
      metadata: { order_id: orderId, document_type: documentType, storage_path: storagePath, file_name: fileName, sent_by: userId },
      payload: {
        from: "Bridgefort Homes Development Ltd <info@bridgeforthomes.com>",
        to: [recipient], subject, html, text,
        attachments: [{ filename: fileName, content: base64, contentType: "application/pdf" }],
      },
    });
    if (sendResult.error) throw new Error(sendResult.error.message || "The email provider rejected the message.");

    const sentAt = new Date().toISOString();
    const { error: recordError } = await admin.from("transaction_documents").insert({
      order_id: orderId, user_id: order.user_id, document_type: documentType,
      storage_path: storagePath, file_name: fileName, status: "sent", sent_by: userId,
      sent_at: sentAt, provider_message_id: sendResult.data?.id || null,
    });
    if (recordError) console.error("Document email sent but delivery history could not be recorded:", recordError);

    const { data: sentRows } = await admin.from("transaction_documents").select("document_type").eq("order_id", orderId).eq("status", "sent");
    const requiredTypes = ["contract_of_sale", "survey_plan", "plot_demarcation", "deed_of_assignment"];
    const journeyComplete = requiredTypes.every((type) => (sentRows || []).some((row: any) => row.document_type === type));
    const { data: journey } = await admin.from("service_journeys").select("id,notes")
      .eq("order_id", orderId).eq("service_type", "DOCUMENTATION").limit(1).maybeSingle();
    const journeyNote = `${new Date(sentAt).toLocaleString("en-NG")} — sent ${template.name} to ${recipient} (order ${orderId}).`;
    if (journey) {
      await admin.from("service_journeys").update({
        status: journeyComplete ? "COMPLETED" : "IN_PROGRESS",
        outcome: journeyComplete ? "All transaction documents sent" : `Sent ${template.name}`,
        notes: [journey.notes, journeyNote].filter(Boolean).join("\\n"),
        updated_at: sentAt,
      }).eq("id", journey.id);
    } else {
      await admin.from("service_journeys").insert({
        customer_id: order.user_id, service_type: "DOCUMENTATION", status: journeyComplete ? "COMPLETED" : "IN_PROGRESS", priority: "NORMAL",
        source: "admin_documentation", order_id: orderId, source_record_type: "order", source_record_id: orderId,
        outcome: journeyComplete ? "All transaction documents sent" : `Sent ${template.name}`,
        notes: journeyNote, created_at: sentAt, updated_at: sentAt,
      });
    }

    return new Response(JSON.stringify({ success: true, recipient, document_type: documentType, message_id: sendResult.data?.id || null }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("send-transaction-document failed:", error);
    return new Response(JSON.stringify({ success: false, error: error?.message || "Unable to send transaction document." }), {
      status: error?.status || 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
