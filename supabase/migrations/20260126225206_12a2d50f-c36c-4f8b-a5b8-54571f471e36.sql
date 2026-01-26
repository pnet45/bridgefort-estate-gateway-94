-- Create email templates table
CREATE TABLE public.email_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  created_by UUID REFERENCES public.profiles(id),
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for email templates
CREATE POLICY "Admins can manage email templates"
ON public.email_templates
FOR ALL
USING (EXISTS (
  SELECT 1 FROM user_roles
  WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'
));

-- Create property analytics table to track views, inquiries, etc.
CREATE TABLE public.property_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL,
  event_type TEXT NOT NULL, -- 'view', 'inquiry', 'sale'
  user_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.property_analytics ENABLE ROW LEVEL SECURITY;

-- Anyone can insert analytics events (for tracking)
CREATE POLICY "Anyone can insert property analytics"
ON public.property_analytics
FOR INSERT
WITH CHECK (true);

-- Admins can view all analytics
CREATE POLICY "Admins can view all property analytics"
ON public.property_analytics
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM user_roles
  WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'
));

-- Create index for faster queries
CREATE INDEX idx_property_analytics_property_id ON public.property_analytics(property_id);
CREATE INDEX idx_property_analytics_event_type ON public.property_analytics(event_type);
CREATE INDEX idx_property_analytics_created_at ON public.property_analytics(created_at);

-- Create bulk email campaigns table
CREATE TABLE public.email_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  template_id UUID REFERENCES public.email_templates(id),
  recipient_filter TEXT DEFAULT 'all', -- 'all', 'subscribers', 'clients', 'custom'
  recipient_emails TEXT[] DEFAULT '{}',
  total_recipients INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft', -- 'draft', 'sending', 'completed', 'failed'
  created_by UUID REFERENCES public.profiles(id),
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;

-- RLS Policies for email campaigns
CREATE POLICY "Admins can manage email campaigns"
ON public.email_campaigns
FOR ALL
USING (EXISTS (
  SELECT 1 FROM user_roles
  WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'
));