
import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const FAQ: React.FC = () => {
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
    <div className="mb-16">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Find answers to the most common questions about our Buy and Resell program.
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
  );
};

export default FAQ;
