
import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import WhatsAppChat from '../components/WhatsAppChat';
import { Toaster } from "@/components/ui/toaster";
import BlogHeader from '../components/blog/BlogHeader';
import BlogPosts from '../components/blog/BlogPosts';
import BlogCategories from '../components/blog/BlogCategories';
import BlogNewsletter from '../components/blog/BlogNewsletter';
import MondayMotivation from '../components/blog/MondayMotivation';
import RealEstateContent from '../components/blog/RealEstateContent';
import YouTubeSection from '../components/blog/YouTubeSection';
import PhoneContactBar from '../components/PhoneContactBar';
import FeaturedAnnouncements from '../components/blog/FeaturedAnnouncements';
import InvestmentSpotlight from '../components/blog/InvestmentSpotlight';
import SuccessStories from '../components/blog/SuccessStories';
import MarketUpdates from '../components/blog/MarketUpdates';
import IncentivePrograms from '../components/blog/IncentivePrograms';
import CMSSection from '../components/cms/CMSSection';

const Blog = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <PhoneContactBar />

      <BlogHeader />

      <section className="py-12 bg-gray-50">
        <div className="container-custom">
          <BlogCategories />
        </div>
      </section>

      <FeaturedAnnouncements />

      <MondayMotivation />

      <section className="py-16 bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">🌟 Monday Motivation</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Start your week with inspiration and insights from Nigeria's leading real estate experts
            </p>
          </div>
        </div>
      </section>

      <InvestmentSpotlight />

      <section className="py-16">
        <div className="container-custom">
          <BlogPosts />
        </div>
      </section>

      <CMSSection page="blog" title="From the Editorial Team" />

      <SuccessStories />

      <MarketUpdates />

      <RealEstateContent />

      <IncentivePrograms />

      <YouTubeSection />

      <BlogNewsletter />

      {/* Admin Login Link */}
      <div className="bg-muted py-4">
        <div className="container-custom text-center">
          <a 
            href="/dashboard" 
            className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            Admin Access
          </a>
        </div>
      </div>

      <Footer />
      <WhatsAppChat />
      <Toaster />
    </div>
  );
};

export default Blog;
