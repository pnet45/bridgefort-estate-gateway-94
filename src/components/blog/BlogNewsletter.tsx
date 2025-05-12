
import React from 'react';
import { Button } from "@/components/ui/button";

const BlogNewsletter = () => {
  return (
    <section className="py-16 bg-estate-blue">
      <div className="container-custom">
        <div className="bg-white p-8 md:p-12 rounded-lg shadow-lg max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-estate-blue">
              Subscribe to Our Newsletter
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Stay updated with the latest news, property listings, investment tips, and training events from PWAN Bridgefort.
            </p>
          </div>
          
          <form className="flex flex-col md:flex-row gap-4">
            <input 
              type="email" 
              placeholder="Your email address" 
              className="flex-grow px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-estate-blue"
              required
            />
            <Button type="submit" className="bg-estate-red hover:bg-red-700 text-white font-medium py-3 px-6">
              Subscribe Now
            </Button>
          </form>
          
          <p className="text-xs text-gray-500 mt-4 text-center">
            By subscribing, you agree to receive emails from PWAN Bridgefort. You can unsubscribe at any time.
          </p>
        </div>
      </div>
    </section>
  );
};

export default BlogNewsletter;
