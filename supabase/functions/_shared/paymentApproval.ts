/* eslint-disable @typescript-eslint/no-explicit-any */
// Shared helper: after a gateway confirms a successful checkout charge,
// record the gateway event and create one pending approval request. The
// database trigger owns the linked order/payment/documentation state change.

export async function queueOrderForApproval(
  admin: any,
  opts: { reference: string; paidAmount: number; channel: string }
) {
  const { reference, paidAmount, channel } = opts;
  if (!reference) return;

  const { data: order, error: orderError } = await admin
    .from("orders")
    .select("id, user_id, items, total_amount, payment_status, customer_name")
    .eq("payment_reference", reference)
    .maybeSingle();
  if (orderError || !order) return;

  const amount = paidAmount > 0 ? paidAmount : Number(order.total_amount ?? 0);
  if (amount <= 0) return;

  // Immutable, idempotent gateway history. The order total remains the
  // authoritative NGN amount; this row records what the gateway confirmed.
  const gateway = channel === "Stripe" ? "Stripe" : channel === "Paystack" ? "Paystack" : "Manual";
  const { error: historyError } = await admin.from("payment_gateway_events").upsert({
    gateway,
    reference,
    order_id: order.id,
    user_id: order.user_id,
    amount,
    currency: "NGN",
    status: "success",
    metadata: { channel, order_total: Number(order.total_amount ?? 0) },
  }, { onConflict: "gateway,reference", ignoreDuplicates: true });
  if (historyError) console.error("Could not record gateway payment history:", historyError);

  const { data: existingRequest } = await admin
    .from("payment_requests")
    .select("id, status")
    .eq("reference", reference)
    .maybeSingle();
  if (existingRequest) return;

  const settled = ["awaiting_approval", "paid", "approved", "rejected"];
  if (settled.includes(String(order.payment_status ?? ""))) return;

  const items: any[] = Array.isArray(order.items) ? order.items : [];
  const types = items.map((i) => String(i?.property_type ?? ""));
  const requestType = types.some((t) => t.startsWith("Documentation"))
    ? "documentation"
    : types.some((t) => t === "Agrovest") ? "agrovest" : "property";
  const label = items
    .map((i) => `${i?.property_name ?? "Item"}${i?.quantity > 1 ? ` x${i.quantity}` : ""}`)
    .join(", ")
    .slice(0, 300);

  const { data: plan } = await admin.from("payments").select("id").eq("reference", reference).maybeSingle();
  const { error: insertError } = await admin.from("payment_requests").insert({
    user_id: order.user_id,
    type: requestType,
    amount,
    reference,
    related_payment_id: plan?.id ?? null,
    description: `${requestType === "documentation" ? "Documentation fee" : requestType === "agrovest" ? "Agrovest" : "Property"} payment via ${channel} — ${label || "checkout"}`,
    status: "pending",
  });
  if (insertError) {
    console.error("Could not queue payment for approval:", insertError);
    return;
  }

  await admin.from("notifications").insert({
    user_id: order.user_id,
    audience: "user",
    type: "payment_status",
    title: "Payment received — awaiting approval",
    message: `We received your payment of ₦${Number(amount).toLocaleString()}. It is now awaiting admin approval.`,
    link: "/dashboard",
  });
}
