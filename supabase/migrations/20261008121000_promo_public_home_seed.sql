-- Promo campaign periods, public Home visibility, and approved 2026 campaign seeds.
alter table public.bh_realtor_promotions
  alter column ends_at drop not null;

alter table public.bh_realtor_promotions
  add column if not exists campaign_period_label text;

drop policy if exists "BH Realtors can read published promotions" on public.bh_realtor_promotions;
drop policy if exists "Public can read published promotions" on public.bh_realtor_promotions;

create policy "Public can read published promotions"
on public.bh_realtor_promotions
for select
to anon, authenticated
using (status = 'published');

insert into public.bh_realtor_promotions
  (title, slug, summary, content, terms_and_conditions, image_url, starts_at, ends_at, campaign_period_label, status, display_order)
values
(
  'Bridgefort Homes Nigeria @ 66th — Independence Day Promo',
  'independence-day-promo-fountain-crest-gardens',
  'Celebrate Nigeria''s Independence in grand style by securing your future with Bridgefort Homes Development Ltd. Get 450sqm at ₦1M instead of the ₦2.5M actual price, with a ₦1M documentation fee. Strictly for the first 15 subscribers.',
  'Celebrate Nigeria''s Independence in grand style by securing your future with Bridgefort Homes Development Ltd! 🇳🇬🏡

Take advantage of our massive 60% Independence Day Promo at Fountain Crest Gardens, located at Alapoti, Lusada-Agbara, Ogun State.

Promo Price: ₦1,000,000 / 450sqm
Actual Price: ₦2,500,000
Documentation Fee: ₦1,000,000
Availability: Strictly the first 15 subscribers only.

Enjoy close proximity to major landmarks:
• Badagry Expressway
• Lagos State University of Education
• OPIC Estate
• Agbara-Lusada Express Road
• Crawford University
• Lusada Market

Don''t miss this opportunity to own prime real estate at a promotional price.',
  'Promotion terms shown in the approved campaign material: the promotional price is ₦1,000,000 for 450sqm, actual price is ₦2,500,000, documentation fee is ₦1,000,000, and availability is strictly limited to the first 15 subscribers. Campaign is tied to Nigeria''s 66th Independence Day on 1 October 2026. No campaign expiry date was supplied in the approved material; do not infer or promise an expiry date. Current availability and campaign status must always be confirmed from the live promotion record.',
  '/promo/independence-day-promo-fountain-crest.webp',
  '2026-10-01T00:00:00+01:00',
  null,
  'Independence Day Promo 2026',
  'published',
  1
),
(
  'MBER Months Promo — Invest More. Live Better.',
  'mber-months-promo-2026',
  'Bring a client or make a complete payment deposit and receive the applicable MBER Months package shown in the approved campaign flyer.',
  'MBER MONTHS PROMO
Invest More. Live Better.

Bring a client or make a complete payment deposit and get your package.

Offer tiers shown in the approved campaign flyer:
• ₦100,000 – ₦400,000: MBER Month Pack
• ₦500,000 – ₦900,000: 5kg Rice + Vegetable Oil
• ₦1,000,000 – ₦2,000,000: 10kg Rice + Vegetable Oil
• ₦3,000,000 – ₦4,000,000: 25kg Rice + 5 Litres Vegetable Oil
• ₦5,000,000 and above: 50kg Rice + 5 Litres Vegetable Oil + Sachet Maggi + Tomatoes

Payment information displayed on the approved flyer:
Zenith Bank
Account: 1312214947
Account Name: Bridgefort Homes Development Ltd.

The flyer also states: Terms and Conditions Apply.',
  'The MBER Months offer tiers and payment information above are reproduced from the approved campaign flyer. The flyer states that terms and conditions apply but does not provide a full legal terms text or exact campaign start/end dates. Do not invent missing campaign dates or additional legal conditions. Current campaign status and availability must be confirmed from the live promotion record and authorised Bridgefort information.',
  '/promo/mber-months-promo-2026.webp',
  '2026-10-01T00:00:00+01:00',
  null,
  'MBER Months Promo 2026',
  'published',
  2
)
on conflict (slug) do update set
  title = excluded.title,
  summary = excluded.summary,
  content = excluded.content,
  terms_and_conditions = excluded.terms_and_conditions,
  image_url = excluded.image_url,
  starts_at = excluded.starts_at,
  ends_at = excluded.ends_at,
  campaign_period_label = excluded.campaign_period_label,
  status = excluded.status,
  display_order = excluded.display_order,
  updated_at = now();
