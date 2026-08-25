-- BHRealtors commission-ledger integrity pass.
--
-- Fixes an important edge case: one order can contain more than one estate-land
-- item. A uniqueness rule based only on source_order_id would incorrectly pay
-- commission for the first property and suppress commission for every other
-- property in the same order. Commission idempotency must therefore be tied to
-- the individual bh_property_sales record.

ALTER TABLE public.mlm_commissions
  ADD COLUMN IF NOT EXISTS source_property_sale_id uuid
    REFERENCES public.bh_property_sales(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_mlm_commissions_source_property_sale
  ON public.mlm_commissions(source_property_sale_id);

DROP INDEX IF EXISTS public.uq_mlm_property_commission_per_order;

CREATE UNIQUE INDEX IF NOT EXISTS uq_mlm_property_commission_per_sale
  ON public.mlm_commissions(source_property_sale_id, beneficiary_id, sponsor_level)
  WHERE source_property_sale_id IS NOT NULL;

-- Keep the membership idempotency rule separate from property-sale idempotency.
CREATE UNIQUE INDEX IF NOT EXISTS uq_mlm_membership_commission_once
  ON public.mlm_commissions(source_purchase_id, beneficiary_id, sponsor_level)
  WHERE commission_source = 'membership' AND source_purchase_id IS NOT NULL;

-- Canonical rank is always derived from the active package. This prevents a
-- stale/manual current_rank from disagreeing with package-based commission and
-- withdrawal rules.
CREATE OR REPLACE FUNCTION public.sync_bhrealtor_rank_from_package()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF COALESCE(NEW.is_pbo, false) THEN
    NEW.current_rank := CASE COALESCE(NEW.current_package, 'associate')
      WHEN 'classic_gold' THEN 'Classic Gold'
      WHEN 'gold' THEN 'Gold'
      ELSE 'Associate'
    END;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_bhrealtor_rank_from_package ON public.profiles;
CREATE TRIGGER trg_sync_bhrealtor_rank_from_package
BEFORE INSERT OR UPDATE OF is_pbo, current_package, current_rank
ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.sync_bhrealtor_rank_from_package();

UPDATE public.profiles
SET current_rank = CASE COALESCE(current_package, 'associate')
  WHEN 'classic_gold' THEN 'Classic Gold'
  WHEN 'gold' THEN 'Gold'
  ELSE 'Associate'
END
WHERE is_pbo = true
  AND current_rank IS DISTINCT FROM CASE COALESCE(current_package, 'associate')
    WHEN 'classic_gold' THEN 'Classic Gold'
    WHEN 'gold' THEN 'Gold'
    ELSE 'Associate'
  END;

-- Recreate the property-sale award function so each individual property sale
-- has its own idempotency key. Business rules remain:
--   Associate seller = 5%, locked; no upline sale commission.
--   Gold seller = 10%, available; Gold+ first-level upline = 5%.
--   Classic Gold seller = 15%, available; Gold+ first-level upline = 5%.
--   No third level.
CREATE OR REPLACE FUNCTION public.award_bhrealtor_property_sale_commission()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_buyer_id uuid;
  v_seller_id uuid;
  v_level1_id uuid;
  v_seller_package text;
  v_level1_package text;
  v_seller_is_pbo boolean;
  v_level1_is_pbo boolean;
  v_seller_rate numeric;
  v_level1_rate numeric;
  v_item jsonb;
  v_property_price numeric;
  v_quantity numeric;
  v_property_id text;
  v_plot_id text;
  v_sale_id uuid;
  v_commission numeric;
  v_status text;
BEGIN
  IF NEW.payment_status <> 'paid' OR OLD.payment_status = 'paid' THEN
    RETURN NEW;
  END IF;

  v_buyer_id := NEW.user_id;

  SELECT p.referred_by_id
  INTO v_seller_id
  FROM public.profiles p
  WHERE p.id = v_buyer_id;

  IF v_seller_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT p.current_package, p.is_pbo, p.referred_by_id
  INTO v_seller_package, v_seller_is_pbo, v_level1_id
  FROM public.profiles p
  WHERE p.id = v_seller_id;

  IF NOT COALESCE(v_seller_is_pbo, false) THEN
    RETURN NEW;
  END IF;

  v_seller_rate := CASE v_seller_package
    WHEN 'associate' THEN 5
    WHEN 'gold' THEN 10
    WHEN 'classic_gold' THEN 15
    ELSE 0
  END;

  IF v_seller_rate <= 0 THEN
    RETURN NEW;
  END IF;

  SELECT p.current_package, p.is_pbo
  INTO v_level1_package, v_level1_is_pbo
  FROM public.profiles p
  WHERE p.id = v_level1_id;

  IF v_level1_is_pbo AND public.bhrealtor_package_rank(v_level1_package) >= 2 THEN
    v_level1_rate := 5;
  ELSE
    v_level1_rate := 0;
  END IF;

  FOR v_item IN SELECT value FROM jsonb_array_elements(COALESCE(NEW.items, '[]'::jsonb)) LOOP
    IF COALESCE(v_item->>'property_type', '') = 'Agrovest'
       OR COALESCE(v_item->>'property_type', '') ILIKE 'Documentation%'
       OR COALESCE(v_item->>'property_type', '') ILIKE '%subscription%'
       OR COALESCE(v_item->>'property_type', '') ILIKE '%promo%' THEN
      CONTINUE;
    END IF;

    v_property_id := NULLIF(v_item->>'property_id', '');
    v_plot_id := NULLIF(v_item->>'plot_id', '');
    v_quantity := GREATEST(1, COALESCE((v_item->>'quantity')::numeric, 1));
    v_property_price := COALESCE((v_item->>'price')::numeric, 0) * v_quantity;

    IF v_property_id IS NULL OR v_property_price <= 0 THEN
      CONTINUE;
    END IF;

    v_sale_id := NULL;
    IF v_plot_id IS NOT NULL THEN
      INSERT INTO public.bh_property_sales(buyer_id, order_id, property_id, plot_id, property_price)
      VALUES (v_buyer_id, NEW.id, v_property_id, v_plot_id, v_property_price)
      ON CONFLICT (buyer_id, property_id, plot_id) DO NOTHING
      RETURNING id INTO v_sale_id;
    ELSE
      INSERT INTO public.bh_property_sales(buyer_id, order_id, property_id, property_price)
      VALUES (v_buyer_id, NEW.id, v_property_id, v_property_price)
      ON CONFLICT (buyer_id, property_id) WHERE plot_id IS NULL DO NOTHING
      RETURNING id INTO v_sale_id;
    END IF;

    IF v_sale_id IS NULL THEN
      CONTINUE;
    END IF;

    v_commission := ROUND(v_property_price * v_seller_rate / 100, 2);
    v_status := CASE WHEN v_seller_package = 'associate' THEN 'locked' ELSE 'available' END;

    INSERT INTO public.mlm_commissions (
      source_purchase_id, source_order_id, source_property_sale_id,
      commission_source, beneficiary_id, sponsor_level, commission_rate,
      commission_amount, status, description
    ) VALUES (
      NULL, NEW.id, v_sale_id,
      'property_sale', v_seller_id, 1, v_seller_rate, v_commission,
      v_status,
      format('%s%% estate-land sales commission for %s Realtor', v_seller_rate, initcap(replace(v_seller_package, '_', ' ')))
    ) ON CONFLICT (source_property_sale_id, beneficiary_id, sponsor_level) DO NOTHING;

    IF FOUND THEN
      UPDATE public.profiles
      SET total_commissions = COALESCE(total_commissions, 0) + v_commission,
          total_personal_volume = COALESCE(total_personal_volume, 0) + v_property_price,
          wallet_balance = CASE WHEN v_status = 'available'
            THEN COALESCE(wallet_balance, 0) + v_commission
            ELSE COALESCE(wallet_balance, 0) END,
          updated_at = now()
      WHERE id = v_seller_id;
    END IF;

    IF v_level1_rate > 0 THEN
      v_commission := ROUND(v_property_price * v_level1_rate / 100, 2);

      INSERT INTO public.mlm_commissions (
        source_purchase_id, source_order_id, source_property_sale_id,
        commission_source, beneficiary_id, sponsor_level, commission_rate,
        commission_amount, status, description
      ) VALUES (
        NULL, NEW.id, v_sale_id,
        'property_sale', v_level1_id, 2, v_level1_rate,
        v_commission, 'available',
        '5% first-level referrer commission on an estate-land sale'
      ) ON CONFLICT (source_property_sale_id, beneficiary_id, sponsor_level) DO NOTHING;

      IF FOUND THEN
        UPDATE public.profiles
        SET wallet_balance = COALESCE(wallet_balance, 0) + v_commission,
            total_commissions = COALESCE(total_commissions, 0) + v_commission,
            updated_at = now()
        WHERE id = v_level1_id;
      END IF;
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_award_bhrealtor_property_sale_commission ON public.orders;
CREATE TRIGGER trg_award_bhrealtor_property_sale_commission
AFTER UPDATE OF payment_status ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.award_bhrealtor_property_sale_commission();

COMMENT ON FUNCTION public.award_bhrealtor_property_sale_commission() IS
  'BHRealtors estate-land sales: Associate 5% locked; Gold 10% available; Classic Gold 15% available; Gold+ first-level upline 5%; no level 3+; idempotent per property sale.';
