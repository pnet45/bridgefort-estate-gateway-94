
import React from 'react';
import TestimonialCard from '../TestimonialCard';

// Sample data for testimonials
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

const Testimonials = () => {
  return (
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
  );
};

export default Testimonials;
