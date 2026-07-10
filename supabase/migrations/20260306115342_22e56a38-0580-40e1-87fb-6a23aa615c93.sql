-- Create estate_doc_pricing table for per-estate documentation fees
CREATE TABLE public.estate_doc_pricing (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  estate_id UUID NOT NULL REFERENCES public.estate(id) ON DELETE CASCADE,
  deed_of_assignment NUMERIC DEFAULT 0,
  survey_plan NUMERIC DEFAULT 0,
  plot_demarcation NUMERIC DEFAULT 0,
  plot_maintenance_fee NUMERIC DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(estate_id)
);

ALTER TABLE public.estate_doc_pricing ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view estate doc pricing"
  ON public.estate_doc_pricing FOR SELECT USING (true);

CREATE POLICY "Only admins can insert estate doc pricing"
  ON public.estate_doc_pricing FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update estate doc pricing"
  ON public.estate_doc_pricing FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete estate doc pricing"
  ON public.estate_doc_pricing FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- Add subscription_form_url column to estate table for PDF uploads
ALTER TABLE public.estate ADD COLUMN IF NOT EXISTS subscription_form_url TEXT DEFAULT NULL;