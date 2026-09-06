DROP POLICY IF EXISTS "own pmt insert" ON public.bh_subscription_payments;
REVOKE INSERT ON public.bh_subscription_payments FROM authenticated;

DROP POLICY IF EXISTS "own subs insert" ON public.bh_subscriptions;
REVOKE INSERT ON public.bh_subscriptions FROM authenticated;

DROP POLICY IF EXISTS "insert_own_docs_payments" ON public.estate_documentation_payments;
DROP POLICY IF EXISTS "estate_doc_payments_insert_own" ON public.estate_documentation_payments;
REVOKE INSERT ON public.estate_documentation_payments FROM authenticated;

GRANT ALL ON public.bh_subscription_payments TO service_role;
GRANT ALL ON public.bh_subscriptions TO service_role;
GRANT ALL ON public.estate_documentation_payments TO service_role;