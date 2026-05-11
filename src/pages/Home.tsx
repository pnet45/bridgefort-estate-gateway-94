
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PropertySearch from '../components/PropertySearch';
import WhatsAppChat from '../components/WhatsAppChat';
import MissionStatement from '../components/MissionStatement';
import FeaturedProperties from '../components/home/FeaturedProperties';
import InvestmentServices from '../components/home/InvestmentServices';
import WhyChooseUs from '../components/home/WhyChooseUs';
import Testimonials from '../components/home/Testimonials';
import Partners from '../components/home/Partners';
import CTASection from '../components/home/CTASection';
import SeminarAndTraining from '../components/home/SeminarAndTraining';
import HomeHeroImage from '@/components/HomeHeroImage';
import YouTubeSection from '../components/home/YouTubeSection';
import { PropertyProvider } from '../contexts/property';
import MondayMotivationHero from '../components/home/MondayMotivationHero';
import FeaturedAnnouncementsCarousel from '../components/blog/FeaturedAnnouncementsCarousel';
import FeaturedCenterSeminar from '../components/home/FeaturedCenterSeminar';

const Home = () => {
  // Wrap all property-dependent sections with the provider for shared data (for search, FeaturedProperties, etc)
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Hero Section - below fixed navbar */}
      <div className="pt-16 lg:pt-20">
        <HomeHeroImage />
      </div>

      {/* Property Provider wraps both search and featured! */}
      <PropertyProvider>
        <div className="container-custom">
          <PropertySearch />
        </div>

        {/* Featured Announcements Carousel */}
        <FeaturedAnnouncementsCarousel />
        {/* Featured Properties uses context data */}
        <FeaturedProperties />
        
        {/* Luxury Homes & Apartments Marketing Section */}
        <section className="section-padding bg-gradient-to-br from-slate-900 to-slate-800 text-white">
          <div className="container-custom text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Luxury Homes & Apartments</h2>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto mb-4">
              At Bridgefort Homes Development Ltd, we don't just sell land — we also deliver premium residential properties. 
              From modern apartments to fully detached luxury homes, our developments span prime locations 
              across Lagos, Asaba, and Ogun State.
            </p>
            <p className="text-gray-400 max-w-2xl mx-auto mb-8">
              Whether you're looking for a family home, a rental investment, or a turnkey property, 
              we offer flexible payment plans and end-to-end support from purchase to possession.
            </p>
            <a href="/homes-sales" className="inline-flex items-center bg-white text-slate-900 font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors">
              Explore Our Homes →
            </a>
          </div>
        </section>
      </PropertyProvider>
      
      {/* Mission Statement */}
      <MissionStatement />
      
      {/* Investment Services */}
      <InvestmentServices />
      
      {/* Monday Motivation Animated Hero */}
      <MondayMotivationHero />

      {/* Featured Center Seminar */}
      <FeaturedCenterSeminar />

      {/* Seminar And Training (Upcoming Events) */}
      <SeminarAndTraining />
      
      {/* Why Choose Us */}
      <WhyChooseUs />
      
      {/* Testimonials */}
      <Testimonials />
      
      {/* YouTube Section */}
      <YouTubeSection />
      
      {/* Partners */}
      <Partners />
      
      {/* CTA */}
      <CTASection />
      
      <Footer />
      <WhatsAppChat />
    </div>
  );
};

export default Home;
