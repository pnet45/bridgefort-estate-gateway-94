export type MlmPackage = {
  package_code: 'associate' | 'gold' | 'classic_gold';
  package_name: string;
  price: number;
  direct_commission_pct: number;
  indirect_commission_pct: number;
  withdrawable: boolean;
  description: string;
};

export const mlmPackages: MlmPackage[] = [
  {
    package_code: 'associate',
    package_name: 'Associate',
    price: 5000,
    direct_commission_pct: 5,
    indirect_commission_pct: 0,
    withdrawable: false,
    description: '5% direct sales commission; commissions are not withdrawable until you upgrade to Gold or Classic Gold.',
  },
  {
    package_code: 'gold',
    package_name: 'Gold',
    price: 35000,
    direct_commission_pct: 10,
    indirect_commission_pct: 5,
    withdrawable: true,
    description: '10% direct commission plus 5% on 2nd level package purchases.',
  },
  {
    package_code: 'classic_gold',
    package_name: 'Classic Gold',
    price: 75000,
    direct_commission_pct: 15,
    indirect_commission_pct: 5,
    withdrawable: true,
    description: '15% direct commission plus 5% on 2nd level package purchases.',
  },
];
