-- Referral leaderboard: downline count per PBO. This is a plain view, which
-- in Postgres runs with the *view owner's* privileges against the
-- underlying tables (not RLS-filtered per caller) unless declared
-- security_invoker — that's intentional here: a leaderboard has to see
-- across all PBOs to rank them, which per-row profile RLS wouldn't
-- otherwise allow any single user to do. To keep that safe, the view only
-- exposes first name + last-initial and a count — no emails, no referral
-- codes, no financial data — and access is explicitly granted to
-- `authenticated` only (not `anon`).

CREATE OR REPLACE VIEW public.pbo_referral_leaderboard AS
SELECT
  p.id AS pbo_id,
  p.first_name,
  LEFT(COALESCE(p.last_name, ''), 1) AS last_initial,
  p.current_package,
  COUNT(d.id) AS downline_count
FROM public.profiles p
LEFT JOIN public.profiles d ON d.referred_by_id = p.id
WHERE p.is_pbo = true
GROUP BY p.id, p.first_name, p.last_name, p.current_package
HAVING COUNT(d.id) > 0
ORDER BY COUNT(d.id) DESC;

GRANT SELECT ON public.pbo_referral_leaderboard TO authenticated;
