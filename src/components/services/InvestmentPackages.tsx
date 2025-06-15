import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Home, Building, Wallet } from 'lucide-react';
import Buy2SellFeature from './Buy2SellFeature';
const InvestmentPackages = () => {
  const investmentPackages = [{
    title: 'Luxury Homes',
    description: 'Premium residential properties in sought-after locations with exceptional amenities and potential for appreciation.',
    icon: Home,
    features: ['Premium locations in Lagos, Abuja, and Port Harcourt', 'High-quality construction and modern design', 'Excellent rental yield potential', 'Strong capital appreciation history', 'Flexible payment plans available'],
    cta: 'Explore Luxury Homes'
  }, {
    title: 'Commercial Plots',
    description: 'Strategic commercial properties and land in high-growth areas ideal for development or long-term investment.',
    icon: Building,
    features: ['Prime commercial locations', 'Clean title documentation', 'High ROI potential', 'Development consultation available', 'Suitable for retail, office, or mixed-use development'],
    cta: 'View Commercial Opportunities'
  }, {
    title: 'Rental Income Plans',
    description: 'Turnkey rental properties with property management solutions for steady passive income streams.',
    icon: Wallet,
    features: ['Fully managed rental properties', '8-12% annual rental yields', 'Tenant procurement and management', 'Regular maintenance and inspections', 'Quarterly performance reports'],
    cta: 'Start Earning Passive Income'
  }];
  return <section className="section-padding">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Our Investment Packages</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Choose from our carefully curated investment packages, designed to meet different financial goals and risk profiles.</p>
        </div>

        {/* Buy2Sell Feature */}
        <Buy2SellFeature />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {investmentPackages.map((pkg, index) => <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition duration-300">
              <div className="p-6">
                <div className="bg-estate-blue bg-opacity-10 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                  <pkg.icon size={28} className="text-white" />
                </div>
                <h3 className="text-2xl font-semibold mb-3">{pkg.title}</h3>
                <p className="text-gray-600 mb-6">{pkg.description}</p>
                
                <h4 className="font-semibold text-gray-800 mb-3">Key Features:</h4>
                <ul className="space-y-2 mb-6">
                  {pkg.features.map((feature, i) => <li key={i} className="flex items-start">
                      <CheckCircle size={18} className="text-estate-blue mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">{feature}</span>
                    </li>)}
                </ul>
              </div>
              <div className="px-6 pb-6">
                <Link to="/contact" className="block text-center py-3 bg-estate-red text-white rounded font-medium hover:bg-red-600 transition duration-300">
                  {pkg.cta}
                </Link>
              </div>
            </div>)}
        </div>
      </div>
    </section>;
};
export default InvestmentPackages;