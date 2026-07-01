import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Users, Trophy, Clock, ChevronRight, Star } from 'lucide-react';
import SummitDetailsDialog from './summit/SummitDetailsDialog';
import TrainingRegistrationForm from './TrainingRegistrationForm';

const WealthSummit = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const openRegistration = () => setIsRegistrationOpen(true);
  const closeRegistration = () => setIsRegistrationOpen(false);

  const eventHighlights = [
    {
      icon: Trophy,
      title: "Expert Speakers",
      description: "Learn from industry leaders and successful entrepreneurs"
    },
    {
      icon: Users,
      title: "Networking",
      description: "Connect with like-minded individuals and potential partners"
    },
    {
      icon: Calendar,
      title: "Action Plans",
      description: "Get practical strategies you can implement immediately"
    }
  ];

  return <>
    <section className="py-16 bg-gradient-to-br from-estate-blue to-estate-darkBlue text-white relative overflow-hidden animate-fade-in">

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 border border-white rounded-full animate-pulse" />
        <div className="absolute bottom-10 right-10 w-24 h-24 border border-white rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/4 w-16 h-16 border border-white rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="container-custom relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-start">

          {/* ── LEFT COLUMN: all write-up ── */}
          <div className="space-y-6 animate-slide-in-left">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full text-sm font-medium">
              <Star size={14} />
              Wealth Summit Series
            </div>

            {/* Title */}
            <h2 className="text-4xl md:text-5xl font-bold leading-tight">
              Wealth Summit
              <span className="block text-estate-gold">2026</span>
            </h2>

            {/* Description */}
            <p className="text-xl text-gray-200 leading-relaxed">
              Join Nigeria's most impactful wealth creation and real estate investment summit.
              Transform your financial future with proven strategies from industry experts.
            </p>

            {/* Event Details grid */}
            <div className="grid sm:grid-cols-2 gap-4 py-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-sm">July 7, 14, 21, 28, 2026</p>
                  <p className="text-xs text-gray-300">All Tuesdays in July</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-sm">10:00 AM</p>
                  <p className="text-xs text-gray-300">Full Day Event</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-sm leading-snug">
                    Bridgefort Homes Office, Suite 8, Gacoun Plaza, Opp K-Close, 23 Road, Festac Town, Lagos
                  </p>
                  <p className="text-xs text-gray-300">Summit Venue</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Only 50 Participants</p>
                  <p className="text-xs text-gray-300">Limited Seats</p>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-3 pt-2">
              <Button
                onClick={() => setIsDialogOpen(true)}
                className="bg-estate-red hover:bg-estate-darkBlue text-white px-6 py-3 font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                View Details
                <ChevronRight className="ml-2 w-4 h-4" />
              </Button>

              <Button
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-estate-blue px-6 py-3 font-semibold rounded-lg transition-all duration-300"
                onClick={() => window.open('tel:+2348030624059', '_self')}
              >
                Call to Register
              </Button>

              <Button
                className="bg-estate-gold hover:bg-yellow-600 text-estate-darkBlue font-semibold py-3 px-6 rounded-lg transition duration-300"
                onClick={openRegistration}
              >
                Register Now
              </Button>
            </div>

            {/* What You'll Experience */}
            <div className="pt-4">
              <h3 className="text-xl font-bold mb-4">What You'll Experience</h3>
              <div className="space-y-3">
                {eventHighlights.map((highlight, index) => {
                  const IconComponent = highlight.icon;
                  return (
                    <div
                      key={index}
                      className="flex items-start gap-4 p-4 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-all duration-300 animate-fade-in"
                      style={{ animationDelay: `${index * 0.15}s` }}
                    >
                      <div className="w-10 h-10 bg-estate-red rounded-lg flex items-center justify-center flex-shrink-0">
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-0.5">{highlight.title}</h4>
                        <p className="text-sm text-gray-200">{highlight.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Mentorship badge */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-5 border border-white/20">
              <p className="text-center font-semibold mb-1">Pre-Registration is Compulsory!</p>
              <p className="text-center text-xl font-bold text-estate-gold mb-1">
                ONLY 5 OUTSTANDING PARTICIPANTS WILL QUALIFY FOR DIRECT MENTORSHIP
              </p>
              <p className="text-center text-sm text-gray-300">Price: Free</p>
            </div>
          </div>

          {/* ── RIGHT COLUMN: flyer image only ── */}
          <div className="animate-slide-in-right flex items-center justify-center lg:sticky lg:top-28">
            <div className="rounded-xl overflow-hidden shadow-2xl border border-white/20 w-full max-w-[420px] sm:max-w-[460px] lg:max-w-[520px] bg-black/20">
              <img
                src="/lovable-uploads/wealth-summit-2026-flyer.jpg"
                alt="The Wealth Summit Series 2026 — Think and Grow Rich, a 4-week executive wealth mastery program hosted by Dr. Dalvin Silva"
                className="w-full h-auto max-h-[70vh] object-contain"
                loading="lazy"
                decoding="async"
                sizes="(max-width: 768px) 90vw, (max-width: 1024px) 60vw, 520px"
              />
            </div>
          </div>

        </div>
      </div>
    </section>

    <SummitDetailsDialog
      isOpen={isDialogOpen}
      onClose={() => setIsDialogOpen(false)}
      onRegisterClick={openRegistration}
    />

    <TrainingRegistrationForm
      open={isRegistrationOpen}
      onClose={closeRegistration}
      eventTitle="this Summit"
      eventDate="Every Tuesday in July, 2026"
    />
  </>;
};

export default WealthSummit;
