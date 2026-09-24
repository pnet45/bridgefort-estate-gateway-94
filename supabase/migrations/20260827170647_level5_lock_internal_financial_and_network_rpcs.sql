DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT *
    FROM (VALUES
      ('allocate_land_payment(uuid,numeric)'),
      ('award_bhrealtor_membership_commissions()'),
      ('award_bhrealtor_property_sale_commission()'),
      ('create_authoritative_property_order_snapshot(uuid,uuid,text,integer)'),
      ('create_estate_subscription(text,text,text,uuid,uuid,uuid,uuid,numeric,text,text)'),
      ('generate_order_installment_schedule(uuid)'),
      ('generate_order_installments(uuid,integer,date)'),
      ('issue_estate_subscription_for_order()'),
      ('next_estate_subscription_number(text,text,text)'),
      ('prevent_bhrealtor_referral_reassignment()'),
      ('rebuild_order_installments(uuid)'),
      ('refresh_bhrealtor_network_after_referral_change()'),
      ('refresh_bhrealtor_network_counters(uuid)'),
      ('sync_bhrealtor_rank_from_package()'),
      ('sync_installment_from_payment()'),
      ('sync_installment_from_payment_request()'),
      ('sync_payment_request_state()'),
      ('sync_role_after_payment_change()'),
      ('sync_role_after_profile_change()'),
      ('unlock_bhrealtor_commissions_on_upgrade()'),
      ('validate_bhrealtor_network_change()'),
      ('validate_bhrealtor_referral_relationship()'),
      ('validate_bhrealtor_sponsor()')
    ) AS x(signature)
  LOOP
    BEGIN
      EXECUTE format('REVOKE EXECUTE ON FUNCTION public.%s FROM authenticated', r.signature);
    EXCEPTION WHEN undefined_function THEN
      NULL;
    END;
  END LOOP;
END $$;
