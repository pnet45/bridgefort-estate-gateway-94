import React, { useState } from 'react';
import { Calendar, MapPin, Clock, ChevronRight, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import TrainingRegistrationForm from '../training/TrainingRegistrationForm';

const FeaturedCenterSeminar = () => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);

  return (
    <>
      <section className="py-10 md:py-14 lg:py-16 bg-gradient-to-br from-estate-blue via-blue-900 to-estate-darkBlue text-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-40 h-40 border-2 border-white rounded-full animate-pulse" />
          <div className="absolute bottom-20 left-10 w-28 h-28 border border-white rounded-full animate-pulse" style={{ animationDelay: '1.5s' }} />
        </div>

        <div className="container-custom relative z-10">
          <div className="text-center mb-4">
            <span className="inline-flex items-center gap-2 bg-estate-red/90 text-white px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold uppercase tracking-wide">
              <Calendar size={14} /> Special Invitation — Center Training
            </span>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 md:gap-8 lg:gap-10 items-center">
            {/* Image */}
            <div className="flex justify-center animate-fade-in">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20 w-full max-w-[340px] sm:max-w-sm md:max-w-md bg-black/20">
                  <img
                    src="/images/dalvin-silva-seminar.jpeg"
                    srcSet="/images/dalvin-silva-seminar.jpeg 1x, /images/dalvin-silva-seminar.jpeg 2x"
                    sizes="(max-width: 640px) 85vw, (max-width: 1024px) 60vw, 440px"
                    alt="Amb. Dalvin Silva - MD/CEO Bridgefort Homes Development Ltd"
                    className="w-full h-auto max-h-[60vh] object-contain"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
            </div>

            {/* Content */}
            <div className="space-y-4 md:space-y-5 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight">
                PWAN Bethel Home Center
                <span className="block text-estate-gold mt-1">Seminar with Amb. Dalvin Silva</span>
              </h2>

              <p className="text-gray-200 text-base sm:text-lg leading-relaxed">
                A special center training seminar designed to empower real estate professionals and aspiring investors 
                with cutting-edge strategies for wealth creation through real estate investment. Learn directly from 
                one of Nigeria's most dynamic real estate leaders.
              </p>

              {/* Event Details */}
              <div className="grid sm:grid-cols-2 gap-4 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-white/20 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold">Tuesday, April 21, 2026</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-white/20 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold">11:00 AM</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 sm:col-span-2">
                  <div className="w-11 h-11 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Okey Bar, 109 Muyibi Street, by Wilmer Bus Stop, Olodi Apapa, Lagos</p>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="flex flex-wrap gap-4 pt-2">
                <Button
                  onClick={() => setIsDetailsOpen(true)}
                  className="bg-estate-red hover:bg-red-600 text-white px-8 py-3 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  View Details <ChevronRight className="ml-2 w-5 h-5" />
                </Button>
                <Button
                  onClick={() => setIsRegistrationOpen(true)}
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-estate-blue px-8 py-3 text-lg font-semibold rounded-lg transition-all duration-300"
                >
                  Register Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-estate-blue">
              PWAN Bethel Home Center Seminar
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="rounded-xl overflow-hidden">
              <img
                src="/images/dalvin-silva-seminar.jpeg"
                alt="Amb. Dalvin Silva"
                className="w-full max-h-96 object-contain bg-gray-100"
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-bold">Special Guest Speaker</h3>
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <img src="/images/dalvin-silva-seminar.jpeg" alt="Dalvin Silva" className="w-16 h-16 rounded-full object-cover border-2 border-estate-red" />
                <div>
                  <p className="font-bold text-lg">Amb. Dalvin Silva</p>
                  <p className="text-muted-foreground">MD/CEO, Bridgefort Homes Development Ltd.</p>
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-estate-blue mt-0.5" />
                <div>
                  <p className="font-medium">Date</p>
                  <p className="text-muted-foreground">Tuesday, April 21, 2026</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-estate-blue mt-0.5" />
                <div>
                  <p className="font-medium">Time</p>
                  <p className="text-muted-foreground">11:00 AM</p>
                </div>
              </div>
              <div className="flex items-start gap-3 sm:col-span-2">
                <MapPin className="h-5 w-5 text-estate-blue mt-0.5" />
                <div>
                  <p className="font-medium">Venue</p>
                  <p className="text-muted-foreground">Pwan Bethel Home Center, Okey Bar, 109 Muyibi Street, by Wilmer Bus Stop, Olodi Apapa, Lagos</p>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">About This Seminar</h3>
              <p className="text-muted-foreground leading-relaxed">
                This exclusive seminar at PWAN Bethel Home Center is designed to empower real estate professionals 
                and aspiring investors with cutting-edge strategies for wealth creation through real estate investment. 
                Learn directly from one of Nigeria's most dynamic real estate leaders about property acquisition, 
                investment planning, and building a successful career in real estate.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-3">
                Don't miss this opportunity to network, learn, and grow your real estate portfolio with expert 
                guidance from the MD/CEO himself. Topics include land banking, Buy2Sell investment strategies, 
                property development insights, and how to build generational wealth through smart real estate decisions.
              </p>
            </div>

            <Button
              onClick={() => {
                setIsDetailsOpen(false);
                setIsRegistrationOpen(true);
              }}
              className="w-full bg-estate-red hover:bg-red-600 text-white py-3 text-lg font-semibold"
            >
              Register for This Seminar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Registration Form */}
      <TrainingRegistrationForm
        open={isRegistrationOpen}
        onClose={() => setIsRegistrationOpen(false)}
        eventTitle="PWAN Bethel Home Center Seminar with Amb. Dalvin Silva"
        eventDate="2026-04-21"
      />
    </>
  );
};

export default FeaturedCenterSeminar;
