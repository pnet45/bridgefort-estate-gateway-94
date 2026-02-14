
-- Delete all home and house category properties, keeping only estate lands
DELETE FROM public.estate WHERE property_category IN ('home', 'house');
