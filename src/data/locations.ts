export interface LocationData {
  slug: string;
  name: string;
  state: string;
  region: string;
  heroTitle: string;
  metaTitle: string;
  metaDescription: string;
  intro: string;
  whyInvest: string[];
  popularEstates: string[];
  nearbyCommunities: string[];
  priceRange: string;
  roiNote: string;
  faqs: { q: string; a: string }[];
}

export const locations: LocationData[] = [
  {
    slug: 'asaba-delta',
    name: 'Asaba',
    state: 'Delta State',
    region: 'South-South Nigeria',
    heroTitle: 'Land for Sale in Asaba, Delta State',
    metaTitle: 'Land for Sale in Asaba, Delta State | Bridgefort Homes',
    metaDescription: 'Buy verified, titled land for sale in Asaba, Delta State. Affordable estate plots in Okpanam, Ibusa, Issele-Azagba & more with flexible payment plans.',
    intro: 'Asaba, the capital of Delta State, is one of Nigeria\'s fastest-growing investment hubs. Bridgefort Homes offers verified, titled estate land along key Asaba growth corridors with flexible payment plans.',
    whyInvest: [
      'Capital of Delta State with active government infrastructure spending',
      'Proximity to Onitsha commercial hub via the Niger Bridge',
      'Lower entry prices than Lagos with comparable appreciation',
      'Strong demand from Diaspora and South-East returnees',
    ],
    popularEstates: ['Okpanam Axis', 'Ibusa Road Corridor', 'Issele-Azagba', 'Summit Road'],
    nearbyCommunities: ['Okpanam', 'Ibusa', 'Issele-Azagba', 'Ogwashi-Uku', 'Onitsha (Anambra)'],
    priceRange: '₦1.5M – ₦8M per plot',
    roiNote: 'Estimated 15–25% annual appreciation in prime Asaba corridors.',
    faqs: [
      { q: 'Is land in Asaba a good investment?', a: 'Yes — Asaba combines capital-city status with sub-Lagos pricing, giving strong appreciation potential.' },
      { q: 'What documents come with Bridgefort Asaba land?', a: 'Deed of Assignment, Survey Plan, Receipt and (where applicable) C of O or Governor\'s Consent.' },
    ],
  },
  {
    slug: 'ibeju-lekki-lagos',
    name: 'Ibeju-Lekki',
    state: 'Lagos State',
    region: 'South-West Nigeria',
    heroTitle: 'Land for Sale in Ibeju-Lekki, Lagos',
    metaTitle: 'Land for Sale in Ibeju-Lekki Lagos | Bridgefort Homes',
    metaDescription: 'Verified estate land for sale in Ibeju-Lekki, Lagos. Plots near Dangote Refinery, Lekki Free Trade Zone & Lekki Deep Sea Port with flexible payments.',
    intro: 'Ibeju-Lekki is Lagos\' premier investment frontier — home to the Dangote Refinery, Lekki Free Trade Zone, and the new Deep Sea Port. Bridgefort Homes secures titled plots in the path of growth.',
    whyInvest: [
      'Anchored by Dangote Refinery and Lekki Deep Sea Port',
      'Proposed Lekki–Epe Airport within the corridor',
      'Highest 5-year ROI of any Lagos sub-market',
      'Government-backed Free Trade Zone employment magnet',
    ],
    popularEstates: ['Lekki Free Trade Zone Axis', 'Eleko', 'Akodo', 'Okun-Ajah Extension'],
    nearbyCommunities: ['Eleko', 'Akodo', 'Lakowe', 'Awoyaya', 'Sangotedo'],
    priceRange: '₦3M – ₦25M per plot',
    roiNote: 'Plots near Dangote Refinery have appreciated 300%+ in 5 years.',
    faqs: [
      { q: 'Is Ibeju-Lekki land safe to buy?', a: 'Yes, when bought through verified developers with government-issued titles. Bridgefort only sells excised, gazetted or registered land.' },
    ],
  },
  {
    slug: 'epe-lagos',
    name: 'Epe',
    state: 'Lagos State',
    region: 'South-West Nigeria',
    heroTitle: 'Land for Sale in Epe, Lagos',
    metaTitle: 'Affordable Land for Sale in Epe, Lagos | Bridgefort Homes',
    metaDescription: 'Buy affordable estate land in Epe, Lagos with C of O & gazette. Strategic plots near the Lekki–Epe expressway and proposed Lekki Airport.',
    intro: 'Epe offers the most affordable entry into the Lagos property market while sitting directly on the Lekki–Epe expansion corridor. Ideal for land bankers and first-time investors.',
    whyInvest: [
      'Cheapest titled Lagos land per square metre',
      'Proposed Lekki–Epe International Airport within proximity',
      'Lagos State Government investment in tourism (Epe Marina)',
      'Pan-African University and Yaba Tech Epe campus driving demand',
    ],
    popularEstates: ['Poka', 'Itoikin Road', 'Epe Town', 'Agbowa Axis'],
    nearbyCommunities: ['Poka', 'Itoikin', 'Ketu-Epe', 'Agbowa', 'Ijebu-Ode (Ogun)'],
    priceRange: '₦800K – ₦5M per plot',
    roiNote: 'Land bank target: 200%+ over 5–7 years as Lekki sprawl reaches Epe.',
    faqs: [
      { q: 'Is Epe land titled?', a: 'Bridgefort Epe estates come with Deed, Survey and gazette documentation; selected estates have C of O.' },
    ],
  },
  {
    slug: 'ode-omi-lagos',
    name: 'Ode-Omi',
    state: 'Lagos State',
    region: 'South-West Nigeria',
    heroTitle: 'Land for Sale in Ode-Omi, Lagos',
    metaTitle: 'Land for Sale in Ode-Omi Lagos | Bridgefort Homes Estate',
    metaDescription: 'Premium beach-corridor estate land in Ode-Omi, Lagos. Verified plots with flexible payment plans from Bridgefort Homes.',
    intro: 'Ode-Omi sits on the Lekki–Epe coastal expansion belt — a premium beach-corridor address with massive land-banking upside. Bridgefort\'s flagship Ode-Omi estate offers verified plots with flexible payments.',
    whyInvest: [
      'Direct access to the Atlantic coastline',
      'On the Lekki Free Zone southern expansion path',
      'Tourism + residential dual-use potential',
      'Limited supply of titled coastal Lagos land',
    ],
    popularEstates: ['Bridgefort Ode-Omi Estate', 'Lekki Coastal Belt'],
    nearbyCommunities: ['Eleko', 'Akodo', 'Folu Ise', 'Eleko Beach'],
    priceRange: '₦1.5M – ₦10M per plot',
    roiNote: 'Coastal plots typically outperform inland Lagos land by 1.5–2x over 5 years.',
    faqs: [
      { q: 'Where exactly is Ode-Omi?', a: 'Ode-Omi is on the Lekki–Epe coastal axis, accessible from the Lekki–Epe Expressway via Eleko junction.' },
    ],
  },
  {
    slug: 'agbara-ogun',
    name: 'Agbara',
    state: 'Ogun State',
    region: 'South-West Nigeria',
    heroTitle: 'Land for Sale in Agbara, Ogun State',
    metaTitle: 'Land for Sale in Agbara, Ogun State | Bridgefort Homes',
    metaDescription: 'Industrial-corridor estate land for sale in Agbara, Ogun State. Affordable, verified plots minutes from Lagos\' Badagry expressway.',
    intro: 'Agbara is Ogun State\'s industrial gateway, sitting on the Lagos–Badagry expressway. Bridgefort offers verified estate plots at a fraction of Lagos prices with strong rental demand from industrial workers.',
    whyInvest: [
      'Anchored by major industrial estates (Nestlé, Beta Glass, etc.)',
      '30 minutes from Lagos via Badagry expressway',
      'Strong rental yields from industrial workforce',
      'Ogun State pro-investor land policy',
    ],
    popularEstates: ['Agbara Industrial Axis', 'Igbesa', 'Atan-Ota Corridor'],
    nearbyCommunities: ['Igbesa', 'Atan-Ota', 'Ado-Odo', 'Badagry (Lagos)'],
    priceRange: '₦1M – ₦4M per plot',
    roiNote: 'Strong rental + appreciation play for industrial-belt investors.',
    faqs: [
      { q: 'Is Agbara in Lagos or Ogun?', a: 'Agbara is in Ogun State but borders Lagos along the Badagry expressway.' },
    ],
  },
  {
    slug: 'isiwo-ogun',
    name: 'Isiwo',
    state: 'Ogun State',
    region: 'South-West Nigeria',
    heroTitle: 'Land for Sale in Isiwo, Ogun State',
    metaTitle: 'Affordable Land for Sale in Isiwo, Ogun State | Bridgefort',
    metaDescription: 'Buy affordable, titled land in Isiwo, Ogun State. Strategic plots near the Lagos-Ibadan growth axis with flexible payments.',
    intro: 'Isiwo is one of Ogun State\'s emerging investment frontiers, well-positioned on the Lagos–Ibadan growth axis. Ideal for land bankers seeking high-upside, low-entry plots.',
    whyInvest: [
      'Low-entry pricing with high appreciation runway',
      'On the Lagos–Ibadan economic corridor',
      'Proximity to Mowe-Ibafo industrial cluster',
      'Verified titles with Bridgefort\'s due diligence',
    ],
    popularEstates: ['Isiwo Town', 'Mowe-Isiwo Axis'],
    nearbyCommunities: ['Mowe', 'Ibafo', 'Ofada', 'Magboro'],
    priceRange: '₦600K – ₦2.5M per plot',
    roiNote: 'Best entry point for first-time land bankers in Ogun State.',
    faqs: [
      { q: 'Is Isiwo land good for resale?', a: 'Yes — Isiwo benefits from spillover demand from Mowe and the Lagos-Ibadan corridor.' },
    ],
  },
  {
    slug: 'ikota-lekki-lagos',
    name: 'Ikota-Lekki',
    state: 'Lagos State',
    region: 'South-West Nigeria',
    heroTitle: 'Land & Homes for Sale in Ikota-Lekki, Lagos',
    metaTitle: 'Land & Homes for Sale in Ikota Lekki Lagos | Bridgefort Homes',
    metaDescription: 'Premium residential land and luxury homes for sale in Ikota-Lekki, Lagos. Gated estates with full infrastructure.',
    intro: 'Ikota-Lekki sits in the heart of the established Lekki residential belt — close to VGC, Chevron Drive and Lekki Phase 1. Bridgefort offers premium residential plots and luxury homes here.',
    whyInvest: [
      'Mature, fully-serviced residential neighbourhood',
      'Walking distance to VGC, Chevron and Circle Mall',
      'Strong rental yields from expatriate and corporate tenants',
      'Limited remaining inventory drives steady appreciation',
    ],
    popularEstates: ['Ikota Villa', 'VGC Extension', 'Chevron Axis'],
    nearbyCommunities: ['VGC', 'Chevron', 'Ikate', 'Lekki Phase 1', 'Ajah'],
    priceRange: '₦80M – ₦350M per plot',
    roiNote: 'Premium rental yields of 6–8% net for serviced apartments.',
    faqs: [
      { q: 'What size are Ikota-Lekki plots?', a: 'Standard plots are 500–648 sqm; serviced plots come fully prepared for immediate construction.' },
    ],
  },
  {
    slug: 'ikorodu-lagos',
    name: 'Ikorodu',
    state: 'Lagos State',
    region: 'South-West Nigeria',
    heroTitle: 'Land for Sale in Ikorodu, Lagos',
    metaTitle: 'Affordable Land for Sale in Ikorodu, Lagos | Bridgefort',
    metaDescription: 'Affordable, titled estate land for sale in Ikorodu, Lagos. Easy mainland access with strong rental and appreciation potential.',
    intro: 'Ikorodu is Lagos\' most affordable mainland investment corridor. Bridgefort offers titled estate plots minutes from the new Lagos-Ikorodu road expansion and the Ikorodu-Itoikin axis.',
    whyInvest: [
      'Most affordable Lagos mainland entry',
      'New Mile 12–Ikorodu road expansion easing access',
      'High rental demand from mainland workforce',
      'Spillover from Lagos Island congestion',
    ],
    popularEstates: ['Imota', 'Igbogbo', 'Ijede', 'Itoikin Road'],
    nearbyCommunities: ['Imota', 'Igbogbo', 'Ijede', 'Agbowa', 'Mowe (Ogun)'],
    priceRange: '₦1M – ₦6M per plot',
    roiNote: 'Affordable Lagos entry with steady 12–18% annual appreciation.',
    faqs: [
      { q: 'Is Ikorodu still developing?', a: 'Yes — government infrastructure spending and the Imota Rice Mill are accelerating Ikorodu\'s growth.' },
    ],
  },
  {
    slug: 'port-harcourt-rivers',
    name: 'Port Harcourt',
    state: 'Rivers State',
    region: 'South-South Nigeria',
    heroTitle: 'Land for Sale in Port Harcourt, Rivers State',
    metaTitle: 'Land for Sale in Port Harcourt, Rivers State | Bridgefort',
    metaDescription: 'Verified estate land for sale in Port Harcourt, Rivers State. Secure family-compound plots in GRA, Eliozu, Rumuokoro and Igwuruta.',
    intro: 'Port Harcourt is Nigeria\'s oil and gas capital with deep rental demand from corporate expatriates. Bridgefort offers secured, titled estate plots in Port Harcourt\'s prime growth corridors.',
    whyInvest: [
      'Oil & gas headquarters drive premium rental yields',
      'Strong corporate housing demand',
      'Lower competition than Lagos market',
      'Government infrastructure expansion in greater PH',
    ],
    popularEstates: ['Eliozu', 'Igwuruta', 'Rumuokoro', 'Airport Road Axis'],
    nearbyCommunities: ['Eliozu', 'Igwuruta', 'Rumuokoro', 'Choba', 'Aluu'],
    priceRange: '₦3M – ₦20M per plot',
    roiNote: 'Rental yields of 7–10% achievable in serviced corporate-tenant areas.',
    faqs: [
      { q: 'Is Port Harcourt land secure?', a: 'Bridgefort only sells from estates with verified community consent and government-recognised titles.' },
    ],
  },
  {
    slug: 'owerri-imo',
    name: 'Owerri',
    state: 'Imo State',
    region: 'South-East Nigeria',
    heroTitle: 'Land for Sale in Owerri, Imo State',
    metaTitle: 'Land for Sale in Owerri, Imo State | Bridgefort Homes',
    metaDescription: 'Verified land for sale in Owerri, Imo State. Estate plots in New Owerri, Egbu and Mbaise corridor with flexible payment plans.',
    intro: 'Owerri is the South-East\'s most liveable city and a magnet for Diaspora real-estate investment. Bridgefort offers verified estate plots in Owerri\'s prime expansion corridors.',
    whyInvest: [
      'Strong Diaspora investment demand',
      'Capital city of Imo State with active development',
      'Lower competition vs Lagos/Abuja',
      'Cultural & lifestyle hub of the South-East',
    ],
    popularEstates: ['New Owerri', 'Egbu Road', 'Mbaise Road Corridor', 'Akwakuma'],
    nearbyCommunities: ['Egbu', 'Mbaise', 'Akwakuma', 'Nekede', 'Obinze'],
    priceRange: '₦1.5M – ₦8M per plot',
    roiNote: 'Steady 12–20% appreciation driven by Diaspora returnee demand.',
    faqs: [
      { q: 'Why invest in Owerri?', a: 'Owerri combines South-East cultural appeal with capital-city growth and strong Diaspora-driven demand.' },
    ],
  },
];

export const getLocationBySlug = (slug: string) => locations.find(l => l.slug === slug);
