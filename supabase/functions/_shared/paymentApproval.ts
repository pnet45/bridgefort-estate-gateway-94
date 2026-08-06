/* eslint-disable @typescript-eslint/no-explicit-any */
// Shared helper: after a gateway confirms a successful charge for a checkout
// order (property, documentation fee or Agrovest), nothing is marked as
// finally paid. Instead every related record moves to `awaiting_approval` and
// a row is queued in `payment_requests` so an admin can approve or reject it
// from the Admin Approvals hub. The client dashboard reads those same
// statuses, so approval/rejection flows straight back to the user.

export async function queueOrderForApproval(
  admin: any,
  opts: { reference: string; paidAmount: number; channel: string }
) {
  const { reference, paidAmount, channel } = opts;
  if (!reference) return;

  const { data: order } = await admin
    .from("orders")
    .select("id, user_id, items, total_amount, payment_status, customer_name")
    .eq("payment_reference", reference)
    .maybeSingle();

  if (!order) return;

  // Stripe reports the charged amount in USD cents; fall back to the
  // authoritative order total when the gateway amount isn't in Naira.
  const amount = paidAmount > 0 ? paidAmount : Number(order.total_amount ?? 0);

  // Idempotent: only queue once per reference.
  const { data: existingRequest } = await admin
    .from("payment_requests")
    .select("id")
    .eq("reference", reference)
    .maybeSingle();

  const items: any[] = Array.isArray(order.items) ? order.items : [];
  const types = items.map((i) => String(i?.property_type ?? ""));
  const requestType = types.some((t) => t.startsWith("Documentation"))
    ? "documentation"
    : types.some((t) => t === "Agrovest")
      ? "agrovest"
      : "property";

  const label = items
    .map((i) => `${i?.property_name ?? "Item"}${i?.quantity > 1 ? ` x${i.quantity}` : ""}`)
    .join(", ")
    .slice(0, 300);

  await admin
    .from("orders")
    .update({ payment_status: "awaiting_approval", updated_at: new Date().toISOString() })
    .eq("payment_reference", reference);

  await admin
    .from("estate_documentation_payments")
    .update({ status: "awaiting_approval", updated_at: new Date().toISOString() })
    .eq("reference", reference);

  const { data: plan } = await admin
    .from("payments")
    .select("id, total_amount")
    .eq("reference", reference)
    .maybeSingle();

  if (plan) {
    await admin
      .from("payments")
      .update({
        amount_paid: amount,
        balance: Math.max(0, Number(plan.total_amount ?? 0) - amount),
        status: "awaiting_approval",
        updated_at: new Date().toISOString(),
      })
      .eq("id", plan.id);
  }

  if (!existingRequest) {
    await admin.from("payment_requests").insert({
      user_id: order.user_id,
      type: requestType,
      amount,
      reference,
      related_payment_id: plan?.id ?? null,
      description: `${requestType === "documentation" ? "Documentation fee" : requestType === "agrovest" ? "Agrovest" : "Property"} payment via ${channel} — ${label || "checkout"}`,
      status: "pending",
    });

    await admin.from("notifications").insert({
      user_id: order.user_id,
      audience: "user",
      type: "payment_status",
      title: "Payment received — awaiting approval",
      message: `We received your payment of ₦${Number(amount).toLocaleString()}. It is now awaiting admin approval.`,
      link: "/dashboard",
    });
  }
}
