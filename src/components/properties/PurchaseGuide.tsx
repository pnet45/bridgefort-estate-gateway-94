
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, Mail, Phone, CheckCircle } from 'lucide-react';

const PurchaseGuide = () => {
  const steps = [
    {
      number: 1,
      title: "Select Your Preferred Estate",
      description: "Browse through our available estates to identify the one that best suits your needs and preferences. Once you have made your choice, click on the \"View Details\" button associated with your selected estate."
    },
    {
      number: 2,
      title: "Download the Subscription Form",
      description: "After clicking \"View Details,\" you will find an option to download the official subscription form for your chosen estate. This form is a crucial document required to formalize your interest."
    },
    {
      number: 3,
      title: "Complete the Subscription Form",
      description: "You can fill out the form by printing it and using BLOCK LETTERS with a pen, or by opening the PDF file on your device and entering details digitally for a paperless process."
    },
    {
      number: 4,
      title: "Make Payment & Obtain Proof",
      description: "Proceed to make the required payment for your selected estate through our approved payment channels. Ensure you obtain valid proof of payment (bank receipt, transaction slip, or confirmation notification)."
    },
    {
      number: 5,
      title: "Submit Your Documents",
      description: "Send the completed subscription form (scanned if handwritten or filled PDF if done electronically) along with your proof of payment as email attachments to our sales team."
    },
    {
      number: 6,
      title: "Receive Your Payment Receipt",
      description: "Our team will verify the details and process your payment. Once confirmed, an official payment receipt will be generated and sent to you via email for your records."
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-estate-blue">How To Subscribe & Purchase</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Follow our simple step-by-step guide to purchase your dream property
          </p>
          <Badge variant="outline" className="mt-4 text-estate-blue border-estate-blue">
            Comprehensive Step-by-Step Guide
          </Badge>
        </div>

        <div className="grid gap-8 md:gap-6">
          {steps.map((step, index) => (
            <Card key={step.number} className="hover:shadow-lg transition-shadow duration-300 animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-estate-blue text-white rounded-full flex items-center justify-center font-bold text-lg">
                    {step.number}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl text-estate-blue mb-2">{step.title}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed ml-16">{step.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contact Information */}
        <div className="mt-12 grid md:grid-cols-2 gap-8">
          <Card className="bg-estate-blue text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Mail className="h-5 w-5" />
                Email Submission
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="font-medium">Send documents to:</p>
                <a href="mailto:sales@pwanbridgefort.ng" className="text-gray-200 hover:text-white transition-colors">
                  📧 sales@bridgeforthome.com
                </a>
                <p className="text-sm text-gray-200 mt-3">
                  Subject Line: "Estate Subscription & Payment Confirmation – (Your Name)"
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-estate-red text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Phone className="h-5 w-5" />
                Need Assistance?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="font-medium">Sales Hotline:</p>
                <a href="tel:+2348030624059" className="text-gray-200 hover:text-white transition-colors text-lg font-bold">
                  📞 +234 803 062 4059
                </a>
                <p className="text-sm text-gray-200 mt-3">
                  Our customer support team is ready to assist you at any stage of your purchase journey.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Success Message */}
        <div className="mt-12 text-center">
          <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
            <CardContent className="pt-6">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-estate-blue mb-2">Congratulations! 🏡✨</h3>
              <p className="text-lg text-gray-700 max-w-2xl mx-auto">
                Thank you for taking this exciting step toward owning a property in one of our exquisite estates! 
                We look forward to welcoming you as a valued homeowner.
              </p>
              <p className="text-estate-blue font-medium mt-4">
                Thank you for choosing us as your trusted real estate partner!
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default PurchaseGuide;
