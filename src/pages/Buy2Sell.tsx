
import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Download, CheckCircle, CircleCheck, FileText } from 'lucide-react';
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const Buy2Sell = () => {
  const isMobile = useIsMobile();

  const steps = [
    {
      title: "Client documentation",
      content: "Understand the form by clearly reading through, after which you pick an estate then choose what subscription plan is suitable for you and then you download and fill the form",
      reward: "Contract of sale"
    },
    {
      title: "Making payments",
      content: "All our account numbers will be provided With the name PWAN GROUP LIMITED for Payments. you can pay through bank transfers with your mobile phone or cash deposit at the banks.",
      reward: "Official Receipt"
    },
    {
      title: "Submission",
      content: "Attach your evidence of payment (physical or emailed copy) and submit at the office, attaching your valid form of identity and bring to the office",
      reward: "Post Dated Cheque"
    }
  ];

  const faqs = [
    {
      question: "WHAT IS BUY TO SELL?",
      answer: "It's an initiative from PWAN GROUP, which gives you an opportunity to trade real estate and make up to 30%, 50%, 70% profit over a period of 12, 18, 24 months respectively."
    },
    {
      question: "WHAT PACKAGES ARE AVAILABLE IN THE BUY TO SELL SPECIAL OFFER?",
      answer: "A. FLOURISH LUXURY VILLAS ILORIN\nB. FLOURISH LUXURY VILLAS EPE\nC. FLOURISH LUXURY VILLAS MONASTERY"
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

      {/* What is Buy2Sell Section */}
      <section className="py-12 bg-white">
        <div className="container-custom">
          <div className="flex flex-col lg:flex-row gap-8 items-center">
            <div className="lg:w-1/2">
              <h2 className="text-3xl font-bold mb-6 text-estate-blue">What is Buy to Sell?</h2>
              <p className="text-lg mb-6">
                Buy to Sell is a fast and reliable source of income while trading with PWAN Group. Real Estate serves more than residential purposes. With Buy to Sell, you can buy from our Estates and we help you sell the property in 6 or 12 months for as high as 30% profit. This is the best mode of passive income that allows you to earn without risks as your income is certain from the moment you buy.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button className="bg-estate-red hover:bg-red-700 text-white">
                  <Download className="mr-2" />
                  Download Subscription Form
                </Button>
                <Link to="/contact">
                  <Button variant="outline" className="border-estate-blue text-estate-blue hover:bg-estate-blue hover:text-white">
                    Contact Us
                  </Button>
                </Link>
              </div>
            </div>
            <div className="lg:w-1/2">
              <Carousel className="w-full">
                <CarouselContent>
                  <CarouselItem>
                    <img 
                      src="/lovable-uploads/da0f7fae-fe5f-4f62-b34d-ff105d64271c.png" 
                      alt="Buy2Sell 6 months profit" 
                      className="w-full h-auto rounded-lg shadow-lg"
                    />
                  </CarouselItem>
                  <CarouselItem>
                    <img 
                      src="/lovable-uploads/314674b2-9424-4c15-b9bd-a8ce97a6084d.png" 
                      alt="Buy2Sell 12 months profit" 
                      className="w-full h-auto rounded-lg shadow-lg"
                    />
                  </CarouselItem>
                </CarouselContent>
                <CarouselPrevious className="left-2" />
                <CarouselNext className="right-2" />
              </Carousel>
            </div>
          </div>
        </div>
      </section>

      {/* How to Start Trading Section */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-estate-blue">YOU CAN START EARNING THROUGH 3 EASY STEPS</h2>
            <p className="text-xl text-gray-700">How do I start trading?</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <Card key={index} className={`border-t-4 ${
                index === 0 ? "border-estate-blue" : 
                index === 1 ? "border-estate-red" : 
                "border-green-600"
              } shadow-lg hover:shadow-xl transition-shadow`}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${
                      index === 0 ? "bg-estate-blue" : 
                      index === 1 ? "bg-estate-red" : 
                      "bg-green-600"
                    }`}>
                      {index + 1}
                    </div>
                    <h3 className="text-xl font-semibold">{step.title}</h3>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">{step.content}</p>
                </CardContent>
                <CardFooter className="bg-gray-50 flex flex-col items-start">
                  <p className="font-medium text-gray-700">Reward:</p>
                  <p className="flex items-center gap-2 text-green-600">
                    <CircleCheck className="h-5 w-5" />
                    {step.reward}
                  </p>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Investment Options Section */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-6 text-estate-blue">Our Investment Packages</h2>
            <p className="text-xl text-gray-700">See how you can make your money work for you trading real estate</p>
          </div>

          <div className="mb-12">
            <div className="flex justify-center mb-8">
              <img 
                src="/lovable-uploads/4ff5e45c-ce33-48bb-bc5c-ff3ae1787591.png" 
                alt="Investment table" 
                className="rounded-lg shadow-lg max-w-full"
              />
            </div>

            <div className="flex justify-center">
              <img 
                src="/lovable-uploads/875f7495-5533-4089-98d4-6a5a690799e9.png" 
                alt="Flourish Luxury Villas EPE" 
                className="rounded-lg shadow-lg max-w-full"
              />
            </div>
          </div>

          <div className={`overflow-x-auto bg-white p-4 rounded-lg shadow-md ${isMobile ? "text-sm" : ""}`}>
            <h3 className="text-2xl font-bold mb-4 text-estate-blue">Flourish Luxury Villas EPE</h3>
            <Table>
              <TableHeader className="bg-estate-blue text-white">
                <TableRow>
                  <TableHead className="text-white">Square Meters</TableHead>
                  <TableHead className="text-white">Buy At (₦)</TableHead>
                  <TableHead className="text-white">Sell At (₦) in 12 months</TableHead>
                  <TableHead className="text-white">Profit (₦)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">300</TableCell>
                  <TableCell>3,000,000</TableCell>
                  <TableCell>3,900,000</TableCell>
                  <TableCell className="text-green-600">900,000</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">450</TableCell>
                  <TableCell>4,500,000</TableCell>
                  <TableCell>5,850,000</TableCell>
                  <TableCell className="text-green-600">1,350,000</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">600</TableCell>
                  <TableCell>6,000,000</TableCell>
                  <TableCell>7,800,000</TableCell>
                  <TableCell className="text-green-600">1,800,000</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">900</TableCell>
                  <TableCell>9,000,000</TableCell>
                  <TableCell>11,700,000</TableCell>
                  <TableCell className="text-green-600">2,700,000</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">F.A.Q</h2>
            <p className="text-xl text-gray-700">Frequently Asked Questions</p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left font-semibold">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="whitespace-pre-line text-gray-700">{faq.answer}</p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-estate-blue text-white">
        <div className="container-custom text-center">
          <h2 className="text-3xl font-bold mb-4">Start Trading Real Estate Today!</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of investors who have secured their financial future through our Buy2Sell program.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button className="bg-white text-estate-blue hover:bg-gray-200 px-8 py-6 text-lg">
              <FileText className="mr-2" />
              Download Subscription Form
            </Button>
            <Link to="/contact">
              <Button variant="outline" className="border-white text-white hover:bg-white hover:text-estate-blue px-8 py-6 text-lg">
                Contact Our Team
              </Button>
            </Link>
          </div>
          
          <div className="mt-12 bg-white bg-opacity-10 p-6 rounded-lg max-w-xl mx-auto">
            <p className="font-semibold mb-2">Official Bank Details:</p>
            <p className="mb-1">Zenith Bank: 1214103477</p>
            <p className="mb-1">Fidelity Bank: 5080134956</p>
            <p className="text-sm mt-4">ALL PAYMENTS SHOULD BE MADE IN FAVOUR OF PWAN GROUP LTD</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Buy2Sell;
