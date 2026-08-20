export type BhRealtorsPackage = {
  package_code: 'associate' | 'gold' | 'classic_gold';
  package_name: string;
  price: number;
  /** Package purchases do not determine property-sale commission rates. */
  direct_commission_pct: number;
  indirect_commission_pct: number;
  withdrawable: boolean;
  description: string;
};

/**
 * BHRealtors membership tiers.
 *
 * IMPORTANT BUSINESS RULE:
 * Membership/package purchases do NOT generate referral commissions.
 * Estate-land sales are handled separately: seller = 15%, seller's first-level
 * referrer = 5%, and no other level receives commission.
 */
export const bhRealtorsPackages: BhRealtorsPackage[] = [
  {
    package_code: 'associate',
    package_name: 'Associate',
    price: 5000,
    direct_commission_pct: 0,
    indirect_commission_pct: 0,
    withdrawable: true,
    description: 'Associate membership tier. Property-sale commissions are calculated separately from actual estate-land sales.',
  },
  {
    package_code: 'gold',
    package_name: 'Gold',
    price: 35000,
    direct_commission_pct: 0,
    indirect_commission_pct: 0,
    withdrawable: true,
    description: 'Gold membership tier. Membership purchase does not generate referral commission.',
  },
  {
    package_code: 'classic_gold',
    package_name: 'Classic Gold',
    price: 75000,
    direct_commission_pct: 0,
    indirect_commission_pct: 0,
    withdrawable: true,
    description: 'Classic Gold membership tier. Membership purchase does not generate referral commission.',
  },
];
