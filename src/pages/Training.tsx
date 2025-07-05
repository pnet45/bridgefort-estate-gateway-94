
import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import WhatsAppChat from '../components/WhatsAppChat';
import TrainingHero from '../components/training/TrainingHero';
import TrainingCategories from '../components/training/TrainingCategories';
import TrainingContent from '../components/training/TrainingContent';
import UpcomingEvents from '../components/training/UpcomingEvents';
import TrainingCTA from '../components/training/TrainingCTA';
import FeaturedTraining from '../components/training/FeaturedTraining';
import CenterTrainingSection from '../components/training/CenterTrainingSection';
import { Toaster } from "@/components/ui/toaster";
import FeaturedEventsCarousel from '../components/training/FeaturedEventsCarousel';
import SuccessSummit from '../components/training/SuccessSummit';
import UpcomingTrainingEvents from '../components/training/UpcomingTrainingEvents';

const Training = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <TrainingHero />

      {/* Success Summit Section */}
      <SuccessSummit />

      {/* Featured Training Events Carousel */}
      <FeaturedEventsCarousel />

      {/* Featured Training */}
      <FeaturedTraining />

      {/* Center Training Section */}
      <CenterTrainingSection />

      {/* Upcoming Training Events */}
      <UpcomingTrainingEvents />

      {/* Training Categories */}
      <TrainingCategories />
      
      {/* Training Content */}
      <TrainingContent />
      
      {/* Upcoming Events */}
      <UpcomingEvents />
      
      {/* CTA Section */}
      <TrainingCTA />
      
      <Footer />
      <WhatsAppChat />
      <Toaster />
    </div>
  );
};

export default Training;
