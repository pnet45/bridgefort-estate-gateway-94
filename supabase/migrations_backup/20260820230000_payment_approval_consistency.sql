-- Payment approval consistency hardening.
-- The application previously changed payment_requests, payments, orders and
-- documentation-payment rows in separate client requests. A failure midway
-- could leave a payment approved while the linked order remained pending (or
-- the reverse). These triggers make the core financial state transition
-- database-owned and atomic with the payment_requests row change.

CREATE OR REPLACE FUNCTION public.sync_payment_request_state()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- A newly queued request is the source of truth that a gateway payment was
  -- received but has not yet been approved. Keep all linked records locked.
  IF TG_OP = 'INSERT' AND NEW.status = 'pending' THEN
    IF NEW.related_payment_id IS NOT NULL THEN
      UPDATE public.payments
      SET
        amount_paid = COALESCE(NEW.amount, amount_paid),
        balance = GREATEST(0, COALESCE(total_amount, 0) - COALESCE(NEW.amount, 0)),
        status = 'awaiting_approval',
        updated_at = now()
      WHERE id = NEW.related_payment_id
        AND status NOT IN ('completed', 'rejected');
    END IF;

    IF NEW.reference IS NOT NULL THEN
      UPDATE public.orders
      SET payment_status = 'awaiting_approval', updated_at = now()
      WHERE payment_reference = NEW.reference
        AND payment_status NOT IN ('paid', 'approved', 'rejected');

      UPDATE public.estate_documentation_payments
      SET status = 'awaiting_approval', updated_at = now()
      WHERE reference = NEW.reference
        AND status NOT IN ('completed', 'rejected');
    END IF;

    RETURN NEW;
  END IF;

  -- A decision is applied to every linked record in the same database
  -- transaction as the payment_requests status change.
  IF TG_OP = 'UPDATE'
     AND OLD.status = 'pending'
     AND NEW.status IN ('approved', 'rejected') THEN

    IF NEW.related_payment_id IS NOT NULL THEN
      UPDATE public.payments
      SET
        status = CASE WHEN NEW.status = 'approved' THEN 'active' ELSE 'rejected' END,
        updated_at = now()
      WHERE id = NEW.related_payment_id;
    END IF;

    IF NEW.reference IS NOT NULL THEN
      UPDATE public.orders
      SET
        payment_status = CASE WHEN NEW.status = 'approved' THEN 'paid' ELSE 'rejected' END,
        updated_at = now()
      WHERE payment_reference = NEW.reference;

      UPDATE public.estate_documentation_payments
      SET
        status = CASE WHEN NEW.status = 'approved' THEN 'completed' ELSE 'rejected' END,
        updated_at = now()
      WHERE reference = NEW.reference;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_payment_request_state ON public.payment_requests;
CREATE TRIGGER trg_sync_payment_request_state
AFTER INSERT OR UPDATE OF status ON public.payment_requests
FOR EACH ROW
EXECUTE FUNCTION public.sync_payment_request_state();

REVOKE ALL ON FUNCTION public.sync_payment_request_state() FROM PUBLIC;

-- Prevent an already-final request from being changed again. A pending
-- request may transition exactly once to approved/rejected.
CREATE OR REPLACE FUNCTION public.guard_payment_request_transition()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.status IN ('approved', 'rejected') AND NEW.status <> OLD.status THEN
    RAISE EXCEPTION 'Payment request % has already been finalized', OLD.id;
  END IF;

  IF OLD.status = 'pending' AND NEW.status NOT IN ('pending', 'approved', 'rejected') THEN
    RAISE EXCEPTION 'Invalid payment request status transition: % -> %', OLD.status, NEW.status;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_payment_request_transition ON public.payment_requests;
CREATE TRIGGER trg_guard_payment_request_transition
BEFORE UPDATE OF status ON public.payment_requests
FOR EACH ROW
EXECUTE FUNCTION public.guard_payment_request_transition();

REVOKE ALL ON FUNCTION public.guard_payment_request_transition() FROM PUBLIC;
