-- Drop the overly permissive old estate policies that allow anyone to insert/update/delete
DROP POLICY IF EXISTS "delete_estate" ON public.estate;
DROP POLICY IF EXISTS "insert_estate" ON public.estate;
DROP POLICY IF EXISTS "select_estate" ON public.estate;
DROP POLICY IF EXISTS "update_estate" ON public.estate;