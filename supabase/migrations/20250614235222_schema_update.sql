
-- Insert a Monday Motivation post by Dalvin Silva into the posts table
insert into public.posts (
  id,
  title,
  content,
  excerpt,
  author_id,
  image_path,
  category,
  published,
  slug
)
values (
  gen_random_uuid(),
  'New Week, Fresh Listings, Fresh Leads',
  'Lagos never sleeps, and neither do we. Lets turn site visits into signed deals. Stay sharp, stay selling.',
  'New week, fresh listings, fresh leads! Lagos never sleeps, and neither do we. Lets turn site visits into signed deals.',
  -- Find Dalvin Silva's UUID from the profiles table and PUT IT HERE (replace below)
  (select id from public.profiles where first_name = 'Dalvin' and last_name = 'Silva' limit 1),
  '/lovable-uploads/774f5bb1-3f2f-4c91-9149-9c6facac4756.png',
  'Monday Motivation',
  true,
  'new-week-fresh-listings-fresh-leads'
),
(
  gen_random_uuid(),
  'Rise and Grind: Real Estate Waits for No One',
  'It''s Monday – let''s show up and close strong. In real estate, consistent action and persistent follow-up are the keys to success in this competitive market.',
  'Rise and grind: Real estate waits for no one. Show up and close strong.',
  (select id from public.profiles where first_name = 'Dalvin' and last_name = 'Silva' limit 1),
  '/lovable-uploads/f01a111e-6d07-4fa5-9b33-b646f096419a.png',
  'Monday Motivation',
  true,
  'rise-and-grind-real-estate-waits-for-no-one'
);
