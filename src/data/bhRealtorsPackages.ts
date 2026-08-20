export type BhRealtorsPackage = {
  package_code: 'associate' | 'gold' | 'classic_gold';
  package_name: string;
  price: number;
  /** Membership/network-marketing income paid from a successful membership purchase above ₦5,000. */
  direct_commission_pct: number;
  indirect_commission_pct: number;
  withdrawable: boolean;
  description: string;
  /** Estate-land sale commission earned by the selling Realtor. */
  sales_commission_pct: number;
  /** Whether the selling Realtor's sale commission can be withdrawn immediately. */
  sales_commission_locked: boolean;
  /** Whether the seller's first-level upline can receive the 5% sale referral commission. */
  first_level_sales_commission_pct: number;
};

/**
 * UI fallback values. The database is authoritative for package pricing and
 * admins can change prices from the BHRealtors Funnel. These values keep the
 * public UI usable while the database is loading.
 */
export const bhRealtorsPackages: BhRealtorsPackage[] = [
  {
    package_code: 'associate',
    package_name: 'Associate',
    price: 5000,
    direct_commission_pct: 5,
    indirect_commission_pct: 0,
    withdrawable: false,
    description: '5% membership referral income above ₦5,000. Estate-land sales pay 5%, but the seller commission remains locked until upgrade. No first-level sale referral commission.',
    sales_commission_pct: 5,
    sales_commission_locked: true,
    first_level_sales_commission_pct: 0,
  },
  {
    package_code: 'gold',
    package_name: 'Gold',
    price: 35000,
    direct_commission_pct: 10,
    indirect_commission_pct: 5,
    withdrawable: true,
    description: '10% first-level and 5% second-level membership referral income above ₦5,000. Estate-land sales pay 10%, withdrawable, with 5% to a Gold+ first-level referrer.',
    sales_commission_pct: 10,
    sales_commission_locked: false,
    first_level_sales_commission_pct: 5,
  },
  {
    package_code: 'classic_gold',
    package_name: 'Classic Gold',
    price: 75000,
    direct_commission_pct: 15,
    indirect_commission_pct: 5,
    withdrawable: true,
    description: '15% first-level and 5% second-level membership referral income above ₦5,000. Estate-land sales pay 15%, withdrawable, with 5% to a Gold+ first-level referrer.',
    sales_commission_pct: 15,
    sales_commission_locked: false,
    first_level_sales_commission_pct: 5,
  },
];
