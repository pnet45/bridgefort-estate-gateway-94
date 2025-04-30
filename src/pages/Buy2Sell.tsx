
import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Download, CheckCircle } from 'lucide-react';

const Buy2Sell = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative">
        <div className="h-[50vh] bg-cover bg-center" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1605810230434-7631ac76ec81?ixlib=rb-4.0.3&auto=format&fit=crop&w=1500&q=80)' }}>
          <div className="absolute inset-0 bg-estate-blue bg-opacity-80 flex items-center">
            <div className="container-custom text-white">
              <h1 className="text-3xl md:text-5xl font-bold mb-4">Buy2Sell Real Estate Investment Platform</h1>
              <p className="text-xl max-w-3xl">Secure, Profitable Real Estate Trading – Tailored Just for You. A revolutionary approach to real estate investment with guaranteed returns.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Investment Options</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              With Buy2Sell, you can purchase property in our carefully chosen estates, and we guarantee to facilitate a resale of your property within 6-12 months, aiming for profits as high as 30%.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            {/* Naira Investment Options */}
            <Card className="overflow-hidden border-estate-blue border-t-4 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="bg-gray-50">
                <h3 className="text-2xl font-semibold text-estate-blue">Individual Investment (Naira)</h3>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-gray-600 mb-6">
                  Looking to grow your wealth through smart real estate trades? Whether you're buying to hold or selling later for ROI, we've redefined the real estate experience to suit your goals perfectly.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle size={20} className="text-estate-blue mr-2 mt-1 flex-shrink-0" />
                    <span>Flexible investment options starting from ₦500,000</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle size={20} className="text-estate-blue mr-2 mt-1 flex-shrink-0" />
                    <span>Up to 30% ROI in 12 months</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle size={20} className="text-estate-blue mr-2 mt-1 flex-shrink-0" />
                    <span>Expert property selection assistance</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter className="bg-gray-50 flex justify-center">
                <Button className="bg-estate-blue hover:bg-estate-darkBlue">
                  <Download size={18} className="mr-2" />
                  Download Subscription Form
                </Button>
              </CardFooter>
            </Card>

            <Card className="overflow-hidden border-estate-red border-t-4 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="bg-gray-50">
                <h3 className="text-2xl font-semibold text-estate-red">Corporate Investment (Naira)</h3>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-gray-600 mb-6">
                  Earn passive income with zero hassle. Invest in our curated estates and let us handle the rest. We'll resell your property in 6 months for up to 12.5% profit, or in 12 months for as high as 30%. Your income is guaranteed from day one.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle size={20} className="text-estate-red mr-2 mt-1 flex-shrink-0" />
                    <span>Corporate investment packages from ₦5,000,000</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle size={20} className="text-estate-red mr-2 mt-1 flex-shrink-0" />
                    <span>12.5% guaranteed returns in 6 months</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle size={20} className="text-estate-red mr-2 mt-1 flex-shrink-0" />
                    <span>Full property management included</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter className="bg-gray-50 flex justify-center">
                <Button className="bg-estate-red hover:bg-red-700">
                  <Download size={18} className="mr-2" />
                  Download Subscription Form
                </Button>
              </CardFooter>
            </Card>

            {/* Dollar Investment Options */}
            <Card className="overflow-hidden border-green-600 border-t-4 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="bg-gray-50">
                <h3 className="text-2xl font-semibold text-green-600">Individual Investment (Dollar)</h3>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-gray-600 mb-6">
                  Tap into high-yield opportunities with dollar-backed real estate trades. Our innovative model ensures you get premium value whether you're holding or flipping your investment.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle size={20} className="text-green-600 mr-2 mt-1 flex-shrink-0" />
                    <span>Investments starting from $1,000</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle size={20} className="text-green-600 mr-2 mt-1 flex-shrink-0" />
                    <span>Dollar-denominated returns</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle size={20} className="text-green-600 mr-2 mt-1 flex-shrink-0" />
                    <span>Protection against currency fluctuation</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter className="bg-gray-50 flex justify-center">
                <Button className="bg-green-600 hover:bg-green-700">
                  <Download size={18} className="mr-2" />
                  Download Subscription Form
                </Button>
              </CardFooter>
            </Card>

            <Card className="overflow-hidden border-purple-600 border-t-4 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="bg-gray-50">
                <h3 className="text-2xl font-semibold text-purple-600">Corporate Investment (Dollar)</h3>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-gray-600 mb-6">
                  Looking for consistent returns in USD? Partner with us. Buy into our estates and we'll resell your property in 6–12 months, delivering up to 30% profit—all while you relax and watch your capital grow.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle size={20} className="text-purple-600 mr-2 mt-1 flex-shrink-0" />
                    <span>Corporate packages from $10,000</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle size={20} className="text-purple-600 mr-2 mt-1 flex-shrink-0" />
                    <span>Up to 30% ROI in USD</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle size={20} className="text-purple-600 mr-2 mt-1 flex-shrink-0" />
                    <span>Comprehensive investment support</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter className="bg-gray-50 flex justify-center">
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Download size={18} className="mr-2" />
                  Download Subscription Form
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* ROI Table Section */}
          <div className="mb-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Projected Returns</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Our Buy2Sell program offers guaranteed returns on your investment. Here's what you can expect based on investment period.
              </p>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Investment Type</TableHead>
                    <TableHead>Currency</TableHead>
                    <TableHead>6 Months ROI</TableHead>
                    <TableHead>12 Months ROI</TableHead>
                    <TableHead>Minimum Investment</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-semibold">Individual</TableCell>
                    <TableCell>Naira (₦)</TableCell>
                    <TableCell className="text-estate-blue font-semibold">10%</TableCell>
                    <TableCell className="text-estate-blue font-semibold">25%</TableCell>
                    <TableCell>₦500,000</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold">Corporate</TableCell>
                    <TableCell>Naira (₦)</TableCell>
                    <TableCell className="text-estate-red font-semibold">12.5%</TableCell>
                    <TableCell className="text-estate-red font-semibold">30%</TableCell>
                    <TableCell>₦5,000,000</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold">Individual</TableCell>
                    <TableCell>USD ($)</TableCell>
                    <TableCell className="text-green-600 font-semibold">8%</TableCell>
                    <TableCell className="text-green-600 font-semibold">20%</TableCell>
                    <TableCell>$1,000</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold">Corporate</TableCell>
                    <TableCell>USD ($)</TableCell>
                    <TableCell className="text-purple-600 font-semibold">10%</TableCell>
                    <TableCell className="text-purple-600 font-semibold">30%</TableCell>
                    <TableCell>$10,000</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>

          {/* How It Works Section */}
          <div className="mb-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">How Buy2Sell Works</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Our process is simple, transparent, and designed to maximize your returns with minimal hassle.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md relative border-t-4 border-estate-blue">
                <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-estate-blue text-white flex items-center justify-center font-bold text-lg">1</div>
                <h3 className="text-xl font-semibold mb-3 mt-4">Choose Your Investment</h3>
                <p className="text-gray-600">Select your investment option based on your budget and financial goals. We offer both Naira and Dollar denominated investments.</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md relative border-t-4 border-estate-red">
                <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-estate-red text-white flex items-center justify-center font-bold text-lg">2</div>
                <h3 className="text-xl font-semibold mb-3 mt-4">We Secure Your Property</h3>
                <p className="text-gray-600">Our team secures the best property with strong appreciation potential. All legal documentation is handled by our experts.</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md relative border-t-4 border-green-600">
                <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-lg">3</div>
                <h3 className="text-xl font-semibold mb-3 mt-4">Enjoy Guaranteed Returns</h3>
                <p className="text-gray-600">We facilitate the resale of your property within the agreed timeframe, ensuring you receive your principal plus the promised returns.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-estate-blue text-white text-center">
        <div className="container-custom">
          <h2 className="text-3xl font-bold mb-4">Ready to Invest with Buy2Sell?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">Start your journey to guaranteed real estate returns today. Our team is ready to assist you.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/contact" className="bg-white text-estate-blue hover:bg-gray-100 font-medium text-lg px-8 py-3 rounded transition duration-300">
              Contact Our Team
            </Link>
            <Link to="/services" className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-estate-blue font-medium text-lg px-8 py-3 rounded transition duration-300">
              View All Investment Services
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Buy2Sell;
