import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import WhatsAppChat from '../components/WhatsAppChat';
import AboutHero from '../components/about/AboutHero';
import VisionMission from '../components/about/VisionMission';
import CoreValues from '../components/about/CoreValues';
import WhyRealEstate from '../components/about/WhyRealEstate';
import OurEstates from '../components/about/OurEstates';
import TeamPhoto from '../components/about/TeamPhoto';
import ManagementTeam from '../components/about/ManagementTeam';
import BoardOfDirectors from '../components/about/BoardOfDirectors';
import CallToAction from '../components/about/CallToAction';
const About = () => {
  return <div className="flex flex-col min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navbar />
      <AboutHero />
      
      <div className="py-8 bg-estate-blue bg-opacity-5 rounded-3xl my-[21px]">
        <div className="container-custom">
          <div className="text-center text-zinc-50">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Bridgefort Homes Development Ltd: Redefining Property Investment with Integrity, Expertise, and Lasting Value</h2>
            <div className="w-20 h-1 bg-estate-red mx-auto mb-6"></div>
            <p className="text-lg text-white max-w-3xl mx-auto">
              Bridgefort Homes Development Ltd is one of Nigeria's leading real estate investment companies, 
              providing affordable land and housing solutions while helping individuals 
              build sustainable wealth through property ownership.
            </p>
          </div>
        </div>
      </div>
      
      <VisionMission />
      <CoreValues />
      <WhyRealEstate />
      <OurEstates />
      <TeamPhoto />
      <ManagementTeam />
      <BoardOfDirectors />
      <CallToAction />
      <Footer />
      <WhatsAppChat />
    </div>;
};
export default About;