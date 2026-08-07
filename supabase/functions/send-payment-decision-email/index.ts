/* eslint-disable @typescript-eslint/no-explicit-any */
// Sends the client an email when an admin approves or rejects their payment
// request. Admin-only: the caller's JWT must carry the `admin` role.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const authed = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await authed.auth.getUser(token);
    if (userError || !userData?.user) return json({ error: "Unauthorized" }, 401);

    const admin = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: isAdmin } = await admin.rpc("has_role", {
      _user_id: userData.user.id,
      _role: "admin",
    });
    if (!isAdmin) return json({ error: "Forbidden" }, 403);

    const { payment_request_id, status, reason } = await req.json().catch(() => ({}));
    if (!payment_request_id || !["approved", "rejected"].includes(String(status))) {
      return json({ error: "payment_request_id and a valid status are required" }, 400);
    }

    const { data: reqRow } = await admin
      .from("payment_requests")
      .select("id, user_id, amount, type, reference, description")
      .eq("id", payment_request_id)
      .maybeSingle();
    if (!reqRow) return json({ error: "Payment request not found" }, 404);

    const { data: authUser } = await admin.auth.admin.getUserById(reqRow.user_id);
    const email = authUser?.user?.email;
    if (!email) return json({ ok: false, skipped: "no email on file" });

    const { data: profile } = await admin
      .from("profiles")
      .select("first_name")
      .eq("id", reqRow.user_id)
      .maybeSingle();

    const approved = status === "approved";
    const amount = `₦${Number(reqRow.amount ?? 0).toLocaleString()}`;
    const label = String(reqRow.type ?? "payment").replace(/_/g, " ");

    const html = `
      <div style="font-family:Arial,Helvetica,sans-serif;background:#ffffff;padding:24px;color:#1f2937">
        <h2 style="color:${approved ? "#15803d" : "#b91c1c"};margin:0 0 12px">
          Payment ${approved ? "Approved" : "Rejected"}
        </h2>
        <p>Hello ${profile?.first_name || "there"},</p>
        <p>Your ${label} payment of <strong>${amount}</strong> has been
        <strong>${approved ? "approved" : "rejected"}</strong>.</p>
        ${reqRow.description ? `<p style="color:#4b5563">${reqRow.description}</p>` : ""}
        ${reqRow.reference ? `<p style="color:#6b7280;font-size:13px">Reference: ${reqRow.reference}</p>` : ""}
        ${reason ? `<p style="background:#f3f4f6;padding:12px;border-radius:8px"><strong>Note from our team:</strong><br/>${String(reason).slice(0, 800)}</p>` : ""}
        <p>${approved
          ? "Your dashboard has been updated and you can now proceed with the next steps."
          : "Please review the note above or contact our support team for assistance."}</p>
        <p style="margin-top:24px;color:#6b7280;font-size:13px">Bridgefort Homes</p>
      </div>`;

    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    const sent = await resend.emails.send({
      from: "Bridgefort Homes <noreply@bridgeforthomes.com>",
      to: [email],
      subject: `Payment ${approved ? "approved" : "rejected"} — ${amount}`,
      html,
    });

    if ((sent as any)?.error) {
      console.error("Resend error", (sent as any).error);
      return json({ ok: false, error: (sent as any).error?.message ?? "Email send failed" }, 502);
    }

    return json({ ok: true });
  } catch (e) {
    console.error("send-payment-decision-email failed", e);
    return json({ error: (e as Error).message }, 500);
  }
});
