
import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Toaster } from "@/components/ui/toaster";
import BlogHeader from '../components/blog/BlogHeader';
import BlogPosts from '../components/blog/BlogPosts';
import BlogCategories from '../components/blog/BlogCategories';
import BlogNewsletter from '../components/blog/BlogNewsletter';
import MondayMotivation from '../components/blog/MondayMotivation';
import RealEstateContent from '../components/blog/RealEstateContent';
import YouTubeSection from '../components/blog/YouTubeSection';

const Blog = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <BlogHeader />
      
      <section className="py-12 bg-gray-50">
        <div className="container-custom">
          <BlogCategories />
        </div>
      </section>
      
      <MondayMotivation />
      
      <section className="py-16">
        <div className="container-custom">
          <BlogPosts />
        </div>
      </section>
      
      <RealEstateContent />
      
      <YouTubeSection />
      
      <BlogNewsletter />
      
      <Footer />
      <Toaster />
    </div>
  );
};

export default Blog;
