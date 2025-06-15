
import React from "react";
import { calculatePaymentPlan, PaymentPlanType } from "@/utils/paymentPlan";

interface PaymentPlanSelectorProps {
  baseAmount: number;
  onPlanSelect: (plan: {
    months: number;
    type: PaymentPlanType;
    total: number;
    principal: number;
    interest: number;
    interestRate: number;
  }) => void;
  selected: { months: number; type: PaymentPlanType } | null;
}

const plans: { label: string; months: number; type: PaymentPlanType }[] = [
  { label: "Outright (One-off)", months: 1, type: "outright" },
  { label: "1-3 Months (5% extra)", months: 3, type: "1-3" },
  { label: "4-6 Months (12.5% extra)", months: 6, type: "4-6" },
  { label: "7-12 Months (25% extra)", months: 12, type: "7-12" },
];

const PaymentPlanSelector: React.FC<PaymentPlanSelectorProps> = ({
  baseAmount,
  onPlanSelect,
  selected,
}) => (
  <div>
    <h4 className="font-semibold mb-2">Select Payment Plan</h4>
    <div className="space-y-2">
      {plans.map((plan) => {
        const result = calculatePaymentPlan(baseAmount, plan.months);

        return (
          <button
            key={plan.type}
            className={`w-full border rounded-lg py-2 px-4 text-left ${
              selected?.type === plan.type ? "border-estate-blue bg-blue-50" : "border-gray-200 bg-white"
            }`}
            type="button"
            onClick={() =>
              onPlanSelect({
                months: plan.months,
                type: plan.type,
                total: result.total,
                principal: result.principal,
                interest: result.interest,
                interestRate: result.interestRate,
              })
            }
          >
            <div className="flex justify-between items-center">
              <span>{plan.label}</span>
              <span>₦{result.total.toLocaleString()}</span>
            </div>
            {plan.type !== "outright" && (
              <div className="text-xs text-blue-600">
                ₦{Math.ceil(result.total / plan.months).toLocaleString()} per month × {plan.months} months
              </div>
            )}
            <div className="text-xs text-gray-500">
              Pay over {plan.months} {plan.months === 1 ? "month" : "months"}
            </div>
          </button>
        );
      })}
    </div>
  </div>
);

export default PaymentPlanSelector;
