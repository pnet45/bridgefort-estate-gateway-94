
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Users, Calendar, Clock } from 'lucide-react';
import CenterTrainingBookingForm from './CenterTrainingBookingForm';

const CenterTrainingSection = () => {
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  return (
    <section className="py-16 bg-white">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-estate-blue mb-4">Center Training Programs</h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Bring professional real estate training directly to your center. Perfect for organizations looking to train multiple team members.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-center mb-12">
          <div>
            <h3 className="text-2xl font-bold text-estate-blue mb-6">Book Training for Your Center</h3>
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <Users className="text-estate-red mt-1" size={20} />
                <div>
                  <h4 className="text-left text-estate-brown font-semibold">Customized Group Training</h4>
                  <p className="text-left text-gray-600">Tailored training programs designed for your team's specific needs and goals.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="text-estate-red mt-1" size={20} />
                <div>
                  <h4 className="text-left text-estate-brown font-semibold">On-Location Training</h4>
                  <p className="text-left text-gray-600">Professional trainers come to your center, making it convenient for your team.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="text-estate-red mt-1" size={20} />
                <div>
                  <h4 className="text-left text-estate-brown font-semibold">Flexible Scheduling</h4>
                  <p className="text-left text-gray-600">Choose dates and times that work best for your center's schedule.</p>
                </div>
              </div>
            </div>
            <Button 
              onClick={() => setIsBookingOpen(true)}
              className="bg-estate-red hover:bg-red-600 text-white px-8 py-3 text-lg"
            >
              Book Center Training
            </Button>
          </div>

          <div className="relative">
            <img 
              src="/lovable-uploads/pbo1.jpg" 
              alt="Center Training" 
              className="rounded-lg shadow-lg w-full h-80 object-cover"
            />
            <div className="absolute inset-0 bg-estate-blue bg-opacity-20 rounded-lg"></div>
          </div>
        </div>

        {/* Available Training Programs */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-estate-blue mb-8 text-center">Available Training Programs</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-estate-blue">Real Estate Fundamentals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock size={16} />
                    <span>Duration: 2 Days</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users size={16} />
                    <span>Capacity: 20-50 participants</span>
                  </div>
                  <p className="text-gray-700">
                    Comprehensive introduction to real estate principles, market analysis, and investment strategies.
                  </p>
                  <Button variant="outline" className="w-full border-estate-blue text-estate-blue hover:bg-estate-blue hover:text-white">
                    Learn More
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-estate-blue">Sales Mastery</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock size={16} />
                    <span>Duration: 1 Day</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users size={16} />
                    <span>Capacity: 15-30 participants</span>
                  </div>
                  <p className="text-gray-700">
                    Advanced sales techniques, client relationship management, and closing strategies for real estate professionals.
                  </p>
                  <Button variant="outline" className="w-full border-estate-blue text-estate-blue hover:bg-estate-blue hover:text-white">
                    Learn More
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-estate-blue">Investment Strategies</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock size={16} />
                    <span>Duration: 3 Days</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users size={16} />
                    <span>Capacity: 10-25 participants</span>
                  </div>
                  <p className="text-gray-700">
                    In-depth training on property investment, portfolio management, and wealth building through real estate.
                  </p>
                  <Button variant="outline" className="w-full border-estate-blue text-estate-blue hover:bg-estate-blue hover:text-white">
                    Learn More
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <CenterTrainingBookingForm 
        open={isBookingOpen} 
        onClose={() => setIsBookingOpen(false)} 
      />
    </section>
  );
};

export default CenterTrainingSection;
