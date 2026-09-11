CREATE OR REPLACE FUNCTION public.__tmp_export_migrations(p_key text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, supabase_migrations
AS $$
DECLARE result jsonb;
BEGIN
  IF p_key IS DISTINCT FROM 'b7f2c9a1-sync-export-2026' THEN
    RAISE EXCEPTION 'not authorized';
  END IF;
  SELECT jsonb_agg(jsonb_build_object('version', version, 'name', name, 'statements', statements) ORDER BY version)
  INTO result
  FROM supabase_migrations.schema_migrations;
  RETURN COALESCE(result, '[]'::jsonb);
END;
$$;

REVOKE ALL ON FUNCTION public.__tmp_export_migrations(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.__tmp_export_migrations(text) TO anon, authenticated;