-- Approved public Leo knowledge for the 2026 Bridgefort promotion campaigns.
-- No secrets or private client records are stored here.

insert into public.leo_knowledge_documents
  (title, source_url, audience, topics, status, content, metadata, allowed_roles)
values
(
  'Bridgefort Homes — Independence Day Promo 2026 — Fountain Crest Gardens',
  'https://www.bridgeforthomes.com/bh-realtors/promotions/independence-day-promo-fountain-crest-gardens',
  'public',
  array['promotions','independence-day','fountain-crest-gardens','real-estate','bh-realtors'],
  'published',
  'Bridgefort Homes Nigeria @ 66th — Independence Day Promo. Campaign date context: Nigeria''s 66th Independence Day is 1 October 2026. Property: Fountain Crest Gardens. Location: Alapoti, Lusada-Agbara, Ogun State. Promo: 60% Independence Day Promo. Promo price: ₦1,000,000 for 450sqm. Actual price: ₦2,500,000. Documentation fee: ₦1,000,000. Availability: strictly the first 15 subscribers only. Listed nearby landmarks: Badagry Expressway; Lagos State University of Education; OPIC Estate; Agbara-Lusada Express Road; Crawford University; Lusada Market. Marketing message: Celebrate Nigeria''s Independence in grand style by securing your future with Bridgefort Homes Development Ltd. The approved campaign material does not state an expiry date. Leo must not invent an expiry date. For current status, availability and campaign terms, use the live promotion record and authorised Bridgefort information as the higher authority.',
  jsonb_build_object('campaign_period_label','Independence Day Promo 2026','live_record_override',true,'expiry_date_supplied',false,'campaign_date','2026-10-01'),
  array[]::text[]
),
(
  'Bridgefort Homes — MBER Months Promo 2026',
  'https://www.bridgeforthomes.com/bh-realtors/promotions/mber-months-promo-2026',
  'public',
  array['promotions','mber-months','bh-realtors','campaign'],
  'published',
  'MBER Months Promo — Invest More. Live Better. Approved flyer offer tiers: ₦100,000–₦400,000 → MBER Month Pack; ₦500,000–₦900,000 → 5kg Rice + Vegetable Oil; ₦1,000,000–₦2,000,000 → 10kg Rice + Vegetable Oil; ₦3,000,000–₦4,000,000 → 25kg Rice + 5 Litres Vegetable Oil; ₦5,000,000 and above → 50kg Rice + 5 Litres Vegetable Oil + Sachet Maggi + Tomatoes. Flyer message: bring a client or make a complete payment deposit and get your package. Payment information displayed on the approved flyer: Zenith Bank, account 1312214947, account name Bridgefort Homes Development Ltd. The flyer states Terms and Conditions Apply but does not provide a full legal terms text or exact campaign start/end dates. Leo must not invent missing dates or additional legal conditions. Current campaign status and offer availability must be confirmed from the live promotion record and authorised Bridgefort information.',
  jsonb_build_object('campaign_period_label','MBER Months Promo 2026','live_record_override',true,'exact_dates_supplied',false),
  array[]::text[]
);

insert into public.leo_knowledge_chunks (document_id, chunk_index, heading, content)
select id, 0, 'Independence Day Promo 2026', content
from public.leo_knowledge_documents
where title = 'Bridgefort Homes — Independence Day Promo 2026 — Fountain Crest Gardens'
on conflict (document_id, chunk_index) do update set heading = excluded.heading, content = excluded.content;

insert into public.leo_knowledge_chunks (document_id, chunk_index, heading, content)
select id, 0, 'MBER Months Promo 2026', content
from public.leo_knowledge_documents
where title = 'Bridgefort Homes — MBER Months Promo 2026'
on conflict (document_id, chunk_index) do update set heading = excluded.heading, content = excluded.content;
