
import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
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
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <AboutHero />
      <VisionMission />
      <CoreValues />
      <WhyRealEstate />
      <OurEstates />
      <TeamPhoto />
      <ManagementTeam />
      <BoardOfDirectors />
      <CallToAction />
      <Footer />
    </div>
  );
};

export default About;
