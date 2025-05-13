
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import PropertyCard from '../PropertyCard';

// Sample data for featured properties
const featuredProperties = [
  {
    id: '3',
    title: 'Precious Garden Estate',
    location: 'Ode-Omi Via Ibeju-Lekki, Lagos',
    price: '₦1,500,000',
    imageUrl: '/lovable-uploads/5c033a2a-1e10-49b7-b7de-5b56e384b9d5.png',
    sqm: 500,
    propertyType: 'Land',
    phase: 1
  },
  {
    id: '1',
    title: 'Hampton Ville Estate',
    location: 'Itoikin, Epe, Lagos',
    price: '₦3,500,000',
    imageUrl: '/lovable-uploads/5f92d89a-e9fc-4c84-a49d-72cb376b8510.png',
    sqm: 500,
    propertyType: 'Land',
    phase: 1
  },
  {
    id: '2',
    title: 'Fortress Hills Estate',
    location: 'Imota, Ikorodu, Lagos',
    price: '₦4,000,000',
    imageUrl: '/lovable-uploads/b6b178d0-ae26-4527-9569-dce064d705b9.png',
    sqm: 500,
    propertyType: 'Land',
    phase: 1
  }
];

const FeaturedProperties = () => {
  return (
    <section className="section-padding bg-gray-50">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Featured Properties</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explore our selection of premium properties, handpicked for their exceptional value and investment potential.
          </p>
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
  );
};

export default FeaturedProperties;
