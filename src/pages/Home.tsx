
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
import FeaturedAnnouncements from '../components/blog/FeaturedAnnouncements';

const Home = () => {
  // Wrap all property-dependent sections with the provider for shared data (for search, FeaturedProperties, etc)
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Hero Section with Static Image */}
      <HomeHeroImage />

      {/* Featured Announcements */}
      <FeaturedAnnouncements />

      {/* Property Provider wraps both search and featured! */}
      <PropertyProvider>
        <div className="container-custom">
          <PropertySearch />
        </div>
        {/* Featured Properties uses context data */}
        <FeaturedProperties />
        
        {/* Luxury Homes Section */}
        <section className="section-padding bg-white">
          <div className="container-custom text-center">
            <h2 className="text-3xl font-bold mb-4">Luxury Homes & Apartments</h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-8">
              Discover our premium residential properties in Lagos, Asaba, and Ogun State
            </p>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gray-50 p-6 rounded-lg">
                <img src="/src/assets/luxury-3bedroom-lagos.jpg" alt="3BR Lagos Apartment" className="w-full h-48 object-cover rounded-lg mb-4" />
                <h3 className="text-xl font-semibold mb-2">3BR Apartment - Victoria Island</h3>
                <p className="text-gray-600 mb-3">Premium waterfront living in Lagos</p>
                <p className="text-estate-blue font-bold">₦45M - ₦50M</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <img src="/src/assets/luxury-4bedroom-asaba.jpg" alt="4BR Asaba House" className="w-full h-48 object-cover rounded-lg mb-4" />
                <h3 className="text-xl font-semibold mb-2">4BR Detached - GRA Asaba</h3>
                <p className="text-gray-600 mb-3">Spacious family home in prime location</p>
                <p className="text-estate-blue font-bold">₦35M - ₦40M</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <img src="/src/assets/luxury-semi-detached-ogun.jpg" alt="Semi-Detached Ogun" className="w-full h-48 object-cover rounded-lg mb-4" />
                <h3 className="text-xl font-semibold mb-2">3BR Semi-Detached - Ogun</h3>
                <p className="text-gray-600 mb-3">Modern living in serene environment</p>
                <p className="text-estate-blue font-bold">₦25M - ₦30M</p>
              </div>
            </div>
            <a href="/homes-sales" className="inline-flex items-center bg-estate-blue text-white px-6 py-3 rounded-lg hover:bg-estate-darkBlue transition-colors">
              View All Luxury Homes →
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
