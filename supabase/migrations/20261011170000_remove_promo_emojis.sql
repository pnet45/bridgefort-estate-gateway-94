-- Remove decorative emojis from the existing Independence Day promotion copy.
-- Keep the campaign facts and all commercial terms unchanged.
UPDATE public.bh_realtor_promotions
SET content = replace(
  replace(content, '🇳🇬', ''),
  '🏡',
  ''
),
updated_at = now()
WHERE slug = 'independence-day-promo-fountain-crest-gardens'
  AND content LIKE '%🇳🇬%';
