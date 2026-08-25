-- Prevent duplicate BHRealtor commissions when a property is paid through an
-- installment plan. Each checkout installment creates a new order, but the
-- same property/plot must only be commissioned once.

CREATE TABLE IF NOT EXISTS public.bh_property_sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  property_id text NOT NULL,
  plot_id text,
  property_price numeric NOT NULL,
  commissioned_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_bh_property_sale_plot
  ON public.bh_property_sales(buyer_id, property_id, plot_id)
  WHERE plot_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_bh_property_sale_property
  ON public.bh_property_sales(buyer_id, property_id)
  WHERE plot_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_bh_property_sales_buyer
  ON public.bh_property_sales(buyer_id, created_at DESC);

ALTER TABLE public.bh_property_sales ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own property sales" ON public.bh_property_sales;
CREATE POLICY "Users can view own property sales"
ON public.bh_property_sales
FOR SELECT TO authenticated
USING (buyer_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.award_bhrealtor_property_sale_commission()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_seller_id uuid;
  v_level1_id uuid;
  v_seller_is_pbo boolean;
  v_level1_is_pbo boolean;
  v_item jsonb;
  v_property_price numeric;
  v_quantity numeric;
  v_property_id text;
  v_plot_id text;
  v_sale_id uuid;
  v_commission numeric;
BEGIN
  IF NEW.payment_status <> 'paid' OR OLD.payment_status = 'paid' THEN
    RETURN NEW;
  END IF;

  -- The buyer's referred_by_id is the realtor responsible for this sale.
  SELECT p.id, p.referred_by_id, p.is_pbo
  INTO v_seller_id, v_level1_id, v_seller_is_pbo
  FROM public.profiles p
  WHERE p.id = NEW.user_id;

  IF v_seller_id IS NULL OR NOT COALESCE(v_seller_is_pbo, false) OR v_level1_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT p.is_pbo
  INTO v_level1_is_pbo
  FROM public.profiles p
  WHERE p.id = v_level1_id;

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

    -- If this is an installment of an already-commissioned plot, nothing is
    -- paid again. The first approved payment creates the sale record and the
    -- commission ledger entries.
    v_sale_id := NULL;
    IF v_plot_id IS NOT NULL THEN
      INSERT INTO public.bh_property_sales(buyer_id, order_id, property_id, plot_id, property_price)
      VALUES (NEW.user_id, NEW.id, v_property_id, v_plot_id, v_property_price)
      ON CONFLICT (buyer_id, property_id, plot_id) DO NOTHING
      RETURNING id INTO v_sale_id;
    ELSE
      INSERT INTO public.bh_property_sales(buyer_id, order_id, property_id, property_price)
      VALUES (NEW.user_id, NEW.id, v_property_id, v_property_price)
      ON CONFLICT (buyer_id, property_id) WHERE plot_id IS NULL DO NOTHING
      RETURNING id INTO v_sale_id;
    END IF;

    IF v_sale_id IS NULL THEN
      CONTINUE;
    END IF;

    -- Seller: 15% of the actual property price, not the installment amount.
    v_commission := ROUND(v_property_price * 0.15, 2);
    INSERT INTO public.mlm_commissions (
      source_purchase_id, source_order_id, commission_source,
      beneficiary_id, sponsor_level, commission_rate, commission_amount,
      status, description
    ) VALUES (
      NULL, NEW.id, 'property_sale',
      v_seller_id, 1, 15, v_commission,
      'available', '15% estate-land sale commission for the selling realtor'
    ) ON CONFLICT (source_order_id, beneficiary_id, sponsor_level) DO NOTHING;

    IF FOUND THEN
      UPDATE public.profiles
      SET wallet_balance = COALESCE(wallet_balance, 0) + v_commission,
          total_commissions = COALESCE(total_commissions, 0) + v_commission,
          total_personal_volume = COALESCE(total_personal_volume, 0) + v_property_price,
          updated_at = now()
      WHERE id = v_seller_id;
    END IF;

    -- Seller's first-level referrer: 5%. No third level is traversed.
    IF v_level1_is_pbo THEN
      v_commission := ROUND(v_property_price * 0.05, 2);
      INSERT INTO public.mlm_commissions (
        source_purchase_id, source_order_id, commission_source,
        beneficiary_id, sponsor_level, commission_rate, commission_amount,
        status, description
      ) VALUES (
        NULL, NEW.id, 'property_sale',
        v_level1_id, 2, 5, v_commission,
        'available', '5% first-level referrer commission for an estate-land sale'
      ) ON CONFLICT (source_order_id, beneficiary_id, sponsor_level) DO NOTHING;

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

COMMENT ON TABLE public.bh_property_sales IS
  'One commissionable BHRealtors estate-land sale per buyer/property/plot. Prevents duplicate commissions across installment orders.';
