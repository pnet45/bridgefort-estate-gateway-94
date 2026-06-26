import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Users, Trophy, Clock, ChevronRight } from 'lucide-react';
import SummitDetailsDialog from './summit/SummitDetailsDialog';
const SuccessSummit = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const eventHighlights = [{
    icon: Trophy,
    title: "Expert Speakers",
    description: "Learn from industry leaders and successful entrepreneurs"
  }, {
    icon: Users,
    title: "Networking",
    description: "Connect with like-minded individuals and potential partners"
  }, {
    icon: Calendar,
    title: "Action Plans",
    description: "Get practical strategies you can implement immediately"
  }];
  return <>
      <section className="py-16 bg-gradient-to-br from-estate-blue to-estate-darkBlue text-white relative overflow-hidden animate-fade-in">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 border border-white rounded-full animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-24 h-24 border border-white rounded-full animate-pulse" style={{
          animationDelay: '1s'
        }}></div>
          <div className="absolute top-1/2 left-1/4 w-16 h-16 border border-white rounded-full animate-pulse" style={{
          animationDelay: '2s'
        }}></div>
        </div>

        <div className="container-custom relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div className="space-y-6 animate-slide-in-left">
              <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full text-sm font-medium">
                <Calendar size={16} />
                Wealth Summit Series
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                Wealth Summit
                <span className="block text-estate-gold">2026</span>
              </h2>
              
              <p className="text-xl text-gray-200 leading-relaxed">
                Join Nigeria's most impactful wealth creation and real estate investment summit. 
                Transform your financial future with proven strategies from industry experts.
              </p>

              {/* Event Details */}
              <div className="grid sm:grid-cols-2 gap-4 py-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-semibold">July 7, 14, 21,28, 2026</p>
                    <p className="text-sm text-gray-300">All Tuesdays in July</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-semibold">10:00 AM</p>
                    <p className="text-sm text-gray-300">Full Day Event</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-semibold">Bridgefort Homes Office, Suite 8, Gacoun Plaza Opposite K-Close, 23 Road Festac Town, Lagos, Nigeria</p>
                    <p className="text-sm text-gray-300">Summit Venue</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-semibold">Only 50 Participants</p>
                    <p className="text-sm text-gray-300">Limited Seats</p>
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4 pt-4">
                <Button onClick={() => setIsDialogOpen(true)} className="bg-estate-red hover:bg-red-600 text-white px-8 py-3 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  View Details
                  <ChevronRight className="ml-2 w-5 h-5" />
                </Button>
                
                <Button variant="outline" className="border-white text-white hover:bg-white hover:text-estate-blue px-8 py-3 text-lg font-semibold rounded-lg transition-all duration-300" onClick={() => window.open('tel:+2348030624059', '_self')}>
                  Call to Register
                </Button>
              </div>
            </div>

            {/* Highlights */}
            <div className="space-y-6 animate-slide-in-right">
              <h3 className="text-2xl font-bold mb-6">What You'll Experience</h3>
              
              <div className="space-y-4">
                {eventHighlights.map((highlight, index) => {
                const IconComponent = highlight.icon;
                return <div key={index} className="flex items-start gap-4 p-4 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-all duration-300 animate-fade-in" style={{
                  animationDelay: `${index * 0.2}s`
                }}>
                      <div className="w-12 h-12 bg-estate-red rounded-lg flex items-center justify-center flex-shrink-0">
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-lg mb-1">{highlight.title}</h4>
                        <p className="text-gray-200">{highlight.description}</p>
                      </div>
                    </div>;
              })}
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 animate-pulse">
                <p className="text-center text-lg font-semibold mb-2">Pre-Registration is Compulsory!</p>
                <p className="text-center text-3xl font-bold text-estate-gold mb-2">ONLY 5 OUTSTANDING PARTICIPANTS WILL QUALIFY FOR DIRECT MENTORSHIP</p>
                <p className="text-center text-sm text-gray-300">Price: Free </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SummitDetailsDialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} />
    </>;
};
export default SuccessSummit;