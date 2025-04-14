
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';
import { CheckCircle, Users, Target, TrendingUp } from 'lucide-react';

const About = () => {
  const teamMembers = [
    {
      name: 'Dr. Grace Adebayo',
      role: 'Founder & CEO',
      bio: 'With over 20 years of experience in real estate investment and development across West Africa.',
      imageUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'
    },
    {
      name: 'Samuel Okafor',
      role: 'Chief Investment Officer',
      bio: 'Former investment banker with expertise in real estate portfolio management and optimization.',
      imageUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'
    },
    {
      name: 'Amina Mohammed',
      role: 'Head of Property Acquisitions',
      bio: 'Specializes in identifying high-potential properties and negotiating favorable terms for investors.',
      imageUrl: 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'
    },
    {
      name: 'Daniel Eze',
      role: 'Director of Client Relations',
      bio: 'Dedicated to ensuring an exceptional experience for all PWAN Bridgefort clients and investors.',
      imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'
    }
  ];

  const achievements = [
    { number: '500+', text: 'Properties Sold' },
    { number: '₦15B+', text: 'in Property Value' },
    { number: '1,200+', text: 'Happy Clients' },
    { number: '15+', text: 'Years of Experience' }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative">
        <div className="h-[40vh] bg-cover bg-center" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-4.0.3&auto=format&fit=crop&w=1500&q=80)' }}>
          <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center">
            <div className="container-custom text-white">
              <h1 className="text-3xl md:text-5xl font-bold mb-4">About PWAN Bridgefort</h1>
              <p className="text-xl max-w-2xl">Learn about our mission, vision, and the team behind Nigeria's leading real estate investment company.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Mission */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
              <p className="text-gray-700 mb-6 text-lg">
                "Empowering investors with secure, high-yield real estate opportunities."
              </p>
              <p className="text-gray-600 mb-6">
                At PWAN Bridgefort Estate and Investment Ltd, we are committed to identifying and developing premium real estate properties that not only provide exceptional living spaces but also serve as valuable investment assets for our clients.
              </p>
              <p className="text-gray-600 mb-6">
                We pride ourselves on transparency, integrity, and a deep understanding of the Nigerian real estate market. Our team of experts is dedicated to guiding you through every step of your real estate investment journey.
              </p>
              <div className="mt-8">
                <Link to="/contact" className="btn-cta">Get in Touch</Link>
              </div>
            </div>
            <div className="rounded-lg overflow-hidden shadow-lg">
              <img 
                src="https://images.unsplash.com/photo-1553524790-5872ab2c653f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                alt="PWAN Bridgefort Office" 
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Core Values</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">The principles that guide everything we do at PWAN Bridgefort.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="bg-estate-blue bg-opacity-10 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <CheckCircle size={28} className="text-estate-blue" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Integrity</h3>
              <p className="text-gray-600">We operate with complete transparency and adhere to the highest ethical standards in all our business dealings.</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="bg-estate-blue bg-opacity-10 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <TrendingUp size={28} className="text-estate-blue" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Excellence</h3>
              <p className="text-gray-600">We strive for excellence in every aspect of our business, from property selection to customer service.</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="bg-estate-blue bg-opacity-10 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <Users size={28} className="text-estate-blue" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Customer Focus</h3>
              <p className="text-gray-600">We prioritize our clients' needs and work tirelessly to exceed their expectations and investment goals.</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="bg-estate-blue bg-opacity-10 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <Target size={28} className="text-estate-blue" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Innovation</h3>
              <p className="text-gray-600">We constantly seek innovative solutions and investment opportunities in the real estate sector.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Our History */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our History & Achievements</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Since our founding, PWAN Bridgefort has grown to become a leader in Nigerian real estate investment.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="mb-8">
                <h3 className="text-2xl font-semibold mb-4">Our Journey</h3>
                <p className="text-gray-600 mb-4">
                  Founded in 2008, PWAN Bridgefort Estate and Investment Ltd began with a vision to transform the Nigerian real estate landscape by providing secure, high-yield investment opportunities.
                </p>
                <p className="text-gray-600 mb-4">
                  Over the years, we have successfully developed numerous residential and commercial properties across Nigeria's major cities, establishing ourselves as a trusted name in real estate investment.
                </p>
                <p className="text-gray-600">
                  Our growth has been driven by our unwavering commitment to quality, integrity, and customer satisfaction, values that continue to define our operations today.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-semibold mb-4">Key Milestones</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="text-estate-blue mr-2">•</span>
                    <span className="text-gray-600">2008 - Founded in Lagos, Nigeria</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-estate-blue mr-2">•</span>
                    <span className="text-gray-600">2012 - Completed our first major development: Bridgefort Gardens</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-estate-blue mr-2">•</span>
                    <span className="text-gray-600">2015 - Expanded operations to Abuja and Port Harcourt</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-estate-blue mr-2">•</span>
                    <span className="text-gray-600">2018 - Launched our investment advisory services</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-estate-blue mr-2">•</span>
                    <span className="text-gray-600">2020 - Received the "Real Estate Investment Company of the Year" award</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-estate-blue mr-2">•</span>
                    <span className="text-gray-600">2023 - Surpassed ₦15 billion in property value</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {achievements.map((item, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-md text-center">
                  <h3 className="text-3xl text-estate-blue font-bold mb-2">{item.number}</h3>
                  <p className="text-gray-600">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Our Team */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Leadership Team</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Meet the experts behind PWAN Bridgefort's success.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition duration-300">
                <img 
                  src={member.imageUrl} 
                  alt={member.name} 
                  className="w-full h-64 object-cover object-center"
                />
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                  <p className="text-estate-blue font-medium mb-3">{member.role}</p>
                  <p className="text-gray-600">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-estate-blue text-white text-center">
        <div className="container-custom">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Investment Journey?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">Partner with PWAN Bridgefort for secure, high-yield real estate investments.</p>
          <Link to="/contact" className="btn-cta bg-white text-estate-blue hover:bg-gray-100 text-lg px-8 py-3">Contact Us Today</Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
