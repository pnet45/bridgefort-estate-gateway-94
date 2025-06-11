
import React from 'react';
import { Phone, Mail, MessageCircle } from 'lucide-react';

const SubscriptionGuide = () => {
  return (
    <section className="py-16 bg-white border-t border-gray-200">
      <div className="container-custom">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-6 text-estate-blue">
              Ready to Secure Your Plot?
            </h2>
            <p className="text-gray-600 mb-6">
              Start your real estate investment journey today. Our flexible payment plans 
              make property ownership accessible and affordable.
            </p>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-estate-blue rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">1</span>
                </div>
                <span className="text-gray-700">Choose your preferred property</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-estate-blue rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">2</span>
                </div>
                <span className="text-gray-700">Contact us for subscription details</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-estate-blue rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">3</span>
                </div>
                <span className="text-gray-700">Complete your payment plan</span>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4 text-estate-blue">Need Assistance?</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-estate-blue" />
                <div>
                  <p className="font-medium text-estate-blue">Contact:</p>
                  <p className="text-gray-600">+234 803 062 4059</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-estate-blue" />
                <div>
                  <p className="font-medium text-estate-blue">Email:</p>
                  <p className="text-gray-600">info@pwanbridgefort.com</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <MessageCircle className="h-5 w-5 text-estate-blue" />
                <div>
                  <p className="font-medium text-estate-blue">WhatsApp:</p>
                  <p className="text-gray-600">+234 803 062 4059</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SubscriptionGuide;
