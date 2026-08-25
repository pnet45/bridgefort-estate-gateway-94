
-- 1. Remove existing policies on inspection_bookings to avoid recursion
DROP POLICY IF EXISTS "Users can view their own inspection bookings" ON public.inspection_bookings;
DROP POLICY IF EXISTS "Users can create their own inspection bookings" ON public.inspection_bookings;
DROP POLICY IF EXISTS "Users can update their own inspection bookings" ON public.inspection_bookings;
DROP POLICY IF EXISTS "Staff and admin can view all inspection bookings" ON public.inspection_bookings;

-- 2. Create a security definer helper function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
$$;

-- 3. Re-add correct RLS policies for inspection_bookings

-- a. Users can view their own bookings
CREATE POLICY "user can view own inspection bookings"
  ON public.inspection_bookings
  FOR SELECT
  USING (user_id = auth.uid());

-- b. Users can create their own bookings
CREATE POLICY "user can insert own inspection bookings"
  ON public.inspection_bookings
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- c. Users can update their own bookings
CREATE POLICY "user can update own inspection bookings"
  ON public.inspection_bookings
  FOR UPDATE
  USING (user_id = auth.uid());

-- d. Staff and admin can view all bookings
CREATE POLICY "admin or staff can view all bookings"
  ON public.inspection_bookings
  FOR SELECT
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'staff')
  );

-- (Optional but recommended for future-proofing)
-- e. Staff and admin can update bookings
CREATE POLICY "admin or staff can update all bookings"
  ON public.inspection_bookings
  FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'staff')
  );
