-- Additive support for client-submitted bank transfer evidence.
-- A transfer remains pending until an authorised administrator approves it.
ALTER TABLE public.payment_requests
  ADD COLUMN IF NOT EXISTS payment_method text,
  ADD COLUMN IF NOT EXISTS transfer_reference text,
  ADD COLUMN IF NOT EXISTS proof_storage_path text;

ALTER TABLE public.payment_requests
  DROP CONSTRAINT IF EXISTS payment_requests_payment_method_check;
ALTER TABLE public.payment_requests
  ADD CONSTRAINT payment_requests_payment_method_check
  CHECK (payment_method IS NULL OR payment_method IN ('paystack','stripe','bank_transfer'));

CREATE UNIQUE INDEX IF NOT EXISTS payment_requests_transfer_reference_unique
  ON public.payment_requests (lower(transfer_reference))
  WHERE transfer_reference IS NOT NULL;

-- Evidence is stored privately; no public bucket access is granted.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('bank-transfer-proofs', 'bank-transfer-proofs', false, 5242880,
        ARRAY['image/jpeg','image/png','image/webp','application/pdf'])
ON CONFLICT (id) DO UPDATE
SET public = false,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg','image/png','image/webp','application/pdf'];

DROP POLICY IF EXISTS "Clients upload own transfer proof" ON storage.objects;
CREATE POLICY "Clients upload own transfer proof"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'bank-transfer-proofs'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Clients read own transfer proof" ON storage.objects;
CREATE POLICY "Clients read own transfer proof"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'bank-transfer-proofs'
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR public.user_has_permission(auth.uid(), 'admin:approve_payments')
    OR public.user_has_permission(auth.uid(), 'admin:all')
  )
);

CREATE OR REPLACE FUNCTION public.submit_bank_transfer_request(
  _order_id uuid,
  _amount numeric,
  _transfer_reference text,
  _proof_storage_path text
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, storage
AS $$
DECLARE
  caller uuid := auth.uid();
  o public.orders;
  related_payment uuid;
  request_id uuid;
  request_type text;
  transfer_ref text := nullif(trim(coalesce(_transfer_reference, '')), '');
  proof_path text := nullif(trim(coalesce(_proof_storage_path, '')), '');
  outstanding numeric;
BEGIN
  IF caller IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
  IF _amount IS NULL OR _amount <= 0 THEN RAISE EXCEPTION 'Enter a valid transfer amount'; END IF;
  IF transfer_ref IS NULL OR length(transfer_ref) < 4 OR length(transfer_ref) > 120 THEN
    RAISE EXCEPTION 'Enter a valid bank transfer reference';
  END IF;
  IF proof_path IS NULL OR length(proof_path) > 500
     OR split_part(proof_path, '/', 1) <> caller::text
     OR position('..' in proof_path) > 0 THEN
    RAISE EXCEPTION 'Upload transfer evidence to your own private folder first';
  END IF;

  SELECT * INTO o FROM public.orders WHERE id = _order_id AND user_id = caller FOR UPDATE;
  IF o.id IS NULL THEN RAISE EXCEPTION 'Order not found for this account'; END IF;
  outstanding := greatest(0, coalesce(o.total_amount,0) - coalesce(o.amount_paid,0));
  IF outstanding <= 0 THEN RAISE EXCEPTION 'This order has no outstanding balance'; END IF;
  IF _amount > outstanding + 0.01 THEN RAISE EXCEPTION 'Transfer amount exceeds the outstanding balance'; END IF;
  IF EXISTS (
    SELECT 1 FROM public.payment_requests
    WHERE lower(coalesce(transfer_reference, '')) = lower(transfer_ref)
  ) THEN RAISE EXCEPTION 'This transfer reference has already been submitted'; END IF;

  SELECT id INTO related_payment
  FROM public.payments
  WHERE reference = o.payment_reference AND user_id = caller
  ORDER BY created_at DESC LIMIT 1;

  request_type := CASE
    WHEN EXISTS (SELECT 1 FROM jsonb_array_elements(coalesce(o.items, '[]'::jsonb)) i
                 WHERE coalesce(i->>'property_type','') LIKE 'Documentation%') THEN 'documentation'
    WHEN EXISTS (SELECT 1 FROM jsonb_array_elements(coalesce(o.items, '[]'::jsonb)) i
                 WHERE coalesce(i->>'property_type','') = 'Agrovest') THEN 'agrovest'
    ELSE 'property'
  END;

  INSERT INTO public.payment_requests
    (user_id, type, amount, reference, related_payment_id, description, status,
     payment_method, transfer_reference, proof_storage_path)
  VALUES
    (caller, request_type, _amount, o.payment_reference, related_payment,
     'Bank transfer awaiting manual verification for order ' || o.id::text,
     'pending', 'bank_transfer', transfer_ref, proof_path)
  RETURNING id INTO request_id;

  RETURN jsonb_build_object('success', true, 'request_id', request_id,
                            'status', 'pending', 'outstanding_balance', outstanding - _amount);
END;
$$;

REVOKE ALL ON FUNCTION public.submit_bank_transfer_request(uuid,numeric,text,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.submit_bank_transfer_request(uuid,numeric,text,text) TO authenticated;
