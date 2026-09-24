ALTER TABLE public.mlm_packages
  ADD COLUMN IF NOT EXISTS sales_commission_pct numeric(5,2),
  ADD COLUMN IF NOT EXISTS sales_commission_locked boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS first_level_sales_commission_pct numeric(5,2) NOT NULL DEFAULT 0;

UPDATE public.mlm_packages
SET sales_commission_pct = CASE package_code
    WHEN 'associate' THEN 5
    WHEN 'gold' THEN 10
    WHEN 'classic_gold' THEN 15
    ELSE COALESCE(sales_commission_pct, 0)
  END,
  sales_commission_locked = CASE WHEN package_code = 'associate' THEN true ELSE false END,
  first_level_sales_commission_pct = CASE WHEN package_code IN ('gold','classic_gold') THEN 5 ELSE 0 END
WHERE package_code IN ('associate','gold','classic_gold');

ALTER TABLE public.mlm_packages
  ALTER COLUMN sales_commission_pct SET NOT NULL;

ALTER TABLE public.mlm_packages
  ADD CONSTRAINT mlm_packages_sales_commission_pct_chk CHECK (sales_commission_pct >= 0 AND sales_commission_pct <= 100),
  ADD CONSTRAINT mlm_packages_first_level_sales_commission_pct_chk CHECK (first_level_sales_commission_pct >= 0 AND first_level_sales_commission_pct <= 100);

CREATE OR REPLACE FUNCTION public.update_bhrealtor_package_price(p_package_code text, p_price numeric)
RETURNS public.mlm_packages
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_row public.mlm_packages;
BEGIN
  IF NOT public.can_manage_bhrealtor_financials(auth.uid()) THEN
    RAISE EXCEPTION 'Only authorized BHRealtors financial administrators can change package pricing';
  END IF;
  IF p_package_code NOT IN ('associate','gold','classic_gold') THEN
    RAISE EXCEPTION 'Invalid BHRealtor package';
  END IF;
  IF p_price IS NULL OR p_price <= 0 OR p_price > 100000000 THEN
    RAISE EXCEPTION 'Package price must be greater than zero and within the allowed range';
  END IF;
  UPDATE public.mlm_packages SET price = p_price WHERE package_code = p_package_code RETURNING * INTO v_row;
  IF v_row IS NULL THEN RAISE EXCEPTION 'BHRealtor package not found'; END IF;
  RETURN v_row;
END;
$$;

REVOKE ALL ON FUNCTION public.update_bhrealtor_package_price(text,numeric) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_bhrealtor_package_price(text,numeric) TO authenticated;
