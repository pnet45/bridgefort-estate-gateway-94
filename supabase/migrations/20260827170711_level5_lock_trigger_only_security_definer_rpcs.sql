DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT * FROM (VALUES
      ('block_role_updates_on_users()'),
      ('cleanup_old_login_attempts()'),
      ('complete_profile_on_training_registration()'),
      ('copy_contact_to_admin_emails()'),
      ('enforce_listing_moderation()'),
      ('handle_new_user()'),
      ('notify_listing_moderation_change()'),
      ('protect_profile_financial_fields()'),
      ('reset_listing_on_user_edit()'),
      ('sync_admin_department_role()'),
      ('sync_business_user_role(uuid)')
    ) AS x(signature)
  LOOP
    BEGIN
      EXECUTE format('REVOKE EXECUTE ON FUNCTION public.%s FROM authenticated', r.signature);
    EXCEPTION WHEN undefined_function THEN
      NULL;
    END;
  END LOOP;
END $$;
