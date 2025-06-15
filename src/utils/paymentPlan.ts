
export type PaymentPlanType = 'outright' | '1-3' | '4-6' | '7-12';

export interface PaymentPlanCalculation {
  months: number;
  planType: PaymentPlanType;
  principal: number;
  interestRate: number;
  interest: number;
  total: number;
}

export function calculatePaymentPlan(principal: number, months: number): PaymentPlanCalculation {
  let planType: PaymentPlanType;
  let interestRate = 0;

  if (months === 1) {
    planType = 'outright';
    interestRate = 0;
  } else if (months >= 1 && months <= 3) {
    planType = '1-3';
    interestRate = 0.05;
  } else if (months >= 4 && months <= 6) {
    planType = '4-6';
    interestRate = 0.125;
  } else if (months >= 7 && months <= 12) {
    planType = '7-12';
    interestRate = 0.25;
  } else {
    throw new Error('Invalid months for payment plan.');
  }

  const interest = principal * interestRate;
  const total = principal + interest;

  return {
    months,
    planType,
    principal,
    interestRate,
    interest,
    total,
  };
}
