
import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import TrainingHero from '../components/training/TrainingHero';
import TrainingCategories from '../components/training/TrainingCategories';
import TrainingContent from '../components/training/TrainingContent';
import UpcomingEvents from '../components/training/UpcomingEvents';
import TrainingCTA from '../components/training/TrainingCTA';
import FeaturedTraining from '../components/training/FeaturedTraining';
import { Toaster } from "@/components/ui/toaster";
import FeaturedEventsCarousel from '../components/training/FeaturedEventsCarousel';

const Training = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <TrainingHero />

      {/* Featured Training Events Carousel */}
      <FeaturedEventsCarousel />

      {/* Featured Training */}
      <FeaturedTraining />

      {/* Training Categories */}
      <TrainingCategories />
      
      {/* Training Content */}
      <TrainingContent />
      
      {/* Upcoming Events */}
      <UpcomingEvents />
      
      {/* CTA Section */}
      <TrainingCTA />
      
      <Footer />
      <Toaster />
    </div>
  );
};

export default Training;
