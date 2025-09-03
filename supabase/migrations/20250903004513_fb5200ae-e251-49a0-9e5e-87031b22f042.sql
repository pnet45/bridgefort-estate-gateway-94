-- Fix BlogPost table security vulnerability
-- Enable Row Level Security on BlogPost table
ALTER TABLE public."BlogPost" ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view and manage their own blog posts
CREATE POLICY "Users can view their own blog posts" 
ON public."BlogPost" 
FOR SELECT 
USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Users can create their own blog posts" 
ON public."BlogPost" 
FOR INSERT 
WITH CHECK (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Users can update their own blog posts" 
ON public."BlogPost" 
FOR UPDATE 
USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Users can delete their own blog posts" 
ON public."BlogPost" 
FOR DELETE 
USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Create policy for admins to manage all blog posts
CREATE POLICY "Admins can view all blog posts" 
ON public."BlogPost" 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

CREATE POLICY "Admins can create any blog posts" 
ON public."BlogPost" 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

CREATE POLICY "Admins can update any blog posts" 
ON public."BlogPost" 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

CREATE POLICY "Admins can delete any blog posts" 
ON public."BlogPost" 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));