
-- Insert fallback blog/news posts to match those from fallbackBlogPosts.ts

-- Use the IDs "1", "2", "3" (strings). We'll use gen_random_uuid() and update fallback data if you want IDs to match.
-- Here, we'll insert 3 posts similar to the fallback ones, with rich content.

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
values
(
  '1',
  'Success Summit 2025 - Gearing Up for the Next Real Estate Revolution',
  '<p>The annual Success Summit returns in May 2025, bigger than ever and live in Port Harcourt! Join top industry leaders, motivational speakers, and real estate professionals in an immersive event designed to inspire and equip you for the next wave of property opportunities in Nigeria.</p>
  <h2>Summit Highlights</h2>
  <ul>
    <li>Panel sessions with real estate titans</li>
    <li>Masterclasses on property acquisition, legal security, and real estate tech</li>
    <li>Networking with investors, developers, and successful agents</li>
    <li>Special sessions for first-time buyers and young entrepreneurs</li>
  </ul>
  <h2>How to Attend</h2>
  <p>Registration is now open! Don’t miss your seat at the 2025 Success Summit. Whether you’re an agent, an investor, or simply curious about real estate, this event will give you the latest strategies to grow and succeed in the dynamic Nigerian market.</p>',
  'Join us for an unforgettable experience at the MAY 2025 SUCCESS SUMMIT — LIVE in Port Harcourt with industry leaders and experts.',
  (select id from public.profiles where first_name = 'Dalvin' and last_name = 'Silva' limit 1),
  '/lovable-uploads/e96b32e6-88d0-4155-8c87-cbe499a239d3.png',
  'Training Events',
  true,
  'success-summit-2025-gearing-up'
),

(
  '2',
  'Estate Inspection Day - Exploring Our Newest Developments',
  '<p>Get an exclusive opportunity to tour our latest estate projects! From green, secure neighborhoods to luxury waterfront apartments, our Inspection Day will help you explore property options that match your ambition and budget.</p>
  <h2>What You’ll See</h2>
  <ul>
    <li>Guided tours with our expert property consultants</li>
    <li>Early access to newly opened blocks and investment plans</li>
    <li>On-site negotiation and instant reservation options</li>
    <li>Free legal and investment advice for all attendees</li>
  </ul>
  <p>Whether you want to buy, invest, or just learn, Estate Inspection Day is perfect for you and your family. RSVP to reserve your slots!</p>',
  'Explore our newest estates with our expert team. See firsthand the investment opportunities awaiting you.',
  (select id from public.profiles where first_name = 'Precious' and last_name = 'Silva' limit 1),
  '/lovable-uploads/8038c999-40e2-49bf-afec-2cb0b5bc2c14.png',
  'Estate News',
  true,
  'estate-inspection-day'
),

(
  '3',
  'Masterclass: Real Estate Sales Strategies for 2025',
  '<p>This powerful masterclass reveals proven sales techniques from top performers in our network, aimed at both new and seasoned professionals. In 2025, the property market is more competitive—gain the edge with expert-backed strategies designed for today’s buyer and investor psyche.</p>
  <h2>Topics Include</h2>
  <ul>
    <li>Navigating digital sales channels</li>
    <li>Building trust and credibility with clients</li>
    <li>Legal and finance basics for sales agents</li>
    <li>Turning site visits into signed deals</li>
  </ul>
  <p>You will leave with actionable skills, a copy of our exclusive sales strategy eBook, and a network of motivated realtors ready to collaborate! Register early as seats fill up quickly.</p>',
  'Learn cutting-edge sales techniques from our top performers in this intensive masterclass designed for both beginners and professionals.',
  (select id from public.profiles where first_name = 'Gideon' and last_name = 'Vincent' limit 1),
  '/lovable-uploads/796b8bc3-c103-4ea9-bc00-f5ccc19ab812.png',
  'Training Events',
  true,
  'masterclass-real-estate-sales-strategies-2025'
);
