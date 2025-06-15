import React, { useState, useEffect } from "react";
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
    monthsToPay?: number;
    monthlyPayment: number;
    payAmount: number;
  }) => void;
  selected: { months: number; type: PaymentPlanType; monthsToPay?: number } | null;
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
}) => {
  const [planType, setPlanType] = useState<PaymentPlanType | null>(selected?.type || null);
  const [planMonths, setPlanMonths] = useState<number>(selected?.months || 1);
  const [monthsToPay, setMonthsToPay] = useState<number>(1);

  // Keep in sync if parent controls selected
  useEffect(() => {
    if (selected && (selected.type !== planType || selected.months !== planMonths)) {
      setPlanType(selected.type);
      setPlanMonths(selected.months);
    }
    if ('monthsToPay' in (selected || {})) {
      setMonthsToPay(selected.monthsToPay || 1);
    }
  }, [selected]);

  const handlePlanClick = (plan: typeof plans[number]) => {
    setPlanType(plan.type);
    setPlanMonths(plan.months);
    setMonthsToPay(1);
    const result = calculatePaymentPlan(baseAmount, plan.months);
    onPlanSelect({
      months: plan.months,
      type: plan.type,
      total: result.total,
      principal: result.principal,
      interest: result.interest,
      interestRate: result.interestRate,
      monthsToPay: 1,
      monthlyPayment: Math.ceil(result.total / plan.months),
      payAmount: Math.ceil(result.total / plan.months), // Initial selection
    });
  };

  // Handle number of months to pay update
  const handleMonthsToPayChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = Number(e.target.value);
    setMonthsToPay(value);
    if (planType && planMonths && planType !== "outright") {
      const result = calculatePaymentPlan(baseAmount, planMonths);
      onPlanSelect({
        months: planMonths,
        type: planType,
        total: result.total,
        principal: result.principal,
        interest: result.interest,
        interestRate: result.interestRate,
        monthsToPay: value,
        monthlyPayment: Math.ceil(result.total / planMonths),
        payAmount: Math.ceil(result.total / planMonths) * value,
      });
    }
  };

  // Calculate monthly payment and pay amount for current plan
  const currentPlan =
    planType && planMonths
      ? calculatePaymentPlan(baseAmount, planMonths)
      : null;
  const monthlyPayment = currentPlan ? Math.ceil(currentPlan.total / planMonths) : 0;
  const payAmount = monthlyPayment * monthsToPay;

  return (
    <div>
      <h4 className="font-semibold mb-2">Select Payment Plan</h4>
      <div className="space-y-2">
        {plans.map((plan) => {
          const result = calculatePaymentPlan(baseAmount, plan.months);
          const isActive = selected?.type === plan.type;
          return (
            <button
              key={plan.type}
              className={`w-full border rounded-lg py-2 px-4 text-left ${
                isActive ? "border-estate-blue bg-blue-50" : "border-gray-200 bg-white"
              }`}
              type="button"
              onClick={() => handlePlanClick(plan)}
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
      {planType && planType !== "outright" && (
        <div className="mt-4">
          <label className="block mb-1 text-sm text-gray-700 font-medium">
            Select number of months to pay now
          </label>
          <select
            className="w-full border rounded-lg px-3 py-2"
            value={monthsToPay}
            onChange={handleMonthsToPayChange}
          >
            {Array.from({ length: planMonths }).map((_, idx) => (
              <option key={idx + 1} value={idx + 1}>
                {idx + 1} month{idx > 0 ? "s" : ""}
              </option>
            ))}
          </select>
          <div className="text-sm mt-2">
            {planMonths > 1 ? (
              <>
                You will pay for <b>{monthsToPay}</b> month{monthsToPay > 1 ? "s" : ""}: <b className="text-estate-blue">₦{payAmount.toLocaleString()}</b>
              </>
            ) : ""}
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentPlanSelector;
