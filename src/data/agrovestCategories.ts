export interface AgrovestCategory {
  slug: string;
  name: string;
  tag: 'Cash Crop' | 'Food Crop' | 'Livestock' | 'Facility';
  image: string;
  tagline: string;
  description: string;
  planting: string;
  weather: string;
  yieldHarvesting: string;
  marketing: string;
  profitSharing: string;
  benefits: string[];
}

export const agrovestCategories: AgrovestCategory[] = [
  {
    slug: 'oil-palm',
    name: 'Oil Palm Plantation',
    tag: 'Cash Crop',
    image: '/lovable-uploads/agrovest-oil-palm-plantation.jpg',
    tagline: "Nigeria's most established cash crop, in high year-round demand.",
    description:
      "Oil palm is the backbone of Bridgefort Agrovest's cash crop division, already under cultivation across a significant portion of our estate. Each palm produces fresh fruit bunches used for palm oil, palm kernel oil and by-products, giving investors exposure to one of West Africa's most reliable agricultural commodities.",
    planting: 'Seedlings are raised in a nursery for 10–14 months before transplanting at a spacing of roughly 9m x 9m (triangular pattern), giving each palm room for full canopy development. Young palms are inter-cropped with food crops in their first 2–3 years to maximize land use while the palms mature.',
    weather: 'Oil palm thrives in Ogun State\'s humid tropical climate, needing consistent rainfall (1,800–2,500mm annually) and temperatures between 24°C–32°C. Our farm managers monitor rainfall patterns and supplement with irrigation during the dry season to protect yield.',
    yieldHarvesting: 'Palms begin fruiting from the 3rd–4th year, reaching full maturity by year 7–8, and can remain productive for 25+ years. Fresh fruit bunches are harvested every 10–15 days year-round once mature, giving a steady, non-seasonal income stream.',
    marketing: 'Harvested bunches are processed on-site or through partner mills into crude palm oil and kernel oil, then sold to local processors, wholesalers and food manufacturers — a market with consistently strong local demand.',
    profitSharing: 'Oil palm revenue feeds directly into your Agrovest profit-share plan: 10–20% in Year 1, rising to 40–50% in Years 4–5 as the plantation matures and yields increase.',
    benefits: [
      'One of the most climate-suited cash crops for Ogun State',
      'Multiple revenue streams: crude oil, kernel oil, biomass',
      '25+ year productive lifespan per palm',
      'Strong, stable local market demand',
    ],
  },
  {
    slug: 'cocoa',
    name: 'Cocoa Plantation',
    tag: 'Cash Crop',
    image: '/lovable-uploads/agrovest-cocoa-plantation.jpg',
    tagline: 'A globally traded export crop with strong foreign-exchange value.',
    description:
      'Cocoa is grown under partial shade within our estate, producing the pods that are fermented and dried into the raw material for chocolate and cocoa products traded on international markets.',
    planting: 'Cocoa seedlings are nursed for 4–6 months, then transplanted under temporary shade trees at approximately 3m x 3m spacing. Shade management is critical in the early years to protect young trees from direct sun and wind.',
    weather: 'Cocoa needs a warm, humid environment with 1,500–2,000mm of well-distributed rainfall and temperatures of 21°C–32°C, with no prolonged dry spells — conditions our Ijebu-Ife location supports well.',
    yieldHarvesting: 'Trees begin bearing pods from year 3, with full production by year 5–7, and remain productive for 25–30 years. Pods are harvested twice yearly during the main and light crop seasons, then fermented and sun-dried before sale.',
    marketing: 'Dried beans are sold to licensed buying agents and export processors, benefiting from cocoa\'s globally traded pricing and consistent export demand from Nigeria\'s cocoa corridor.',
    profitSharing: 'Cocoa income is pooled into the same annual profit-share structure — 10–20% Year 1, climbing toward 40–50% by Years 4–5 as trees reach full bearing capacity.',
    benefits: [
      'Export-grade commodity with global pricing exposure',
      'Long productive lifespan (25–30 years per tree)',
      'Twice-yearly harvest cycle',
      'Strong existing buyer network in Nigeria',
    ],
  },
  {
    slug: 'rubber',
    name: 'Rubber Plantation',
    tag: 'Cash Crop',
    image: '/lovable-uploads/agrovest-rubber-plantation.jpg',
    tagline: 'A steady-tapping industrial crop with daily income potential.',
    description:
      'Our rubber trees are tapped for latex, the raw material behind tyres, gloves, footwear and countless industrial products — one of the few crops that can generate near-daily cash flow once mature.',
    planting: 'Budded rubber stumps are planted at roughly 3m x 6m spacing to allow room for tapping panels and access paths. Trees are left undisturbed for their first several years to build girth ahead of tapping.',
    weather: 'Rubber prefers consistent warmth (25°C–30°C) and evenly distributed rainfall above 1,800mm annually, with minimal strong winds — our estate\'s sheltered plots are well suited to this.',
    yieldHarvesting: 'Trees are ready for tapping from year 6–7, and can be tapped on rotation (alternate days) for 25+ years. Latex is collected each tapping morning and coagulated into sheets or block rubber for sale.',
    marketing: 'Processed latex/rubber sheets are sold to industrial rubber processors and exporters, with pricing linked to global rubber markets.',
    profitSharing: 'Once tapping begins, rubber contributes to the standard Agrovest profit-share schedule, with returns strengthening from Year 4 onward as more trees come into full tapping rotation.',
    benefits: [
      'Near-daily latex collection once mature',
      '25+ year productive tapping life',
      'Industrial demand independent of food markets',
      'Diversifies your portfolio beyond food/cash food crops',
    ],
  },
  {
    slug: 'cassava',
    name: 'Cassava Farm',
    tag: 'Food Crop',
    image: '/lovable-uploads/agrovest-cassava-farm.jpg',
    tagline: 'A fast-cycling staple crop with dependable local demand.',
    description:
      'Cassava is one of our core food crops, grown for both direct consumption and processing into garri, fufu, flour and starch — staples with year-round demand across Nigeria.',
    planting: 'Stem cuttings are planted directly into ridges or ploughed beds at the start of the rains, spaced roughly 1m x 1m apart. Weeding is carried out in the first 3–4 months while the crop canopy closes.',
    weather: 'Cassava is a hardy, drought-tolerant crop, doing well with 1,000–1,500mm of rainfall and temperatures between 25°C–29°C, making it a resilient complement to our more rainfall-sensitive cash crops.',
    yieldHarvesting: 'Roots mature and are ready for harvest 9–12 months after planting, though they can be left in the ground longer as a "living store". Harvesting is done by hand-lifting or ridging equipment.',
    marketing: 'Fresh tubers and processed products (garri, flour) are sold through local markets, processors and our own value-addition line, tapping into one of Nigeria\'s largest staple food markets.',
    profitSharing: "Cassava's short cycle allows quicker turnover within your plot's Year 1 harvest cycle, feeding into the annual profit-share payment for that period.",
    benefits: [
      'Matures in under a year — faster cash cycle',
      'Drought-tolerant, resilient staple crop',
      'Multiple product forms: fresh, garri, flour, starch',
      'Consistent, large domestic market',
    ],
  },
  {
    slug: 'ginger',
    name: 'Ginger Plantation',
    tag: 'Cash Crop',
    image: '/lovable-uploads/agrovest-ginger-plantation.jpg',
    tagline: 'A high-value spice crop with strong export interest.',
    description:
      "Ginger is grown as a high-value cash crop on our estate, prized both locally as a spice and medicinal root, and internationally as an export commodity with rising global demand.",
    planting: 'Disease-free rhizomes are planted at the onset of rains in well-drained, loose soil, spaced about 25cm x 30cm apart, typically under light mulch to retain soil moisture.',
    weather: 'Ginger favours warm, humid conditions (20°C–30°C) with well-distributed rainfall of 1,500–2,000mm, and requires good drainage to prevent rhizome rot.',
    yieldHarvesting: 'Ginger is ready for harvest 8–10 months after planting, once the leaves begin yellowing and drying — rhizomes are carefully hand-lifted to avoid damage.',
    marketing: 'Fresh and dried ginger are sold into local spice markets, food processors, and export channels, where Nigerian ginger commands strong demand for its high oil and pungency content.',
    profitSharing: 'As a fast-cycling cash crop, ginger contributes to your plot\'s early-year returns, complementing longer-maturing tree crops in the overall profit-share plan.',
    benefits: [
      'High value-per-hectare among food/cash crops',
      'Strong export and pharmaceutical-sector demand',
      'Under-a-year harvest cycle',
      'Diversifies income timing across your investment term',
    ],
  },
  {
    slug: 'lemon',
    name: 'Lemon Orchard',
    tag: 'Cash Crop',
    image: '/lovable-uploads/agrovest-lemon-plantation.jpg',
    tagline: 'A citrus orchard crop with reliable, repeat-harvest income.',
    description:
      "Our lemon orchard adds citrus diversity to the estate, producing fruit valued fresh, for juice concentrate, and for essential oils — an orchard crop that keeps bearing fruit year after year.",
    planting: 'Grafted lemon seedlings are transplanted at roughly 5m x 5m spacing to allow full canopy spread, with young trees supported and protected until established.',
    weather: 'Citrus trees do well in Ogun State\'s warm climate (22°C–30°C) with moderate, well-distributed rainfall; good drainage is essential to avoid root disease.',
    yieldHarvesting: 'Trees begin fruiting from year 3, reaching consistent full production by year 5, and remain productive for 20+ years. Fruit is hand-harvested across multiple flushes per year.',
    marketing: 'Fruit is sold fresh into local produce markets and to juice/beverage processors, with citrus consistently in demand across households and food & beverage manufacturers.',
    profitSharing: 'Lemon revenue is pooled into the standard Agrovest profit-share plan, strengthening as the orchard matures into its peak fruiting years.',
    benefits: [
      '20+ year productive orchard lifespan',
      'Multiple harvest flushes per year',
      'Fresh fruit and processed (juice/oil) market options',
      'Complements our other tree and food crops',
    ],
  },
  {
    slug: 'maize',
    name: 'Maize Plantation',
    tag: 'Food Crop',
    image: '/lovable-uploads/agrovest-maize-plantation.jpg',
    tagline: 'A fast, reliable staple grain with dual harvest seasons.',
    description:
      'Maize is grown as one of our principal food crops, feeding both the direct food market and our planned feed mill operations for the estate\'s livestock division.',
    planting: 'Seeds are directly sown at the start of the rains (and again for a second cropping where rainfall allows), spaced roughly 75cm between rows and 25cm within rows, with fertilizer application at planting and top-dressing.',
    weather: 'Maize grows well with 500–1,200mm of rainfall over its cycle and temperatures of 20°C–30°C, making it well suited to two planting seasons per year in our location.',
    yieldHarvesting: 'Maize matures in about 3–4 months, allowing up to two harvests per year. Cobs are harvested once dry, then shelled and stored or sold as grain.',
    marketing: 'Grain is sold into local food markets, millers and — increasingly — our own planned feed mill for poultry and livestock, keeping value within the estate.',
    profitSharing: 'With two possible harvests a year, maize offers one of the quickest-cycling contributions to your plot\'s profit-share income.',
    benefits: [
      'Up to two harvests per year',
      'Feeds both food markets and estate livestock operations',
      'Short 3–4 month cycle',
      'Well matched to local rainfall patterns',
    ],
  },
  {
    slug: 'farm-house',
    name: 'Farm House',
    tag: 'Facility',
    image: '/lovable-uploads/agrovest-farm-house.jpg',
    tagline: 'The operations base coordinating every plot on the estate.',
    description:
      'The farm house is the administrative and operational hub of Bridgefort Agrovest Estate — housing our farm management team, equipment, and record-keeping for every investor\'s plot.',
    planting: 'Not a planting division — the farm house instead coordinates planting schedules, input procurement (seedlings, fertilizer, agro-chemicals) and labour deployment across every cash crop, food crop and livestock section.',
    weather: 'Weather monitoring is coordinated from here — the farm management team tracks rainfall and seasonal forecasts to plan planting, irrigation and harvest windows across the whole estate.',
    yieldHarvesting: 'All harvest logistics — scheduling, collection, weighing and initial storage — are coordinated through the farm house before produce moves to processing or market.',
    marketing: 'Sales relationships, buyer contracts and pricing negotiations for the estate\'s produce are managed centrally from this facility.',
    profitSharing: 'As the coordination point for the whole estate, the farm house is what keeps every investor\'s profit-share calculation accurate, timely and transparent.',
    benefits: [
      'Centralized, professional farm management',
      'On-site equipment, storage and staff coordination',
      'Transparent record-keeping per investor plot',
      'Single point of contact for estate operations',
    ],
  },
  {
    slug: 'poultry',
    name: 'Poultry Farm',
    tag: 'Livestock',
    image: '/lovable-uploads/agrovest-poultry-farm.jpg',
    tagline: 'Fast-turnover livestock with some of the shortest cash cycles on the estate.',
    description:
      'Our poultry operation raises broilers and layers under controlled housing, one of the quickest ways to convert feed and management into marketable protein.',
    planting: 'Day-old chicks are sourced from reputable hatcheries and raised in climate-controlled pens, with vaccination and feeding schedules managed by our livestock team from day one.',
    weather: 'Housing is designed to buffer birds from Ogun State\'s heat and humidity, with ventilation and stocking density managed to reduce heat stress and disease risk.',
    yieldHarvesting: 'Broilers reach market weight in 6–8 weeks; layers begin egg production around 18–20 weeks and continue for over a year — giving both a quick-turnaround and a recurring income option.',
    marketing: 'Live birds, dressed poultry and eggs are sold into local markets, food vendors and retail outlets, with strong, consistent household demand for both products.',
    profitSharing: "Poultry's short production cycles make it one of the fastest contributors to your plot's livestock-sector profit-share income.",
    benefits: [
      'Broilers ready in as little as 6–8 weeks',
      'Layers provide a recurring egg income for over a year',
      'Strong, steady household demand',
      'Professionally managed housing and biosecurity',
    ],
  },
  {
    slug: 'fish',
    name: 'Fish Farm',
    tag: 'Livestock',
    image: '/lovable-uploads/agrovest-fish-farm.jpg',
    tagline: 'Pond-based catfish production for a high-demand protein market.',
    description:
      'Our fish farm raises catfish in professionally managed ponds, tapping into one of Nigeria\'s most popular protein sources with reliable market pull.',
    planting: 'Juvenile fingerlings are stocked into prepared, well-oxygenated ponds at managed densities, with water quality and feeding monitored daily by our aquaculture team.',
    weather: 'Ponds are managed to maintain stable water temperature and quality year-round; the fish farm water sourcing is designed to buffer against the dry season.',
    yieldHarvesting: 'Catfish typically reach harvestable size within 5–7 months of stocking, after which ponds are harvested, restocked and the cycle continues.',
    marketing: 'Live and processed (smoked) catfish are sold to local markets, restaurants and food processors — a protein with consistently strong urban demand.',
    profitSharing: 'Each stocking-to-harvest cycle feeds into your plot\'s livestock profit-share allocation, with multiple cycles possible across the 5-year investment term.',
    benefits: [
      'Harvestable in as little as 5–7 months',
      'High, steady local demand for catfish',
      'Multiple stocking cycles across your investment term',
      'Professionally managed water quality and feeding',
    ],
  },
  {
    slug: 'ruminants',
    name: 'Ruminants Farm',
    tag: 'Livestock',
    image: '/lovable-uploads/agrovest-ruminants-farm.jpg',
    tagline: 'Cattle, goat and sheep rearing for longer-term livestock returns.',
    description:
      'Our ruminants division raises cattle, goats and sheep on managed pasture and supplementary feed, adding a longer-horizon livestock option alongside our faster-cycling poultry and fish operations.',
    planting: 'Not applicable in the crop sense — animals are sourced from trusted breeders/markets and integrated into managed grazing paddocks with rotational grazing to protect pasture health.',
    weather: 'Paddocks and shelters are designed with Ogun State\'s wet and dry seasons in mind, ensuring animals have adequate shade, water and supplementary feed through the dry months.',
    yieldHarvesting: 'Goats and sheep typically reach market weight within 8–12 months; cattle take longer (18 months+) but command higher unit values — giving a mix of medium and longer-term livestock returns.',
    marketing: 'Livestock is sold live into local markets and to meat processors, particularly around festive and Sallah seasons when demand and prices rise.',
    profitSharing: "Ruminants contribute a longer-cycle, higher-unit-value stream to your plot's overall livestock profit-share allocation.",
    benefits: [
      'Higher per-unit value than poultry/fish',
      'Demand spikes around festive seasons',
      'Diversifies your livestock exposure by timeframe',
      'Managed grazing protects long-term pasture health',
    ],
  },
  {
    slug: 'processing-value-addition',
    name: 'Processing & Value Addition',
    tag: 'Facility',
    image: '/lovable-uploads/agrovest-processing-value-addition.jpg',
    tagline: "Turning raw harvests into higher-value, longer-shelf-life products.",
    description:
      'This is where Bridgefort Agrovest plans to convert raw farm produce — palm fruit, cassava, grains, fish — into higher-value products like palm oil, garri, flour and smoked fish, capturing more of the value chain for investors.',
    planting: 'Not a growing division — this facility processes what every other section of the estate produces, from oil extraction to drying, milling and packaging.',
    weather: 'Processing operations (drying, storage) are managed to reduce dependence on weather, protecting harvested produce from spoilage during the rainy season.',
    yieldHarvesting: "Throughput scales with the estate's harvest calendar — palm fruit processing runs near-continuously, while seasonal crops are processed in batches after harvest.",
    marketing: 'Processed, packaged products carry higher margins and longer shelf life than raw produce, opening up wholesale, retail and export marketing channels beyond what raw crops alone allow.',
    profitSharing: "As this capacity comes online, it's designed to increase the overall profitability of the estate — directly supporting the higher 40–50% profit-share ranges targeted in Years 4 and 5.",
    benefits: [
      'Captures more value from the same raw harvest',
      'Extends shelf life, reducing post-harvest losses',
      'Opens wholesale, retail and export channels',
      'Key to Bridgefort Agrovest\'s long-term profitability plan',
    ],
  },
];

export const getAgrovestCategory = (slug: string) =>
  agrovestCategories.find((c) => c.slug === slug);
