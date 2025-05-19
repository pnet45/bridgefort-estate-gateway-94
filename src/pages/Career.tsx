
import React from 'react';
import { Link } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CareerHero from '../components/career/CareerHero';
import CareerForm from '../components/career/CareerForm';
import OpenPositions from '../components/career/OpenPositions';
import WhyJoinUs from '../components/career/WhyJoinUs';
import TeamCulture from '../components/career/TeamCulture';

const Career = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <CareerHero />
      
      <WhyJoinUs />
      
      <TeamCulture />
      
      <OpenPositions />
      
      <div className="bg-gray-50 py-16">
        <div className="container-custom">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4">Apply to Join Our Team</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Take the first step towards an exciting career with PWAN Bridgefort. Submit your application and we'll be in touch.
            </p>
          </div>
          
          <CareerForm />
        </div>
      </div>
      
      <Footer />
      <Toaster />
    </div>
  );
};

export default Career;
