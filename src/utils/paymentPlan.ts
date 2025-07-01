
export interface PaymentPlan {
  id: string;
  name: string;
  months: number;
  interestRate: number;
  description: string;
}

export const paymentPlans: PaymentPlan[] = [
  {
    id: 'outright',
    name: 'Outright Payment',
    months: 1,
    interestRate: 0,
    description: 'Pay full amount upfront with no additional charges'
  },
  {
    id: '1-3',
    name: '1-3 Months',
    months: 3,
    interestRate: 0.05,
    description: '5% additional charge spread over 3 months'
  },
  {
    id: '4-6',
    name: '4-6 Months',
    months: 6,
    interestRate: 0.10,
    description: '10% additional charge spread over 6 months'
  },
  {
    id: '7-12',
    name: '7-12 Months',
    months: 12,
    interestRate: 0.15,
    description: '15% additional charge spread over 12 months'
  }
];

export const calculatePaymentBreakdown = (
  principalAmount: number,
  planId: string,
  isDocumentation: boolean = false
) => {
  const plan = paymentPlans.find(p => p.id === planId);
  if (!plan) {
    throw new Error('Invalid payment plan');
  }

  // For documentation, no extra charges are applied regardless of payment plan
  const interestRate = isDocumentation ? 0 : plan.interestRate;
  const interestAmount = principalAmount * interestRate;
  const totalAmount = principalAmount + interestAmount;
  const monthlyPayment = totalAmount / plan.months;

  return {
    principalAmount,
    interestAmount,
    totalAmount,
    monthlyPayment: Math.ceil(monthlyPayment),
    months: plan.months,
    plan: plan.name
  };
};

export const getPaymentPlanById = (planId: string): PaymentPlan | undefined => {
  return paymentPlans.find(plan => plan.id === planId);
};
