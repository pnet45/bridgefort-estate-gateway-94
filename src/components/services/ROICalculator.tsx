
import React from 'react';
import { BarChart } from 'lucide-react';

const ROICalculator = () => {
  return (
    <section className="section-padding bg-gray-50">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-6">Investment ROI Calculator</h2>
            <p className="text-gray-600 mb-6">
              Use our ROI calculator to estimate the potential returns on your real estate investment. 
              This tool provides a simplified projection based on historical performance data.
            </p>
            
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
              <form className="space-y-4">
                <div>
                  <label htmlFor="investment-amount" className="block text-sm font-medium text-gray-700 mb-1">Investment Amount (₦)</label>
                  <input
                    type="number"
                    id="investment-amount"
                    placeholder="e.g., 20,000,000"
                    className="input-field w-full"
                  />
                </div>
                
                <div>
                  <label htmlFor="investment-type" className="block text-sm font-medium text-gray-700 mb-1">Investment Type</label>
                  <select
                    id="investment-type"
                    className="input-field w-full"
                  >
                    <option value="">Select Investment Type</option>
                    <option value="residential">Residential Property</option>
                    <option value="commercial">Commercial Property</option>
                    <option value="land">Land</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="investment-period" className="block text-sm font-medium text-gray-700 mb-1">Investment Period (Years)</label>
                  <select
                    id="investment-period"
                    className="input-field w-full"
                  >
                    <option value="1">1 Year</option>
                    <option value="3">3 Years</option>
                    <option value="5">5 Years</option>
                    <option value="10">10 Years</option>
                  </select>
                </div>
                
                <button 
                  type="button" 
                  className="w-full btn-cta mt-2"
                >
                  Calculate ROI
                </button>
              </form>
            </div>
            
            <p className="text-sm text-gray-500 italic">
              Note: Results are estimates based on historical data and market trends. 
              Actual returns may vary. Please consult with our investment advisors for personalized guidance.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-semibold">ROI Projection</h3>
              <BarChart size={24} className="text-estate-blue" />
            </div>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Initial Investment</span>
                  <span className="font-semibold">₦20,000,000</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-estate-blue h-2.5 rounded-full" style={{ width: '50%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Estimated Value (3 Years)</span>
                  <span className="font-semibold">₦26,000,000</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-estate-blue h-2.5 rounded-full" style={{ width: '90%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Estimated Value (5 Years)</span>
                  <span className="font-semibold">₦32,000,000</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-estate-blue h-2.5 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between mb-4">
                  <span className="text-gray-600">Total Return (5 Years)</span>
                  <span className="text-xl font-bold text-estate-blue">₦12,000,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">ROI Percentage</span>
                  <span className="text-xl font-bold text-estate-blue">60%</span>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Annual ROI</span>
                  <span className="text-xl font-bold text-estate-blue">12%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ROICalculator;
