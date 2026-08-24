/* eslint-disable @typescript-eslint/no-explicit-any */

// Queue a successful gateway payment for Admin approval. For installment
// payments the gateway reference is unique per payment, so orderId is used to
// resolve the original order instead of assuming the gateway reference equals
// orders.payment_reference.
export async function queueOrderForApproval(
  admin: any,
  opts: { reference: string; orderId?: string; paidAmount: number; channel: string }
) {
  const { reference, orderId, paidAmount, channel } = opts;
  if (!reference || paidAmount <= 0) return;

  let orderQuery = admin
    .from("orders")
    .select("id, user_id, items, total_amount, amount_paid, balance, payment_status, customer_name")
    .limit(1);

  let order: any = null;
  if (orderId) {
    const { data } = await orderQuery.eq("id", orderId).maybeSingle();
    order = data;
  } else {
    const { data } = await orderQuery.eq("payment_reference", reference).maybeSingle();
    order = data;
  }
  if (!order) return;

  const outstanding = Math.max(0, Number(order.total_amount ?? 0) - Number(order.amount_paid ?? 0));
  if (paidAmount > outstanding + 1) {
    console.error("Gateway payment exceeds order balance", { reference, orderId: order.id, paidAmount, outstanding });
    return;
  }

  const amount = paidAmount;
  const gateway = channel === "Stripe" ? "Stripe" : channel === "Paystack" ? "Paystack" : "Manual";
  const { error: historyError } = await admin.from("payment_gateway_events").upsert({
    gateway,
    reference,
    order_id: order.id,
    user_id: order.user_id,
    amount,
    currency: "NGN",
    status: "success",
    metadata: { channel, order_total: Number(order.total_amount ?? 0), order_id: order.id, installment: amount < Number(order.total_amount ?? 0) },
  }, { onConflict: "gateway,reference", ignoreDuplicates: true });
  if (historyError) console.error("Could not record gateway payment history:", historyError);

  const { data: existingRequest } = await admin
    .from("payment_requests")
    .select("id, status")
    .eq("reference", reference)
    .maybeSingle();
  if (existingRequest) return;

  const settled = ["rejected"];
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
    description: `${requestType === "documentation" ? "Documentation fee" : requestType === "agrovest" ? "Agrovest" : "Property"} payment via ${channel} — ${label || "checkout"}${amount < Number(order.total_amount ?? 0) ? ` — installment payment against Order ${order.id}` : ""}`,
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
