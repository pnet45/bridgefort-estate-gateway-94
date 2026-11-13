import React from 'react';
import TestimonialCard from '../TestimonialCard';
import { useContentItems } from '@/hooks/useContentItems';

const fallbackTestimonials = [
  {
    name: 'Solomon Innocent',
    role: 'Property Investor',
    testimonial: 'Working with Bridgefort Homes Development Ltd has been an excellent experience. They helped me find the perfect investment property with great ROI potential.',
    rating: 5,
    imageUrl: '/lovable-uploads/b752dea1-17e7-4589-a41f-cf145beb29aa.png'
  },
  {
    name: 'Chioma Okafor',
    role: 'First-time Property buyer',
    testimonial: 'The team at Bridgefort made my first home buying experience smooth and stress-free. They were professional and responsive throughout the process.',
    rating: 5,
    imageUrl: '/lovable-uploads/5efde743-d4f1-44b6-93bb-a430a25f3692.png'
  },
  {
    name: 'Jacob Oluwaseun',
    role: 'PWAN Business Owner',
    testimonial: 'I purchased a commercial property through Bridgefort Homes Development Ltd and the return on investment has been incredible. Their market knowledge is outstanding.',
    rating: 4,
    imageUrl: '/lovable-uploads/f27b5aee-88b8-457a-ba3a-45bff68f8d85.png'
  }
];

const Testimonials = () => {
  const { items } = useContentItems({ page: 'home', contentType: 'page_section' });
  const cmsTestimonials = items
    .filter(item => item.metadata?.section_key === 'testimonial')
    .map(item => ({
      name: String(item.metadata?.name || item.title),
      role: String(item.metadata?.role || item.category || 'Client'),
      testimonial: item.body || '',
      rating: Math.min(5, Math.max(1, Number(item.metadata?.rating) || 5)),
      imageUrl: item.image_url || undefined,
    }))
    .filter(item => item.testimonial.trim().length > 0);
  const testimonials = cmsTestimonials.length ? cmsTestimonials : fallbackTestimonials;

  return (
    <section className="section-padding relative">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 font-display">Client Testimonials</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">Hear what our satisfied clients have to say about their experience with Bridgefort Homes Development Ltd.</p>
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
