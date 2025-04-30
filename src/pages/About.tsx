
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';
import { CheckCircle, Users, Target, TrendingUp, Linkedin, Mail, Phone } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const About = () => {
  const teamMembers = [
    {
      name: 'Dalvin Silva, PhD',
      role: 'MD/CEO',
      bio: 'As the Managing Director and Chief Executive Officer, Silva brings visionary leadership and over 15 years of real estate expertise to the company. He oversees strategic planning, growth initiatives, and ensures the delivery of top-tier services to clients.',
      imageUrl: './lovable-uploads/faf1fc01-6f49-4c4a-a9dc-9fd2a8bdbcff.png',
      social: {
        linkedin: 'https://linkedin.com/Dalvinsilva',
        email: 'dalvin.silva@pwanbridgefort.ng',
        phone: '+234 803 062 4059'
      }
    },
    {
      name: 'Precious Silva',
      role: 'Chief Operation Officer',
      bio: 'Network marketing guru with expertise in real estate portfolio management and optimization. Mrs Precious ensures smooth daily operations across all departments. With a strong background in operations and project management, she streamlines processes and supports organizational efficiency and innovation.',
      imageUrl: './lovable-uploads/13bdaa8e-3bbb-4a80-85ad-ee6c75f45ad8.png',
      social: {
        linkedin: 'https://linkedin.com',
        email: 'precious.silva@pwanbridgefort.ng',
        phone: '+234 807 244 0090'
      }
    },
    {
      name: 'Gideon Vincent',
      role: 'Head of Staff',
      bio: 'Mr Vincent leads the finance and HR departments, managing budgets, financial reporting, and team coordination. His attention to detail and integrity ensures strong fiscal management and a productive workplace.',
      imageUrl: './lovable-uploads/4a37c8e6-1846-4913-a6df-2072d3849096.png',
      social: {
        linkedin: 'https://linkedin.com',
        email: 'gideon.vincent@pwanbridgefort.ng',
        phone: '+234 803 768 8503'
      }
    },
    {
      name: 'Olatunji Paul',
      role: 'Admin Officer',
      bio: 'Mr Paul is the backbone of office administration, handling documentation, internal communications, and record-keeping. His organizational skills keep everything running seamlessly behind the scenes. Dedicated to ensuring an exceptional experience for all PWAN Bridgefort clients and investors.',
      imageUrl: './lovable-uploads/58357be6-4f42-4a6a-b2e9-7861bd64c55b.png',
      social: {
        linkedin: 'https://linkedin.com',
        email: 'olatunji.paul@pwanbridgefort.ng',
        phone: '+234 808 590 9085'
      }
    },
    {
      name: 'Emmanuel Etokakpan',
      role: 'Inspection/IT Officer',
      bio: "Mr Emmanuel manages property inspections and maintains the company's IT infrastructure. With a unique blend of technical know-how and on-ground insight, he ensures accurate property evaluations and system reliability. Visionary leader driving PWAN Bridgefort's mission to create wealth through strategic real estate investments.",
      imageUrl: './lovable-uploads/e350d4bd-cc36-4212-926b-d4363eddd623.png',
      social: {
        linkedin: 'https://linkedin.com',
        email: 'emmanuel.etokakpan@pwanbridgefort.ng',
        phone: '+234 706 731 8720'
      }
    },
    {
      name: 'Nehimaiah Onyekibe',
      role: 'Business Development Manager (South-East)',
      bio: "Mr Nehemiah drives business growth through partnerships and strategic market development. Her focus on client acquisition and relationship building contributes significantly to the company's expansion goals. Specializes in identifying high-potential properties and negotiating favorable terms for investors.",
      imageUrl: './lovable-uploads/ec42e076-d3b6-44ec-a586-11d4f85544f2.png',
      social: {
        linkedin: 'https://linkedin.com',
        email: 'nehemiah.onyekibe@pwanbridgefort.ng',
        phone: '+234 803 210 7763'
      }
    },
    {
      name: 'Happiness Anele',
      role: 'Business Development Executive/Customer Service Rivers State - South-South',
      bio: 'Based in the South South region, Mrs Happiness is dedicated to customer satisfaction and regional business development. She ensures clients receive personalized attention and timely property solutions. Dedicated to ensuring an exceptional experience for all PWAN Bridgefort clients and investors.',
      imageUrl: './lovable-uploads/4b85e4c0-efa3-44b1-a38f-e20364c2ed66.png',
      social: {
        linkedin: 'https://linkedin.com',
        email: 'happiness.anele@pwanbridgefort.ng',
        phone: '+234 818 060 0833'
      }
    },
    {
      name: 'Doris Onyeagwu',
      role: 'Business Development Executive (South-West)',
      bio: 'Mrs Doris leads customer service and sales efforts in the South West region. Known for her proactive communication and market insights, she connects clients with the right properties and opportunities.',
      imageUrl: './lovable-uploads/b007cb53-e801-4e66-857b-e91ed13aa93e.png',
      social: {
        linkedin: 'https://linkedin.com',
        email: 'doris.onyeagwu@pwanbridgefort.ng',
        phone: '+234 903 529 2185'
      }
    },
    {
      name: 'Joy Brown',
      role: 'Facility/Office Assistant',
      bio: "Mrs Joy supports the day-to-day functionality of the office and property facilities. Her hands-on approach and reliability keep the environment organized, clean, and ready for business.",
      imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
      social: {
        linkedin: 'https://linkedin.com',
        email: 'joy.brown@pwanbridgefort.ng',
        phone: '+234 903 529 2185'
      }
    },
  ];

  const achievements = [
    { number: '250+', text: 'Properties Sold' },
    { number: '₦500m+', text: 'in Property Value' },
    { number: '150+', text: 'Happy Clients' },
    { number: '2+', text: 'Years of Experience' }
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

      {/* Our Team - Enhanced Section */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Meet Our Management Team</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Get to know the experts behind PWAN Bridgefort's success in delivering premium real estate investment opportunities.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
                <div className="relative group">
                  <img 
                    src={member.imageUrl} 
                    alt={member.name} 
                    className="w-full h-64 object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-estate-blue bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-300"></div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-1 text-gray-900">{member.name}</h3>
                  <p className="text-estate-blue font-medium mb-3">{member.role}</p>
                  <p className="text-gray-600 mb-4">{member.bio}</p>
                  
                  <div className="flex space-x-3 mt-4">
                    <a href={member.social.linkedin} className="text-gray-400 hover:text-estate-blue transition-colors" aria-label={`${member.name}'s LinkedIn`}>
                      <Linkedin size={18} />
                    </a>
                    <a href={`mailto:${member.social.email}`} className="text-gray-400 hover:text-estate-blue transition-colors" aria-label={`Email ${member.name}`}>
                      <Mail size={18} />
                    </a>
                    <a href={`tel:${member.social.phone}`} className="text-gray-400 hover:text-estate-blue transition-colors" aria-label={`Call ${member.name}`}>
                      <Phone size={18} />
                    </a>
                  </div>
                </div>
              </div>
            ))}
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
                  Founded in 2024, PWAN Bridgefort Estate and Investment Ltd began with a vision to transform the Nigerian real estate landscape by providing secure, high-yield investment opportunities.
                </p>
                <p className="text-gray-600 mb-4">
                  At PWAN Bridgefort, we are more than just a real estate company; we are a collective driven by purpose, where building people is as crucial as building properties. The unwavering loyalty and profound commitment of our team form the very bedrock of our success and the essence of who we are. We firmly believe that a company's strength lies not just in its assets, but in the dedication of its people. At PWAN Bridgefort, our team stands together with unwavering loyalty and propels us forward with steadfast commitment, making us not just a company, but a powerful movement in the real estate industry.
                  For us, loyalty transcends mere words; it is a deep-seated alignment with our core values, our overarching mission, and our shared aspirations. It is the conscious choice to be present and engaged because of a genuine belief in what we stand for. Commitment, on the other hand, is demonstrated through tangible results. It is the willingness to go above and beyond, driven by an intrinsic pride in our collective identity and goals. Together, loyalty and commitment are the powerful engines that drive the PWAN Bridgefort dream.
                  Our culture is intentionally crafted to foster a sense of family, where every individual's contribution is valued, and growth is nurtured on both professional and personal levels. We invest in our people, empowering them with knowledge, celebrating their achievements, and providing unwavering support through challenges. We understand that loyalty is earned through mutual respect and investment.
                  This dedication to our team directly translates into tangible benefits:

                    1. Business Growth: Loyal and committed staff are inherently more productive, delivering exceptional service that fosters repeat business, valuable referrals, and a strong, reputable presence in the real estate market.
                    2. Internal Stability: Reduced turnover, a natural outcome of a loyal workforce, ensures the preservation of invaluable institutional knowledge and significant savings in hiring and training costs.
                    3. Brand Ambassadorship: Our loyal team members become passionate advocates for the PWAN Bridgefort brand, attracting new talent and building lasting trust with clients and stakeholders.
                    4. Resilience During Change: In a dynamic industry, the commitment of our employees enables us to adapt, innovate, and thrive, providing a stable foundation during economic shifts.

                  Your loyalty and commitment are not just valued; they are vital to the realization of our shared vision. A loyal team member is a guardian of our dream, and a committed team member consistently surpasses expectations. This powerful combination creates a PWAN Bridgefort team that is relentless, unstoppable, and united in its pursuit of excellence. This is how we deliver exceptional service to our clients, lead with distinction in the industry, and build a lasting legacy.
                  At PWAN Bridgefort, loyalty is not a dated concept; it is a revolutionary force. Commitment is not an option; it is the very air we breathe. We hold ourselves and each other to the highest standards, setting ambitious goals driven by a pursuit of greatness, not control. This commitment extends to the leadership, starting with our MD/CEO.
                  Joining the PWAN Bridgefort family is more than just securing a job; it is an opportunity to build a future-a future brimming with growth and the potential for generational wealth. We are a community of believers, united by our faith in each other and in our shared vision. Together, we are poised to make a significant impact on the real estate world through value, integrity, and unwavering commitment.
                  While we acknowledge that PWAN Bridgefort is a journey of continuous improvement, our intentions are clear, and our focus is unwavering. As long as loyalty and commitment remain the cornerstones of our culture, there are no limits to what we can achieve.
                  To every member of the PWAN Bridgefort family, we extend our deepest gratitude for your unwavering support, your belief in our vision, and your dedication to building this future with us. The future of real estate is PWAN Bridgefort. The future is now. We are REBUILDING THE FUTURE.
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
                    <span className="text-gray-600">2023 - Founded in Lagos, Nigeria</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-estate-blue mr-2">•</span>
                    <span className="text-gray-600">2023 - Completed our first major development: Bridgefort Gardens</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-estate-blue mr-2">•</span>
                    <span className="text-gray-600">2024 - Expanded operations to Abuja, Delta State, Imo State and Port Harcourt</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-estate-blue mr-2">•</span>
                    <span className="text-gray-600">2025 - Launched our investment advisory services</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-estate-blue mr-2">•</span>
                    <span className="text-gray-600">2025 - Received the "Real Estate Investment Company of the Year" award</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-estate-blue mr-2">•</span>
                    <span className="text-gray-600">2025 - Surpassed ₦150 million in property value</span>
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
