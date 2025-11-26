-- Insert the Sales Master Class 2025 training event
INSERT INTO training_events (
  title,
  description,
  date,
  time,
  location,
  image,
  capacity,
  category,
  featured
) VALUES (
  'SALES MASTER CLASS 2025',
  '10 Strategies for Generating Leads, Prospects & Customers - Come and learn the strategies for converting leads to customers and closing consistent deals. Speaker: Dalvin Silva, PhD (MD/CEO PWAN Bridgefort). Hosts: Ambassador Emeka Nwalozie, Ambassador Leonard Izuegbu.',
  '2025-11-25',
  '10:00 AM',
  'BRIDGEFORT PBO REALTORS CENTRE (PWAN BRIDGEFORT ESTATES), SUITE B, RIGHT WING, GACOUN PLAZA, OPPOSITE K CLOSE, 23 ROAD, FESTAC TOWN, LAGOS',
  '/lovable-uploads/sales-master-class-2025.jpeg',
  'Unlimited',
  'Sales Training',
  true
) ON CONFLICT DO NOTHING;