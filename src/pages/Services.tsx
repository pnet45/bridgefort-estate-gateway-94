
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Calculator, CheckCircle, Home, Building, Wallet, ArrowRight, BarChart } from 'lucide-react';

const Services = () => {
  const investmentPackages = [
    {
      title: 'Luxury Homes',
      description: 'Premium residential properties in sought-after locations with exceptional amenities and potential for appreciation.',
      icon: Home,
      features: [
        'Premium locations in Lagos, Abuja, and Port Harcourt',
        'High-quality construction and modern design',
        'Excellent rental yield potential',
        'Strong capital appreciation history',
        'Flexible payment plans available'
      ],
      cta: 'Explore Luxury Homes'
    },
    {
      title: 'Commercial Plots',
      description: 'Strategic commercial properties and land in high-growth areas ideal for development or long-term investment.',
      icon: Building,
      features: [
        'Prime commercial locations',
        'Clean title documentation',
        'High ROI potential',
        'Development consultation available',
        'Suitable for retail, office, or mixed-use development'
      ],
      cta: 'View Commercial Opportunities'
    },
    {
      title: 'Rental Income Plans',
      description: 'Turnkey rental properties with property management solutions for steady passive income streams.',
      icon: Wallet,
      features: [
        'Fully managed rental properties',
        '8-12% annual rental yields',
        'Tenant procurement and management',
        'Regular maintenance and inspections',
        'Quarterly performance reports'
      ],
      cta: 'Start Earning Passive Income'
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative">
        <div className="h-[40vh] bg-cover bg-center" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1559136555-9303baea8ebd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1500&q=80)' }}>
          <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center">
            <div className="container-custom text-white">
              <h1 className="text-3xl md:text-5xl font-bold mb-4">Investment Services</h1>
              <p className="text-xl max-w-2xl">Discover our range of real estate investment opportunities designed to maximize your returns.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Investment Packages */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Investment Packages</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Choose from our carefully curated investment packages, designed to meet different financial goals and risk profiles.</p>
            <h2 className="text-3xl font-bold mb-4">Your Path to Guaranteed Real Estate Returns Starts Here: Introducing Buy To Sell.</h2>
            <p className="text-gray-600 max-w-2x1 mx-auto">Buy To Sell simplifies real estate investment. Imagine earning substantial passive income without the usual risks. With Buy To Sell, you can purchase property in our carefully chosen estates, and we guarantee to facilitate a resale of your property within 12 months, aiming for profits as high as 30%. Enjoy the peace of mind that comes with knowing your income potential is locked in from day one. Secure your financial future with this unique, low-risk investment opportunity.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {investmentPackages.map((pkg, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition duration-300">
                <div className="p-6">
                  <div className="bg-estate-blue bg-opacity-10 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                    <pkg.icon size={28} className="text-estate-blue" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-3">{pkg.title}</h3>
                  <p className="text-gray-600 mb-6">{pkg.description}</p>
                  
                  <h4 className="font-semibold text-gray-800 mb-3">Key Features:</h4>
                  <ul className="space-y-2 mb-6">
                    {pkg.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <CheckCircle size={18} className="text-estate-blue mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="px-6 pb-6">
                  <Link 
                    to="/contact" 
                    className="block text-center py-3 bg-estate-red text-white rounded font-medium hover:bg-red-600 transition duration-300"
                  >
                    {pkg.cta}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ROI Calculator */}
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

      {/* Investment Guide */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Investment Guide</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Follow our step-by-step process to start your real estate investment journey with PWAN Bridgefort.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md relative">
              <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-estate-blue text-white flex items-center justify-center font-bold text-lg">1</div>
              <h3 className="text-xl font-semibold mb-3 mt-4">Consultation</h3>
              <p className="text-gray-600 mb-4">Schedule a free consultation with our investment advisors to discuss your goals and financial capacity.</p>
              <Link to="/contact" className="text-estate-blue font-medium hover:text-estate-darkBlue inline-flex items-center">
                Book Consultation <ArrowRight size={16} className="ml-1" />
              </Link>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md relative">
              <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-estate-blue text-white flex items-center justify-center font-bold text-lg">2</div>
              <h3 className="text-xl font-semibold mb-3 mt-4">Property Selection</h3>
              <p className="text-gray-600 mb-4">Based on your needs, we'll recommend suitable properties and arrange viewings or detailed virtual tours.</p>
              <Link to="/properties" className="text-estate-blue font-medium hover:text-estate-darkBlue inline-flex items-center">
                Browse Properties <ArrowRight size={16} className="ml-1" />
              </Link>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md relative">
              <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-estate-blue text-white flex items-center justify-center font-bold text-lg">3</div>
              <h3 className="text-xl font-semibold mb-3 mt-4">Documentation</h3>
              <p className="text-gray-600 mb-4">Our legal team will handle all necessary documentation, ensuring clean titles and proper registration.</p>
              <Link to="/contact" className="text-estate-blue font-medium hover:text-estate-darkBlue inline-flex items-center">
                Learn More <ArrowRight size={16} className="ml-1" />
              </Link>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md relative">
              <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-estate-blue text-white flex items-center justify-center font-bold text-lg">4</div>
              <h3 className="text-xl font-semibold mb-3 mt-4">Investment Management</h3>
              <p className="text-gray-600 mb-4">Ongoing support to manage your property, including rentals, maintenance, and performance tracking.</p>
              <Link to="/contact" className="text-estate-blue font-medium hover:text-estate-darkBlue inline-flex items-center">
                Management Details <ArrowRight size={16} className="ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Find answers to common questions about real estate investments with PWAN Bridgefort.</p>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3">What is the minimum investment amount?</h3>
              <p className="text-gray-600">Our investment packages start from ₦500,000, depending on the property type and location. We also offer flexible payment plans to make investing more accessible.</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3">How secure are real estate investments in Nigeria?</h3>
              <p className="text-gray-600">Real estate remains one of the most secure investment options in Nigeria. At PWAN Bridgefort, we ensure all properties have verified titles and necessary documentation to protect your investment.</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3">What returns can I expect from my investment?</h3>
              <p className="text-gray-600">While returns vary based on property type and location, our residential properties typically yield 8-12% annual rental returns, with capital appreciation of 15-30% annually in prime locations.</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3">Can I invest if I'm based outside Nigeria?</h3>
              <p className="text-gray-600">Yes, we have many international investors. We provide virtual consultations, digital documentation, and property management services specifically designed for overseas investors.</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3">How do you handle property management?</h3>
              <p className="text-gray-600">Our property management services include tenant procurement, rent collection, property maintenance, and regular performance reports. We handle everything so you can enjoy passive income without hassle.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-estate-blue text-white text-center">
        <div className="container-custom">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Investment Journey?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">Contact our team of experts today for a free consultation and property portfolio review.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/contact" className="btn-cta bg-white text-estate-blue hover:bg-gray-100 text-lg px-8 py-3">Schedule Consultation</Link>
            <Link to="/properties" className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-estate-blue font-medium text-lg px-8 py-3 rounded transition duration-300">Browse Properties</Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Services;
