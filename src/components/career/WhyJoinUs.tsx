
import React from 'react';
import { TrendingUp, Users, Award, Heart, BarChart, Briefcase } from 'lucide-react';

const WhyJoinUs = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Why Join PWAN Bridgefort</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We're more than just a real estate company. At PWAN Bridgefort, we're building communities 
            and creating opportunities for people to thrive both professionally and personally.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="bg-estate-blue bg-opacity-10 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
              <TrendingUp className="text-estate-blue" size={24} />
            </div>
            <h3 className="text-xl font-semibold mb-2">Growth Opportunities</h3>
            <p className="text-gray-600">
              We're committed to your professional development with clear pathways for advancement, training programs, and mentorship from industry experts.
            </p>
          </div>
          
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="bg-estate-blue bg-opacity-10 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
              <Users className="text-estate-blue" size={24} />
            </div>
            <h3 className="text-xl font-semibold mb-2">Collaborative Environment</h3>
            <p className="text-gray-600">
              Our diverse team works together in a supportive atmosphere where all voices are heard and valued. We believe in team success over individual achievement.
            </p>
          </div>
          
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="bg-estate-blue bg-opacity-10 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
              <Award className="text-estate-blue" size={24} />
            </div>
            <h3 className="text-xl font-semibold mb-2">Recognition & Rewards</h3>
            <p className="text-gray-600">
              We celebrate excellence with competitive compensation, performance bonuses, and recognition programs that honor your contributions.
            </p>
          </div>
          
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="bg-estate-blue bg-opacity-10 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
              <Heart className="text-estate-blue" size={24} />
            </div>
            <h3 className="text-xl font-semibold mb-2">Work-Life Balance</h3>
            <p className="text-gray-600">
              We understand the importance of balance. Our flexible work arrangements support your personal commitments while achieving professional goals.
            </p>
          </div>
          
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="bg-estate-blue bg-opacity-10 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
              <Briefcase className="text-estate-blue" size={24} />
            </div>
            <h3 className="text-xl font-semibold mb-2">Meaningful Work</h3>
            <p className="text-gray-600">
              Make a real difference by helping people find their dream homes and invest in their futures through real estate.
            </p>
          </div>
          
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="bg-estate-blue bg-opacity-10 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
              <BarChart className="text-estate-blue" size={24} />
            </div>
            <h3 className="text-xl font-semibold mb-2">Innovation Driven</h3>
            <p className="text-gray-600">
              We embrace technology and creative solutions to stay ahead in the market. Your fresh ideas are welcomed and encouraged.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyJoinUs;
