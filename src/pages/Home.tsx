import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PropertySearch from '../components/PropertySearch';
import PropertyCard from '../components/PropertyCard';
import TestimonialCard from '../components/TestimonialCard';
import MissionStatement from '../components/MissionStatement';
import { Link } from 'react-router-dom';
import { ArrowRight, Home as HomeIcon, Building, Wallet, Clock, Shield, Award } from 'lucide-react';

// Sample data
const featuredProperties = [
  {
    id: '1',
    title: 'Hampton Vile Estate',
    location: 'Itoikin, Epe, Lagos',
    price: '₦3,250,000',
    imageUrl: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    sqft: 500,
    propertyType: 'Villa',
    scheme: 1
  },
  {
    id: '2',
    title: 'Fortress Hills Estate',
    location: 'Imota, Ikorodu, Lagos',
    price: '₦4,000,000',
    imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    sqft: 500,
    propertyType: 'Apartment',
    scheme: 2
  },
  {
    id: '3',
    title: 'Greenfield County',
    location: 'Agbara, Ogun State',
    price: '₦1,500,000',
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    sqft: 500,
    propertyType: 'Commercial',
    scheme: 3
  }
];

const testimonials = [
  {
    name: 'Adebayo Johnson',
    role: 'Property Investor',
    testimonial: 'Working with PWAN Bridgefort has been an excellent experience. They helped me find the perfect investment property with great ROI potential.',
    rating: 5,
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'
  },
  {
    name: 'Chioma Okafor',
    role: 'First-time Property buyer',
    testimonial: 'The team at Bridgefort made my first home buying experience smooth and stress-free. They were professional and responsive throughout the process.',
    rating: 5,
    imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'
  },
  {
    name: 'Mohammed Ibrahim',
    role: 'PWAN Business Owner',
    testimonial: 'I purchased a commercial property through PWAN Bridgefort and the return on investment has been incredible. Their market knowledge is outstanding.',
    rating: 4,
    imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'
  }
];

const partnerLogos = [
  {
    name: 'Adept Lessor Ltd',
    imageUrl: '/lovable-uploads/Adept-lessor.png'
  },
  {
    name: 'Eleganza Groups',
    imageUrl: '/lovable-uploads/eleganza Group.png'
  },
  {
    name: 'Folkland PDC',
    imageUrl: '/lovable-uploads/folk land Properties Ltd.png'
  },
  {
    name: 'PWAN Group',
    imageUrl: '/lovable-uploads/pwanlogo.png'
  },
  {
    name: 'Zenith Bank',
    imageUrl: '/lovable-uploads/zenithbank.png'
  }
];

const Home = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative">
        <div className="h-[70vh] bg-cover bg-center" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1275&q=80)' }}>
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center">
            <div className="container-custom text-white">
              <h1 className="text-3xl md:text-5xl font-bold mb-4 max-w-3xl leading-tight animate-fade-in">
                Your Gateway to Premium Real Estate Investments
              </h1>
              <p className="text-xl md:text-2xl mb-8 max-w-2xl animate-fade-in" style={{ animationDelay: '200ms' }}>
                Discover exceptional properties and secure high-yield investment opportunities with PWAN Bridgefort.
              </p>
              <div className="flex flex-wrap gap-4 animate-fade-in" style={{ animationDelay: '400ms' }}>
                <Link to="/properties" className="btn-cta text-lg px-8 py-3">
                  Explore Properties
                </Link>
                <Link to="/services" className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-estate-blue font-medium text-lg px-8 py-3 rounded transition duration-300">
                  Investment Services
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        {/* Property Search */}
        <div className="container-custom">
          <PropertySearch />
        </div>
      </section>
      
      {/* Add Mission Statement Component */}
      <MissionStatement />
      
      {/* Existing Sections */}
      <section className="section-padding bg-gray-50">
        {/* Featured Properties */}
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Featured Properties</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Explore our selection of premium properties, handpicked for their exceptional value and investment potential.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProperties.map(property => (
              <PropertyCard key={property.id} {...property} />
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link to="/properties" className="inline-flex items-center text-estate-blue font-medium hover:text-estate-darkBlue transition duration-200">
              View all properties 
              <ArrowRight size={18} className="ml-2" />
            </Link>
          </div>
        </div>
      </section>
      
      {/* Services */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Investment Services</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">We offer a range of services designed to maximize your real estate investment returns.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300 text-center">
              <div className="bg-estate-blue bg-opacity-10 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <HomeIcon size={28} className="text-estate-blue" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Luxury Homes</h3>
              <p className="text-gray-600 mb-4">Premium residential properties in sought-after locations with exceptional amenities and potential for appreciation.</p>
              <Link to="/services" className="text-estate-blue font-medium hover:text-estate-darkBlue">Learn More</Link>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300 text-center">
              <div className="bg-estate-blue bg-opacity-10 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Building size={28} className="text-estate-blue" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Commercial Plots</h3>
              <p className="text-gray-600 mb-4">Strategic commercial properties and land in high-growth areas ideal for development or long-term investment.</p>
              <Link to="/services" className="text-estate-blue font-medium hover:text-estate-darkBlue">Learn More</Link>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300 text-center">
              <div className="bg-estate-blue bg-opacity-10 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Wallet size={28} className="text-estate-blue" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Rental Income Plans</h3>
              <p className="text-gray-600 mb-4">Turnkey rental properties with property management solutions for steady passive income streams.</p>
              <Link to="/services" className="text-estate-blue font-medium hover:text-estate-darkBlue">Learn More</Link>
            </div>
          </div>
          
          <div className="text-center mt-10">
            <Link to="/services" className="btn-cta">
              View All Investment Services
            </Link>
          </div>
        </div>
      </section>
      
      {/* Why Choose Us */}
      <section className="section-padding bg-estate-blue text-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose PWAN Bridgefort</h2>
            <p className="max-w-2xl mx-auto opacity-90">We are committed to providing exceptional service and investment opportunities.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-white bg-opacity-10 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Award size={28} className="text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Expertise</h3>
              <p className="opacity-90">With our years of experience and knowledge in the Nigerian real estate market.</p>
            </div>
            
            <div className="text-center">
              <div className="bg-white bg-opacity-10 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Shield size={28} className="text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Security</h3>
              <p className="opacity-90">All properties have verified titles, Surveys and necessary documentation.</p>
            </div>
            
            <div className="text-center">
              <div className="bg-white bg-opacity-10 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Wallet size={28} className="text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">High Returns</h3>
              <p className="opacity-90">Our properties consistently deliver above-market returns for investors.</p>
            </div>
            
            <div className="text-center">
              <div className="bg-white bg-opacity-10 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Clock size={28} className="text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Support</h3>
              <p className="opacity-90">Dedicated customer service and after-sales support for all clients.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Testimonials */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Client Testimonials</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Hear what our satisfied clients have to say about their experience with PWAN Bridgefort.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard key={index} {...testimonial} />
            ))}
          </div>
        </div>
      </section>
      
      {/* Partners */}
      <section className="py-12 bg-white">
        <div className="container-custom">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold">Our Trusted Partners</h2>
          </div>
          
          <div className="flex flex-wrap justify-center items-center gap-8 max-w-4xl mx-auto">
            {partnerLogos.map((partner, index) => (
              <div key={index} className="w-40 h-24 relative">
                <img
                  src={partner.imageUrl} 
                  alt={partner.name}
                  className="w-full h-full object-contain transition duration-300 filter grayscale hover:grayscale-0" 
                />
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA */}
      <section className="py-16 bg-gray-900 text-white text-center">
        <div className="container-custom">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Real Estate Investment Journey?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">Contact our team of experts today for a free consultation and property portfolio review.</p>
          <Link to="/contact" className="btn-cta text-lg px-8 py-3">Get Free Consultation</Link>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Home;
