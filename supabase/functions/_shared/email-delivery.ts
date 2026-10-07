export type TrackedEmailPayload = {
  from: string;
  to: string[];
  subject: string;
  html: string;
  text?: string;
  cc?: string[];
  bcc?: string[];
  attachments?: unknown[];
};

export async function sendTrackedEmail({
  supabase,
  resend,
  eventKey,
  recipientEmail,
  recipientUserId,
  recipientName,
  templateKey,
  sourceFunction,
  sourceReference,
  metadata = {},
  payload,
}: {
  supabase: any;
  resend: any;
  eventKey: string;
  recipientEmail: string;
  recipientUserId?: string | null;
  recipientName?: string | null;
  templateKey: string;
  sourceFunction: string;
  sourceReference?: string | null;
  metadata?: Record<string, unknown>;
  payload: TrackedEmailPayload;
}) {
  const now = new Date().toISOString();
  const { data: existing, error: existingError } = await supabase
    .from("email_delivery_events")
    .select("id,status,attempt_count,provider_message_id")
    .eq("event_key", eventKey)
    .maybeSingle();

  if (existingError) throw existingError;
  if (existing?.status === "sent") {
    return { data: { id: existing.provider_message_id }, duplicate: true };
  }

  const attemptCount = (existing?.attempt_count ?? 0) + 1;
  const { data: queued, error: queueError } = await supabase
    .from("email_delivery_events")
    .upsert({
      event_key: eventKey,
      recipient_email: recipientEmail,
      recipient_user_id: recipientUserId ?? null,
      recipient_name: recipientName ?? null,
      subject: payload.subject,
      provider: "resend",
      sender_email: payload.from.match(/<([^>]+)>/)?.[1] ?? payload.from,
      sender_name: payload.from.replace(/\s*<[^>]+>\s*$/, "").trim(),
      template_key: templateKey,
      source_function: sourceFunction,
      source_reference: sourceReference ?? eventKey,
      status: "queued",
      attempt_count: attemptCount,
      error_message: null,
      metadata,
      queued_at: existing ? undefined : now,
      updated_at: now,
    }, { onConflict: "event_key" })
    .select("id")
    .single();

  if (queueError || !queued) throw queueError ?? new Error("Failed to queue email delivery");

  try {
    const result = await resend.emails.send(payload);
    const error = result?.error;
    const providerMessageId = result?.data?.id ?? result?.id ?? null;
    const sentAt = new Date().toISOString();

    await supabase.from("email_delivery_events").update({
      status: error ? "failed" : "sent",
      provider_message_id: providerMessageId,
      error_message: error?.message ?? null,
      sent_at: error ? null : sentAt,
      updated_at: sentAt,
    }).eq("id", queued.id);

    if (!error) {
      await supabase.from("email_logs").insert({
        recipient_email: recipientEmail,
        recipient_name: recipientName ?? null,
        subject: payload.subject,
        body: payload.text ?? "",
        status: "sent",
        sent_at: sentAt,
        created_at: sentAt,
      });
    }

    return { data: providerMessageId ? { id: providerMessageId } : null, error };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown email delivery error";
    await supabase.from("email_delivery_events").update({
      status: "failed",
      error_message: message.slice(0, 2000),
      updated_at: new Date().toISOString(),
    }).eq("id", queued.id);
    throw error;
  }
}
