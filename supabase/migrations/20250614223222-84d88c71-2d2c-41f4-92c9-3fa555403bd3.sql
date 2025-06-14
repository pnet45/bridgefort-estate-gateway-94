
-- Duplicate "Fortress Hills Estate" to create "Fortress Hills Estate Phase 2"
INSERT INTO public.estate (
  name,
  location,
  size,
  promo_price,
  prelaunch_price,
  actual_price,
  title,
  type,
  description,
  sub_form,
  media,
  phase,
  scheme,
  total_plots,
  sold_plots
)
SELECT 
  'Fortress Hills Estate Phase 2' AS name,
  location,
  300 AS size,
  3500000 AS promo_price,
  NULL AS prelaunch_price,
  NULL AS actual_price,
  title,
  type,
  description,
  sub_form,
  media,
  2 AS phase,
  scheme,
  28 AS total_plots,
  0 AS sold_plots
FROM public.estate
WHERE name = 'Fortress Hills Estate'
LIMIT 1;

-- Duplicate "Hampton Ville Estate" to create "Hampton Ville Estate Phase 2"
INSERT INTO public.estate (
  name,
  location,
  size,
  promo_price,
  prelaunch_price,
  actual_price,
  title,
  type,
  description,
  sub_form,
  media,
  phase,
  scheme,
  total_plots,
  sold_plots
)
SELECT 
  'Hampton Ville Estate Phase 2' AS name,
  location,
  300 AS size,
  2500000 AS promo_price,
  NULL AS prelaunch_price,
  NULL AS actual_price,
  title,
  type,
  description,
  sub_form,
  media,
  2 AS phase,
  scheme,
  20 AS total_plots,
  0 AS sold_plots
FROM public.estate
WHERE name = 'Hampton Ville Estate'
LIMIT 1;
