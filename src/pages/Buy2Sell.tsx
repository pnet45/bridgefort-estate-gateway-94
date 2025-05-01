
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Download, CheckCircle, FileText, CreditCard, Send } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { useIsMobile } from '@/hooks/use-mobile';

const Buy2Sell = () => {
  const isMobile = useIsMobile();
  const [isLoaded, setIsLoaded] = useState(false);

  React.useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Process steps data
  const processSteps = [
    {
      title: "Client Documentation",
      description: "Understand the form by clearly reading through, after which you pick an estate then choose what subscription plan is suitable for you and then you download and fill the form.",
      icon: FileText,
      reward: "Contract of sale"
    },
    {
      title: "Making Payments",
      description: "All our account numbers will be provided with the name PWAN GROUP LIMITED for Payments. You can pay through bank transfers with your mobile phone or cash deposit at the banks.",
      icon: CreditCard,
      reward: "Official Receipt"
    },
    {
      title: "Submission",
      description: "Attach your evidence of payment (physical or emailed copy) and submit at the office, attaching your valid form of identity and bring to the office.",
      icon: Send,
      reward: "Post Dated Cheque"
    }
  ];

  // FAQ data
  const faqs = [
    {
      question: "WHAT IS BUY TO SELL?",
      answer: "It's an initiative from PWAN GROUP, which gives you an opportunity to trade real estate and make up to 30%, 50%, 70% profit over a period of 12, 18, 24 months respectively."
    },
    {
      question: "WHAT PACKAGES ARE AVAILABLE IN THE BUY TO SELL SPECIAL OFFER?",
      answer: "A. FLOURISH LUXURY VILLAS ILORIN \nB. FLOURISH LUXURY VILLAS EPE \nC. FLOURISH LUXURY VILLAS MONASTERY"
    },
    {
      question: "WHO ARE THE OWNERS OF THESE PRODUCTS?",
      answer: "PWAN GROUP LTD, a leading Real Estate Company with its office in Puri Mall, Lekki, Lagos State."
    },
    {
      question: "WHAT DO I GET AFTER PAYMENT?",
      answer: "(i) Payment Receipt (ii) Contract of Sale (iii) Post Date Cheque (Optional)"
    },
    {
      question: "HOW MUCH DOES A PLOT COST?",
      answer: "A Minimum of 600 Sqm @ N1,250 per Sqm for Flourish Luxury Villas, Ilorin\nA Minimum of 300 Sqm @ N12,500 per Sqm for Flourish Luxury Villas, Epe\nA Minimum of 300 Sqm @ N66,666.67 per Sqm for Flourish Luxury Villas, Monastery"
    },
    {
      question: "WHAT IS THE SIZE OF THE PLOT?",
      answer: "A. The Flourish Luxury Villas Ilorin: 8000Sqm, 4000Sqm, 3600Sqm, 2400Sqm,1600Sqm, 1200Sqm, 800Sqm, and 600Sqm respectively\nB. The Flourish Luxury Villas Epe: 4000Sqm, 3000Sqm, 2000Sqm, 1500Sqm, 1000Sqm, 900Sqm,600Sqm,450Sqm, and 300Sqm respectively\nC. The Flourish Luxury Villas Monastery: 3000 Sqm, 1500 Sqm, 1200 Sqm, 900Sqm, 600Sqm and 300 sqm respectively"
    },
    {
      question: "CAN I DECIDE TO KEEP MY PLOT/PROPERTY?",
      answer: "Yes, A new form shall be filled and a new contract of sale and other accompanying documents issued in place of the previous contract of sale."
    },
    {
      question: "CAN I PAY CASH TO YOUR AGENT?",
      answer: "WE STRONGLY ADVISE THAT ALL PAYMENTS SHOULD ONLY BE MADE TO PWAN GROUP LTD AT ITS DESIGNATED BANKS. WE SHALL NOT ACCEPT ANY RESPONSIBILITY FOR ANY LIABILITY THAT MAY ARISE AS RESULT OF A DEVIATION FROM THE ABOVE INSTRUCTION."
    },
    {
      question: "IS PWAN GROUP LTD AML/CFT COMPLAINT?",
      answer: "Yes."
    }
  ];

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

      {/* Intro Section with Animation */}
      <section className="py-12 bg-gray-50">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className={`${isLoaded ? 'animate-fade-in' : 'opacity-0'} transition-all duration-500 space-y-4`}>
              <h2 className="text-3xl font-bold mb-4 text-estate-blue">What is Buy2Sell?</h2>
              <p className="text-lg">
                Buy to Sell is a fast and reliable source of income while trading with PWAN Group. Real Estate serves more than residential purposes. With Buy to Sell, you can buy from our Estates and we help you sell the property in 6 or 12 months for as high as 30% profit. This is the best mode of passive income that allows you to earn without risks as your income is certain from the moment you buy.
              </p>
              <Button 
                className="bg-estate-red hover:bg-red-700 mt-4"
                onClick={() => document.getElementById('investment-options')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Explore Investment Options
              </Button>
            </div>
            
            <div className="flex justify-center">
              {/* Animated promotion carousel */}
              <Carousel className={`w-full max-w-md ${isLoaded ? 'animate-scale-in' : 'opacity-0'}`}>
                <CarouselContent>
                  <CarouselItem>
                    <img 
                      src="/lovable-uploads/7134ea24-5432-4742-afa9-4a5b736dd8eb.png" 
                      alt="Buy2Sell 6 Months Investment" 
                      className="rounded-lg shadow-xl w-full h-auto hover:scale-105 transition-transform duration-500"
                    />
                  </CarouselItem>
                  <CarouselItem>
                    <img 
                      src="/lovable-uploads/cc5f0271-0388-40f9-8e69-1fbd5ea1e606.png" 
                      alt="Buy2Sell 12 Months Investment" 
                      className="rounded-lg shadow-xl w-full h-auto hover:scale-105 transition-transform duration-500"
                    />
                  </CarouselItem>
                  <CarouselItem>
                    <img 
                      src="/lovable-uploads/aeaad90d-a317-4a58-8cba-912498e233e5.png" 
                      alt="Buy2Sell ROI Table" 
                      className="rounded-lg shadow-xl w-full h-auto hover:scale-105 transition-transform duration-500"
                    />
                  </CarouselItem>
                  <CarouselItem>
                    <img 
                      src="/lovable-uploads/2f745990-7323-42b1-87f3-eb1a3f2db0ba.png" 
                      alt="Flourish Luxury Villas" 
                      className="rounded-lg shadow-xl w-full h-auto hover:scale-105 transition-transform duration-500"
                    />
                  </CarouselItem>
                </CarouselContent>
                <CarouselPrevious className="left-1" />
                <CarouselNext className="right-1" />
              </Carousel>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - 3 Easy Steps */}
      <section className="py-16">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">YOU CAN START EARNING THROUGH 3 EASY STEPS</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">How do I start trading?</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {processSteps.map((step, index) => (
              <div 
                key={index}
                className={`bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ${
                  isLoaded ? 'animate-fade-in' : 'opacity-0'
                }`}
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="bg-estate-blue bg-opacity-10 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                    <step.icon size={28} className="text-estate-blue" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-gray-600 mb-4">{step.description}</p>
                  <div className="bg-green-50 px-4 py-2 rounded-full">
                    <p className="text-green-700 font-semibold">Reward: {step.reward}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section id="investment-options" className="py-16">
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

          {/* ROI Table Section with Promo Image */}
          <div className="mb-16 bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4">Projected Returns</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Our Buy2Sell program offers guaranteed returns on your investment. Here's what you can expect based on investment period.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className={`overflow-x-auto ${isLoaded ? 'animate-fade-in' : 'opacity-0'}`}>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Investment Type</TableHead>
                        <TableHead>Currency</TableHead>
                        <TableHead>6 Months ROI</TableHead>
                        <TableHead>12 Months ROI</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-semibold">Individual</TableCell>
                        <TableCell>Naira (₦)</TableCell>
                        <TableCell className="text-estate-blue font-semibold">10%</TableCell>
                        <TableCell className="text-estate-blue font-semibold">25%</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-semibold">Corporate</TableCell>
                        <TableCell>Naira (₦)</TableCell>
                        <TableCell className="text-estate-red font-semibold">12.5%</TableCell>
                        <TableCell className="text-estate-red font-semibold">30%</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-semibold">Individual</TableCell>
                        <TableCell>USD ($)</TableCell>
                        <TableCell className="text-green-600 font-semibold">8%</TableCell>
                        <TableCell className="text-green-600 font-semibold">20%</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-semibold">Corporate</TableCell>
                        <TableCell>USD ($)</TableCell>
                        <TableCell className="text-purple-600 font-semibold">10%</TableCell>
                        <TableCell className="text-purple-600 font-semibold">30%</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
                
                <div className={`flex justify-center ${isLoaded ? 'animate-fade-in' : 'opacity-0'}`} style={{ animationDelay: '200ms' }}>
                  <img 
                    src="/lovable-uploads/aeaad90d-a317-4a58-8cba-912498e233e5.png" 
                    alt="ROI Investment Table" 
                    className="rounded-lg shadow-lg max-w-full h-auto hover:scale-105 transition-transform duration-500"
                    style={{ maxHeight: '500px' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Featured Property - Animated */}
          <div className="mb-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Featured Property</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Explore our featured property offering with excellent ROI potential.
              </p>
            </div>

            <div className={`bg-white rounded-lg shadow-lg overflow-hidden ${isLoaded ? 'animate-scale-in' : 'opacity-0'}`}>
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="p-8 flex items-center">
                  <img 
                    src="/lovable-uploads/2f745990-7323-42b1-87f3-eb1a3f2db0ba.png" 
                    alt="Flourish Luxury Villas" 
                    className="w-full h-auto rounded-lg shadow-lg hover:scale-105 transition-transform duration-500"
                  />
                </div>
                
                <div className="p-8 bg-estate-blue text-white">
                  <h3 className="text-2xl font-bold mb-4">FLOURISH LUXURY VILLAS</h3>
                  <p className="mb-6">
                    Our premium development offering exceptional returns on investment. Whether you choose Buy2Sell or Buy2Keep, you're guaranteed excellent value.
                  </p>
                  
                  <div className="space-y-4 mb-6">
                    <h4 className="text-xl font-semibold">Available Options:</h4>
                    <ul className="space-y-2">
                      <li className="flex items-center">
                        <CheckCircle size={20} className="mr-2 text-white" />
                        <span>Flourish Luxury Villas Ilorin</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle size={20} className="mr-2 text-white" />
                        <span>Flourish Luxury Villas Epe</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle size={20} className="mr-2 text-white" />
                        <span>Flourish Luxury Villas Monastery</span>
                      </li>
                    </ul>
                  </div>
                  
                  <Button className="bg-white text-estate-blue hover:bg-gray-100 w-full">
                    Request More Information
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Section - Accordion */}
          <div className="mb-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Find answers to the most common questions about our Buy2Sell program.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-lg font-semibold">{faq.question}</AccordionTrigger>
                    <AccordionContent>
                      <p className="whitespace-pre-line">{faq.answer}</p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
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
