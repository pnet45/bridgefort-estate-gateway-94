-- Fix newsletter_subscriptions security vulnerability
-- Remove the public read policy that exposes email addresses

DROP POLICY IF EXISTS "Anyone can view active subscriptions" ON public.newsletter_subscriptions;

-- Add admin-only access policy for viewing newsletter subscriptions
CREATE POLICY "Only admins can view newsletter subscriptions" 
ON public.newsletter_subscriptions 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.uid() 
  AND role = 'admin'
));

-- Keep the insertion policy so users can still subscribe
-- (The existing "Anyone can subscribe to newsletter" policy remains unchanged)