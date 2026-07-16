export interface FiveKPriceTier {
  price: number;
  sqm: number;
}

export interface FiveKEstate {
  slug: string;
  name: string;
  location: string;
  tiers: FiveKPriceTier[];
  badge: string; // e.g. "C OF O IN VIEW", "SURVEY & DEED", "GAZETTE"
}

// Source: Bridgefort Homes "PROMO PRICE 5K DAILY" flyer — "It's Leveling Up
// Time!!! Become a landlord with as low as 5K daily."
export const fiveKEstates: FiveKEstate[] = [
  {
    slug: 'big-league-county',
    name: 'The Big League County',
    location: 'Warri, Delta State',
    tiers: [
      { price: 3300000, sqm: 225 },
      { price: 5900000, sqm: 232 },
      { price: 10500000, sqm: 450 },
      { price: 10900000, sqm: 464 },
    ],
    badge: 'C OF O IN VIEW',
  },
  {
    slug: 'fountains-crest',
    name: 'Fountains Crest Smart City',
    location: 'Owode, Ogun State',
    tiers: [
      { price: 560000, sqm: 250 },
      { price: 670000, sqm: 300 },
      { price: 1000000, sqm: 450 },
      { price: 1200000, sqm: 500 },
      { price: 1300000, sqm: 600 },
    ],
    badge: 'SURVEY & DEED',
  },
  {
    slug: 'bridgefort-crest-ville',
    name: 'Bridgefort Crest Ville',
    location: 'Isiwo - Epe, Ogun State',
    tiers: [
      { price: 3100000, sqm: 250 },
      { price: 3700000, sqm: 300 },
      { price: 5500000, sqm: 450 },
      { price: 5400000, sqm: 500 },
      { price: 7400000, sqm: 600 },
    ],
    badge: 'C OF O IN VIEW',
  },
  {
    slug: 'hampton-court-phase-3',
    name: 'Hampton Court Phase 3',
    location: 'Agbara, Ogun State',
    tiers: [
      { price: 1400000, sqm: 250 },
      { price: 1700000, sqm: 300 },
      { price: 2500000, sqm: 450 },
      { price: 2800000, sqm: 500 },
      { price: 3400000, sqm: 600 },
    ],
    badge: 'C OF O IN VIEW',
  },
  {
    slug: 'hampton-ville-estate',
    name: 'Hampton Ville Estate',
    location: 'Itokin - Epe, Lagos State',
    tiers: [
      { price: 5000000, sqm: 250 },
      { price: 6000000, sqm: 300 },
      { price: 9000000, sqm: 450 },
      { price: 10000000, sqm: 500 },
      { price: 12000000, sqm: 600 },
    ],
    badge: 'GAZETTE',
  },
  {
    slug: 'bridgefort-biz-hub',
    name: 'Bridgefort Biz Hub',
    location: 'Ode-Omi, Ogun State',
    tiers: [
      { price: 3100000, sqm: 250 },
      { price: 3700000, sqm: 300 },
      { price: 5500000, sqm: 450 },
      { price: 5400000, sqm: 500 },
      { price: 7400000, sqm: 600 },
    ],
    badge: 'SURVEY & DEED',
  },
  {
    slug: 'big-league-haven',
    name: 'The Big League Haven',
    location: 'Ogwashi-Uku, Delta State',
    tiers: [
      { price: 2750000, sqm: 225 },
      { price: 2900000, sqm: 232 },
      { price: 5500000, sqm: 450 },
      { price: 5800000, sqm: 464 },
    ],
    badge: 'SURVEY & DEED',
  },
  {
    slug: 'gateway-minigolf',
    name: 'Gateway Mini-Golf Estate and Resorts',
    location: 'Owode, Ogun State',
    tiers: [
      { price: 1700000, sqm: 250 },
      { price: 2000000, sqm: 300 },
      { price: 3000000, sqm: 450 },
      { price: 3400000, sqm: 500 },
      { price: 4000000, sqm: 600 },
    ],
    badge: 'SURVEY & DEED',
  },
];

export const getFiveKEstate = (slug: string) => fiveKEstates.find((e) => e.slug === slug);

export type PromoFrequency = 'daily' | 'weekly' | 'monthly';

export const PROMO_UNIT_AMOUNT = 5000; // ₦5,000 "as low as 5K daily" base unit

export const frequencyMeta: Record<PromoFrequency, { label: string; perYear: number; unitLabel: string }> = {
  daily: { label: 'Daily', perYear: 365, unitLabel: 'day' },
  weekly: { label: 'Weekly', perYear: 52, unitLabel: 'week' },
  monthly: { label: 'Monthly', perYear: 12, unitLabel: 'month' },
};

// Suggested installment amount for a given frequency, scaled up from the
// ₦5,000/day base rate so the "as low as 5K daily" promise holds however the
// investor chooses to pay.
export const suggestedInstallment = (frequency: PromoFrequency) => {
  const dailyEquivalent = PROMO_UNIT_AMOUNT;
  const daysPerUnit = { daily: 1, weekly: 7, monthly: 30 }[frequency];
  return Math.round((dailyEquivalent * daysPerUnit) / 1000) * 1000;
};

// Given a target price and a chosen frequency/installment amount, estimate
// how many installments (and how much calendar time) it will take to reach
// the target.
export const estimatePayoffPeriods = (
  targetAmount: number,
  frequency: PromoFrequency,
  installmentAmount: number
) => {
  const installments = Math.max(1, Math.ceil(targetAmount / installmentAmount));
  const daysPerUnit = { daily: 1, weekly: 7, monthly: 30 }[frequency];
  const totalDays = installments * daysPerUnit;
  return { installments, totalDays };
};
