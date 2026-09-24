-- 1. Enable RLS where policies existed but were not enforced
ALTER TABLE public.admin_mailboxes   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_roles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_accounts    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_sessions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mail_settings     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mail_sync_status  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mail_tokens       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles             ENABLE ROW LEVEL SECURITY;

GRANT ALL ON public.admin_mailboxes, public.admin_permissions, public.admin_roles,
             public.email_accounts, public.email_sessions, public.mail_settings,
             public.mail_sync_status, public.mail_tokens, public.permissions, public.roles
  TO service_role;

-- 2. Admin-only writes on the role / permission catalogues
DROP POLICY IF EXISTS permissions_write_admins ON public.permissions;
CREATE POLICY permissions_write_admins ON public.permissions
  FOR ALL TO authenticated
  USING (public.user_has_permission(auth.uid(), 'admin:manage_permissions'))
  WITH CHECK (public.user_has_permission(auth.uid(), 'admin:manage_permissions'));

DROP POLICY IF EXISTS roles_write_admins ON public.roles;
CREATE POLICY roles_write_admins ON public.roles
  FOR ALL TO authenticated
  USING (public.user_has_permission(auth.uid(), 'admin:manage_permissions'))
  WITH CHECK (public.user_has_permission(auth.uid(), 'admin:manage_permissions'));

-- 3. Payment integrity: clients may no longer set order / plan amounts.
DROP POLICY IF EXISTS "Users can insert their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can update their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can delete their own orders" ON public.orders;
DROP POLICY IF EXISTS orders_insert_own ON public.orders;
DROP POLICY IF EXISTS orders_update_own ON public.orders;
DROP POLICY IF EXISTS orders_delete_own ON public.orders;
REVOKE INSERT, UPDATE, DELETE ON public.orders FROM authenticated, anon;

DROP POLICY IF EXISTS "Users can insert their own payments" ON public.payments;
DROP POLICY IF EXISTS "Users can update their own payments" ON public.payments;
DROP POLICY IF EXISTS "Users can delete their own payments" ON public.payments;
DROP POLICY IF EXISTS payments_insert_own ON public.payments;
DROP POLICY IF EXISTS payments_update_own ON public.payments;
DROP POLICY IF EXISTS payments_delete_own ON public.payments;
REVOKE UPDATE, DELETE ON public.payments FROM authenticated, anon;

-- Only free (zero value) bookkeeping rows may still be created client-side.
CREATE POLICY payments_insert_free_only ON public.payments
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND COALESCE(total_amount, 0) = 0
    AND COALESCE(amount_paid, 0) = 0
    AND COALESCE(balance, 0) = 0
  );

DROP POLICY IF EXISTS payments_admin_manage ON public.payments;
CREATE POLICY payments_admin_manage ON public.payments
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Users can insert their own payment transactions" ON public.payment_transactions;
DROP POLICY IF EXISTS "Users can update their own payment transactions" ON public.payment_transactions;
DROP POLICY IF EXISTS "Users can delete their own payment transactions" ON public.payment_transactions;
DROP POLICY IF EXISTS payment_transactions_insert_own ON public.payment_transactions;
DROP POLICY IF EXISTS payment_transactions_update_own ON public.payment_transactions;
DROP POLICY IF EXISTS payment_transactions_delete_own ON public.payment_transactions;
REVOKE INSERT, UPDATE, DELETE ON public.payment_transactions FROM authenticated, anon;

DROP POLICY IF EXISTS "Users can create their own payment requests" ON public.payment_requests;
REVOKE INSERT, UPDATE, DELETE ON public.payment_requests FROM authenticated, anon;

-- 4. Remove needless EXECUTE grants on SECURITY DEFINER internals.
REVOKE ALL ON FUNCTION public.block_role_updates_on_users() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.get_downline_ids(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.has_role(uuid, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.user_has_permission(uuid, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.user_mailbox_access(uuid, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_downline_ids(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_has_permission(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_mailbox_access(uuid, text, text) TO authenticated;

-- 5. Inbound email attachments must not be world-readable.
DROP POLICY IF EXISTS "Public can view email attachments" ON storage.objects;
DROP POLICY IF EXISTS "Admins can read email attachments" ON storage.objects;
CREATE POLICY "Admins can read email attachments"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'email-attachments' AND public.has_role(auth.uid(), 'admin'));
