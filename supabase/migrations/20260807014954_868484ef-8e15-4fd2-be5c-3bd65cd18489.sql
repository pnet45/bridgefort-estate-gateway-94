-- Audit log for payment request approvals/rejections
CREATE TABLE IF NOT EXISTS public.payment_request_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_request_id uuid NOT NULL REFERENCES public.payment_requests(id) ON DELETE CASCADE,
  admin_id uuid,
  action text NOT NULL,
  previous_status text,
  new_status text NOT NULL,
  reason text,
  amount numeric,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.payment_request_audit_log TO authenticated;
GRANT ALL ON public.payment_request_audit_log TO service_role;

ALTER TABLE public.payment_request_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view payment request audit log"
ON public.payment_request_audit_log FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert payment request audit log"
ON public.payment_request_audit_log FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin') AND admin_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_pr_audit_request ON public.payment_request_audit_log(payment_request_id, created_at DESC);

-- Idempotency: a gateway reference can only ever queue one payment request
CREATE UNIQUE INDEX IF NOT EXISTS payment_requests_reference_unique
ON public.payment_requests(reference)
WHERE reference IS NOT NULL;