// BHRealtors "5K Daily" promo — data source of truth (matches the promo flyer).
export type PlotOption = { size: string; price: number };
export type SubscriptionEstate = {
  slug: string;
  name: string;
  location: string;
  status: string; // e.g. "C of O in view", "Survey & Deed", "Gazette"
  image?: string;
  plots: PlotOption[];
};

export const subscriptionEstates: SubscriptionEstate[] = [
  {
    slug: 'big-league-county-warri',
    name: 'The Big League County',
    location: 'Warri, Delta State',
    status: 'C of O in view',
    plots: [
      { size: '225 SQM', price: 3_300_000 },
      { size: '232 SQM', price: 5_900_000 },
      { size: '450 SQM', price: 10_500_000 },
      { size: '464 SQM', price: 10_900_000 },
    ],
  },
  {
    slug: 'fountains-crest-smart-city',
    name: 'Fountains Crest Smart City',
    location: 'Owode, Ogun State',
    status: 'Survey & Deed',
    plots: [
      { size: '250 SQM', price: 560_000 },
      { size: '300 SQM', price: 670_000 },
      { size: '450 SQM', price: 1_000_000 },
      { size: '500 SQM', price: 1_200_000 },
      { size: '600 SQM', price: 1_300_000 },
    ],
  },
  {
    slug: 'bridgefort-crest-ville-isiwo',
    name: 'Bridgefort Crest Ville',
    location: 'Isiwo – Epe, Ogun State',
    status: 'C of O in view',
    plots: [
      { size: '250 SQM', price: 3_100_000 },
      { size: '300 SQM', price: 3_700_000 },
      { size: '450 SQM', price: 5_500_000 },
      { size: '500 SQM', price: 5_400_000 },
      { size: '600 SQM', price: 7_400_000 },
    ],
  },
  {
    slug: 'hampton-court-phase-3-agbara',
    name: 'Hampton Court Phase 3',
    location: 'Agbara, Ogun State',
    status: 'C of O in view',
    plots: [
      { size: '250 SQM', price: 1_400_000 },
      { size: '300 SQM', price: 1_700_000 },
      { size: '450 SQM', price: 2_500_000 },
      { size: '500 SQM', price: 2_800_000 },
      { size: '600 SQM', price: 3_400_000 },
    ],
  },
  {
    slug: 'hampton-ville-itokin-epe',
    name: 'Hampton Ville Estate',
    location: 'Itokin – Epe, Lagos State',
    status: 'Gazette',
    plots: [
      { size: '250 SQM', price: 5_000_000 },
      { size: '300 SQM', price: 6_000_000 },
      { size: '450 SQM', price: 9_000_000 },
      { size: '500 SQM', price: 10_000_000 },
      { size: '600 SQM', price: 12_000_000 },
    ],
  },
  {
    slug: 'bridgefort-biz-hub-ode-omi',
    name: 'Bridgefort Biz Hub',
    location: 'Ode-Omi, Ogun State',
    status: 'Survey & Deed',
    plots: [
      { size: '250 SQM', price: 3_100_000 },
      { size: '300 SQM', price: 3_700_000 },
      { size: '450 SQM', price: 5_500_000 },
      { size: '500 SQM', price: 5_400_000 },
      { size: '600 SQM', price: 7_400_000 },
    ],
  },
  {
    slug: 'big-league-haven-ogwashi',
    name: 'The Big League Haven',
    location: 'Ogwashi-Uku, Delta State',
    status: 'Survey & Deed',
    plots: [
      { size: '225 SQM', price: 2_750_000 },
      { size: '232 SQM', price: 2_900_000 },
      { size: '450 SQM', price: 5_500_000 },
      { size: '464 SQM', price: 5_800_000 },
    ],
  },
  {
    slug: 'gateway-mini-golf-owode',
    name: 'Gateway Mini-Golf Estate & Resorts',
    location: 'Owode, Ogun State',
    status: 'Survey & Deed',
    plots: [
      { size: '250 SQM', price: 1_700_000 },
      { size: '300 SQM', price: 2_000_000 },
      { size: '450 SQM', price: 3_000_000 },
      { size: '500 SQM', price: 3_400_000 },
      { size: '600 SQM', price: 4_000_000 },
    ],
  },
];

export type Frequency = 'daily' | 'weekly' | 'monthly';

export const FREQUENCY_INSTALLMENT: Record<Frequency, number> = {
  daily: 5_000,
  weekly: 35_000,
  monthly: 150_000,
};

export const FREQUENCY_DAYS: Record<Frequency, number> = {
  daily: 1,
  weekly: 7,
  monthly: 30,
};
