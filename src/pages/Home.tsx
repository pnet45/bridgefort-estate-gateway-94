
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
import GoogleDataTransparency from '../components/home/GoogleDataTransparency';

const Home = () => {
  // Wrap all property-dependent sections with the provider for shared data (for search, FeaturedProperties, etc)
  return (
    <div className="flex flex-col min-h-screen bg-aurora-mesh">
      <Navbar />

      {/* Hero Section - begins immediately below the fixed navbar (navbar is h-[88px] lg:h-[104px]) */}
      <div className="pt-[88px] lg:pt-[104px]">
        <HomeHeroImage />
      </div>

      {/* Property Provider wraps both search and featured! */}
      <PropertyProvider>
        <div className="container-custom -mt-8 relative z-10">
          <div className="glass-strong rounded-2xl p-4 md:p-6">
            <PropertySearch />
          </div>
        </div>

        {/* Featured Announcements Carousel */}
        <FeaturedAnnouncementsCarousel />
        {/* Featured Properties uses context data */}
        <FeaturedProperties />
        
        {/* Luxury Homes & Apartments Marketing Section */}
        <section className="section-padding relative overflow-hidden">
          <div className="container-custom text-center">
            <div className="glass-strong rounded-3xl p-8 md:p-14 max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 font-display bg-clip-text text-transparent bg-gradient-to-r from-estate-purple via-estate-red to-estate-gold">
                Luxury Homes & Apartments
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-4">
                At Bridgefort Homes Development Ltd, we don't just sell land — we also deliver premium residential properties.
                From modern apartments to fully detached luxury homes, our developments span prime locations
                across Lagos, Asaba, and Ogun State.
              </p>
              <p className="text-muted-foreground/80 max-w-2xl mx-auto mb-8">
                Whether you're looking for a family home, a rental investment, or a turnkey property,
                we offer flexible payment plans and end-to-end support from purchase to possession.
              </p>
              <a href="/homes-sales" className="btn-cta">
                Explore Our Homes →
              </a>
            </div>
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
      
      {/* Google OAuth Transparency — required for Google OAuth verification */}
      <GoogleDataTransparency />

      {/* CTA */}
      <CTASection />
      
      <Footer />
      <WhatsAppChat />
    </div>
  );
};

export default Home;
