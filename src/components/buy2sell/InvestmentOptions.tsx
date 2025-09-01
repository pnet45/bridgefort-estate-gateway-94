
import React from 'react';
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Download } from 'lucide-react';

const InvestmentOptions: React.FC = () => {
  return (
    <section id="investment-options" className="py-16">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Our Land Trading Options</h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            With Buy and Resell, you can purchase property in our carefully chosen estates, and we guarantee to facilitate a resale of your property within 6-12 months, aiming for profit as high as 30%.
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
                Looking to grow your wealth through smart real estate trades? Whether you're buying to hold or selling later for profit, we've redefined the real estate experience to suit your goals perfectly.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle size={20} className="text-estate-blue mr-2 mt-1 flex-shrink-0" />
                  <span>Flexible land trading options starting from ₦500,000</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle size={20} className="text-estate-blue mr-2 mt-1 flex-shrink-0" />
                  <span>Get up to 30% in 12 months</span>
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
              <h3 className="text-2xl font-semibold text-estate-red">Corporate Land Trading (Naira)</h3>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-gray-600 mb-6">
                Earn passive income with zero hassle. Land trade in our curated estates and let us handle the rest. We'll resell your property in 6 months for up to 12.5% profit, or in 12 months for as high as 30%. Your profit is guaranteed from day one.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle size={20} className="text-estate-red mr-2 mt-1 flex-shrink-0" />
                  <span>Corporate land trading packages from ₦5,000,000</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle size={20} className="text-estate-red mr-2 mt-1 flex-shrink-0" />
                  <span>12.5% guaranteed profit in 6 months</span>
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
              <h3 className="text-2xl font-semibold text-green-600">Individual Land Trading (Dollar)</h3>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-gray-600 mb-6">
                Tap into high-yield opportunities with dollar-backed real estate trades. Our innovative model ensures you get premium value whether you're holding or flipping your land trading.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle size={20} className="text-green-600 mr-2 mt-1 flex-shrink-0" />
                  <span>Land trading starting from $1,000</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle size={20} className="text-green-600 mr-2 mt-1 flex-shrink-0" />
                  <span>Dollar-denominated profit</span>
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
              <h3 className="text-2xl font-semibold text-purple-600">Corporate Land Trading (Dollar)</h3>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-gray-600 mb-6">
                Looking for consistent profit in USD? Partner with us. Buy into our estates and we'll resell your property in 6–12 months, delivering up to 30% profit—all while you relax and watch your capital grow.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle size={20} className="text-purple-600 mr-2 mt-1 flex-shrink-0" />
                  <span>Corporate packages from $10,000</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle size={20} className="text-purple-600 mr-2 mt-1 flex-shrink-0" />
                  <span>Up to 30% profit in USD</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle size={20} className="text-purple-600 mr-2 mt-1 flex-shrink-0" />
                  <span>Comprehensive land trading support</span>
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
      </div>
    </section>
  );
};

export default InvestmentOptions;
