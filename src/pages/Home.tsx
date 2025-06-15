
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

const Home = () => {
  // Wrap all property-dependent sections with the provider for shared data (for search, FeaturedProperties, etc)
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Hero Section with Static Image */}
      <HomeHeroImage />

      {/* Property Provider wraps both search and featured! */}
      <PropertyProvider>
        <div className="container-custom">
          <PropertySearch />
        </div>
        {/* Featured Properties uses context data */}
        <FeaturedProperties />
      </PropertyProvider>
      
      {/* Mission Statement */}
      <MissionStatement />
      
      {/* Investment Services */}
      <InvestmentServices />
      
      {/* Monday Motivation Animated Hero */}
      <MondayMotivationHero />

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
