export type AgrovestCategory = {
  slug: string;
  name: string;
  img: string;
  kind: 'crop' | 'facility';
  tagline: string;
  description: string;
  benefits: string[];
};

export const agrovestCategories: AgrovestCategory[] = [
  {
    slug: 'oil-palm-plantation',
    name: 'Oil Palm Plantation',
    img: '/lovable-uploads/agrovest-oil-palm-plantation.jpg',
    kind: 'crop',
    tagline: 'Nigeria\'s highest-demand cash crop.',
    description: 'Oil palm produces palm oil and palm kernel oil — staples in food, cosmetics and biofuel. A single mature plantation continues yielding fruit for 25+ years, providing decades of stable, recurring income.',
    benefits: [
      'Long productive life span (25+ years)',
      'High local + export demand',
      'Multiple revenue streams (oil, kernel, biomass)',
      'Government-backed price stability',
    ],
  },
  {
    slug: 'cocoa-plantation',
    name: 'Cocoa Plantation',
    img: '/lovable-uploads/agrovest-cocoa-plantation.jpg',
    kind: 'crop',
    tagline: 'Nigeria\'s leading foreign-exchange crop.',
    description: 'Cocoa beans supply the global chocolate and confectionery industry. Prices are dollar-denominated on international markets, giving investors natural FX protection.',
    benefits: ['USD-linked prices', 'Export-ready market', 'High margin per hectare', 'Two harvest cycles per year'],
  },
  {
    slug: 'rubber-plantation',
    name: 'Rubber Plantation',
    img: '/lovable-uploads/agrovest-rubber-plantation.jpg',
    kind: 'crop',
    tagline: 'Industrial staple with 30-year yield.',
    description: 'Natural rubber feeds tyre, medical and industrial manufacturing worldwide. Once tapped, a rubber tree produces latex daily for decades.',
    benefits: ['Daily tapping income', '30-year productive lifespan', 'Global industrial demand', 'Low volatility'],
  },
  {
    slug: 'cassava-farm',
    name: 'Cassava Farm',
    img: '/lovable-uploads/agrovest-cassava-farm.jpg',
    kind: 'crop',
    tagline: 'Fast-cycle food security crop.',
    description: 'Cassava matures in 9–12 months and supplies garri, fufu, starch, ethanol and animal feed. It is drought resistant and delivers quick returns.',
    benefits: ['Short harvest cycle', 'Multiple end products', 'Drought resistant', 'Strong domestic demand'],
  },
  {
    slug: 'ginger-plantation',
    name: 'Ginger Plantation',
    img: '/lovable-uploads/agrovest-ginger-plantation.jpg',
    kind: 'crop',
    tagline: 'High-value export spice.',
    description: 'Nigerian ginger is prized globally for its potency. Buyers in Europe, Asia and North America pay premium prices for dried, sliced and powdered ginger.',
    benefits: ['Premium export prices', 'Compact yield per hectare', 'Rising global demand', 'Long shelf life'],
  },
  {
    slug: 'lemon-plantation',
    name: 'Lemon Plantation',
    img: '/lovable-uploads/agrovest-lemon-plantation.jpg',
    kind: 'crop',
    tagline: 'Year-round citrus income.',
    description: 'Lemons yield fresh fruit, juice concentrate and essential oil. Trees start producing in year 3 and continue for 20+ years.',
    benefits: ['Multi-product value chain', 'Year-round harvest', 'Long tree lifespan', 'Local + export markets'],
  },
  {
    slug: 'maize-plantation',
    name: 'Maize Plantation',
    img: '/lovable-uploads/agrovest-maize-plantation.jpg',
    kind: 'crop',
    tagline: 'Nigeria\'s #1 staple grain.',
    description: 'Maize is the backbone of animal feed, flour and starch industries. Fast 90–120 day cycles allow two crops per year.',
    benefits: ['Two harvests annually', 'Guaranteed buyers', 'Rapid capital turnover', 'Feed + food demand'],
  },
  {
    slug: 'farm-house',
    name: 'Modern Farmhouse',
    img: '/lovable-uploads/agrovest-farm-house.jpg',
    kind: 'facility',
    tagline: 'Operational hub of the estate.',
    description: 'On-site farmhouse accommodating supervisors, agronomists and security teams. Ensures 24/7 monitoring and rapid response to farm needs.',
    benefits: ['Round-the-clock supervision', 'Immediate incident response', 'Reduces theft/losses', 'Improves productivity'],
  },
  {
    slug: 'poultry-farm',
    name: 'Poultry Farm',
    img: '/lovable-uploads/agrovest-poultry-farm.jpg',
    kind: 'facility',
    tagline: 'Daily egg + broiler revenue.',
    description: 'Modern deep-litter and battery-cage poultry systems producing table eggs and broilers. Ready market across Ogun and Lagos.',
    benefits: ['Daily cash flow from eggs', '6–8 week broiler cycle', 'High local demand', 'Manure supports crops'],
  },
  {
    slug: 'fish-farm',
    name: 'Fish Farm',
    img: '/lovable-uploads/agrovest-fish-farm.jpg',
    kind: 'facility',
    tagline: 'Aquaculture with fast turnover.',
    description: 'Catfish and tilapia ponds using recirculating and earthen systems. Stock matures in 5–6 months with strong wholesale demand.',
    benefits: ['5–6 month cycles', 'Premium fresh-fish market', 'High protein conversion', 'Low land footprint'],
  },
  {
    slug: 'ruminants-farm',
    name: 'Ruminants Farm',
    img: '/lovable-uploads/agrovest-ruminants-farm.jpg',
    kind: 'facility',
    tagline: 'Cattle, goats & sheep.',
    description: 'Managed grazing and pen systems for cattle, goats and sheep. Provides meat, milk and hides — with seasonal price surges during festivals.',
    benefits: ['Festival price premiums', 'Meat + dairy + hides', 'Appreciating live-weight asset', 'Diversifies risk'],
  },
  {
    slug: 'processing-value-addition',
    name: 'Processing & Value Addition',
    img: '/lovable-uploads/agrovest-processing-value-addition.jpg',
    kind: 'facility',
    tagline: 'Turn raw produce into premium products.',
    description: 'Milling, drying, packaging and cold-storage facilities that convert farm output into higher-margin retail-ready products.',
    benefits: ['2–5× margin uplift', 'Extends shelf life', 'Access to retail channels', 'Reduces post-harvest loss'],
  },
];

export const getAgrovestCategory = (slug: string) =>
  agrovestCategories.find((c) => c.slug === slug);
