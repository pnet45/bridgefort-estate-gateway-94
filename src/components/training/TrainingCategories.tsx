
import React from 'react';
import { GraduationCap, Users, HandshakeIcon, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const categories = [
  {
    id: 'masterclass',
    title: 'Masterclass',
    icon: GraduationCap,
    description: 'Advanced real estate investment strategies and market insights',
    color: 'bg-estate-blue'
  },
  {
    id: 'sales',
    title: 'Sales Training',
    icon: Users,
    description: 'Customer acquisition and property presentation techniques',
    color: 'bg-estate-red'
  },
  {
    id: 'closing',
    title: 'Closing Deals',
    icon: HandshakeIcon,
    description: 'Negotiation tactics and transaction completion strategies',
    color: 'bg-green-600'
  },
  {
    id: 'retention',
    title: 'Customer Retention',
    icon: Heart,
    description: 'Building lasting relationships and generating referrals',
    color: 'bg-purple-600'
  }
];

const TrainingCategories = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container-custom">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-4">Training Categories</h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Our comprehensive training program covers all aspects of real estate sales and investment. 
            Select a category below to explore our content.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <div key={category.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300">
              <div className={`${category.color} p-4 flex justify-center`}>
                <category.icon size={40} className="text-white" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{category.title}</h3>
                <p className="text-gray-600 mb-4">{category.description}</p>
                <Link 
                  to={`/training#${category.id}`}
                  className="text-estate-blue hover:text-estate-darkBlue font-medium flex items-center"
                >
                  View Content
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrainingCategories;
