
import React, { useState, useEffect } from 'react';
import { BarChart, Calculator } from 'lucide-react';

const ROICalculator = () => {
  const [investmentAmount, setInvestmentAmount] = useState<string>('');
  const [investmentType, setInvestmentType] = useState<string>('land');
  const [investmentPeriod, setInvestmentPeriod] = useState<string>('1');
  const [calculatedResults, setCalculatedResults] = useState<{
    initialInvestment: number;
    estimatedValue: number;
    totalReturn: number;
    roiPercentage: number;
    annualRoi: number;
  } | null>(null);

  const handleCalculate = () => {
    const amount = parseFloat(investmentAmount.replace(/,/g, ''));
    if (isNaN(amount)) return;

    // Calculate ROI based on investment type and period
    let roiPercentage = 0;
    
    if (investmentType === 'land') {
      roiPercentage = investmentPeriod === '1' ? 30 : 60;
    } else if (investmentType === 'residential') {
      roiPercentage = investmentPeriod === '1' ? 8 : 16;
    } else if (investmentType === 'commercial') {
      roiPercentage = investmentPeriod === '1' ? 15 : 30;
    }
    
    const roi = (amount * roiPercentage) / 100;
    const estimatedValue = amount + roi;
    const years = parseInt(investmentPeriod);
    
    setCalculatedResults({
      initialInvestment: amount,
      estimatedValue: estimatedValue,
      totalReturn: roi,
      roiPercentage: roiPercentage,
      annualRoi: roiPercentage / years
    });
  };

  // Update the calculation if investment type or period changes
  useEffect(() => {
    if (calculatedResults) {
      handleCalculate();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [investmentType, investmentPeriod]);

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-NG', { 
      style: 'currency', 
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <section className="section-padding bg-gray-50">
      <div className="container-custom">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          <div className="w-full lg:w-1/2">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-estate-blue bg-opacity-20 p-2 rounded-full">
                <Calculator size={24} className="text-estate-blue" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold">Land Banking Calculator</h2>
            </div>
            
            <p className="text-gray-600 mb-6">
              Use our calculator to estimate the potential returns on your real estate investment. 
              This tool provides a simplified projection based on historical performance data.
            </p>
            
            <div className="bg-white p-5 md:p-6 rounded-lg shadow-md mb-8">
              <div className="space-y-4">
                <div>
                  <label htmlFor="investment-amount" className="block text-sm font-medium text-gray-700 mb-1">Investment Amount (₦)</label>
                  <input
                    type="text"
                    id="investment-amount"
                    placeholder="e.g., 20,000,000"
                    className="input-field w-full"
                    value={investmentAmount}
                    onChange={(e) => setInvestmentAmount(e.target.value)}
                  />
                </div>
                
                <div>
                  <label htmlFor="investment-type" className="block text-sm font-medium text-gray-700 mb-1">Investment Type</label>
                  <select
                    id="investment-type"
                    className="input-field w-full"
                    value={investmentType}
                    onChange={(e) => setInvestmentType(e.target.value)}
                  >
                    <option value="land">Land</option>
                    <option value="residential">Residential Property</option>
                    <option value="commercial">Commercial Property</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="investment-period" className="block text-sm font-medium text-gray-700 mb-1">Investment Period (Years)</label>
                  <select
                    id="investment-period"
                    className="input-field w-full"
                    value={investmentPeriod}
                    onChange={(e) => setInvestmentPeriod(e.target.value)}
                  >
                    <option value="1">1 Year</option>
                    <option value="2">2 Years</option>
                  </select>
                </div>
                
                <button 
                  type="button" 
                  className="w-full btn-cta mt-2"
                  onClick={handleCalculate}
                >
                  Calculate Profit
                </button>
              </div>
            </div>
            
            <p className="text-sm text-gray-500 italic">
              Note: Results are estimates based on historical data and market trends. 
              Actual returns may vary. Please consult with our investment advisors for personalized guidance.
            </p>
          </div>
          
          <div className="w-full lg:w-1/2">
            <div className="bg-white p-6 md:p-8 rounded-lg shadow-lg h-full">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl md:text-2xl font-semibold">Profit Projection</h3>
                <BarChart size={24} className="text-estate-blue" />
              </div>
              
              {calculatedResults ? (
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Initial Investment</span>
                      <span className="font-semibold">{formatCurrency(calculatedResults.initialInvestment)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-estate-blue h-2.5 rounded-full" style={{ width: '50%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Estimated Value (After {investmentPeriod} {parseInt(investmentPeriod) === 1 ? 'Year' : 'Years'})</span>
                      <span className="font-semibold">{formatCurrency(calculatedResults.estimatedValue)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-estate-blue h-2.5 rounded-full" style={{ width: '90%' }}></div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex justify-between mb-4">
                      <span className="text-gray-600">Total Profit</span>
                      <span className="text-xl font-bold text-estate-blue">{formatCurrency(calculatedResults.totalReturn)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Profit Percentage</span>
                      <span className="text-xl font-bold text-estate-blue">{calculatedResults.roiPercentage}%</span>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Annual Profit Rate</span>
                      <span className="text-xl font-bold text-estate-blue">{calculatedResults.annualRoi}%</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                  <p className="text-center mb-4">Enter your investment details and click "Calculate Profit" to see projection</p>
                  <Calculator size={48} className="opacity-50" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ROICalculator;
