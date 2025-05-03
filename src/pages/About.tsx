import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';
import { CheckCircle, Users, Target, TrendingUp, Linkedin, Mail, Phone } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
const About = () => {
  const coreValues = [{
    letter: 'P',
    value: 'Purpose-Driven',
    description: 'At the heart of PWAN Bridgefort is a deeper sense of purpose. We do not merely sell land; we ignite dreams, deliver dignity, and drive socioeconomic change through ownership and empowerment.'
  }, {
    letter: 'W',
    value: 'Wealth Creation',
    description: 'Our business is a platform for generational wealth. Whether you\'re a client, investor, or realtor, PWAN Bridgefort is your gateway to building sustainable wealth through property and partnerships.'
  }, {
    letter: 'A',
    value: 'Accountability',
    description: 'We take full responsibility for our commitments. Every promise we make is backed by measurable action, transparency, and consistency. We own our outcomes—good or great.'
  }, {
    letter: 'N',
    value: 'Nurturing People',
    description: 'People are our greatest asset. We invest in growth, cultivate potential, and build a culture where everyone—from staff to PBOs to clients—feels valued, heard, and empowered.'
  }, {
    letter: 'B',
    value: 'Bold Innovation',
    description: 'We don\'t follow trends—we set them. With boldness, we challenge the status quo, embrace fresh thinking, and deploy creative strategies that move the real estate industry forward.'
  }, {
    letter: 'R',
    value: 'Reliability',
    description: 'Trust is earned over time, and we guard it fiercely. PWAN Bridgefort is a name you can count on—dependable, consistent, and committed to doing right by all stakeholders.'
  }, {
    letter: 'I',
    value: 'Integrity',
    description: 'Integrity is the heartbeat of our operations. We do what is right, even when it\'s not convenient. Our word is bond, and we uphold truth in all our dealings.'
  }, {
    letter: 'D',
    value: 'Discipline',
    description: 'We run a tight ship. Discipline drives our processes, execution, and decision-making. It ensures we deliver results that meet and surpass expectations.'
  }, {
    letter: 'G',
    value: 'Growth Mindset',
    description: 'We see challenges as opportunities. Our hunger to grow—personally and professionally—is relentless. We encourage continuous learning and never settle for the bare minimum.'
  }, {
    letter: 'E',
    value: 'Empathy',
    description: 'Real estate is about people first. We listen, we understand, and we serve with compassion. Our solutions are designed with real human needs at the core.'
  }, {
    letter: 'F',
    value: 'Flexibility',
    description: 'We understand that one size doesn\'t fit all. Our systems, payment plans, and engagement models are designed to adapt—to the client, to the times, and to changing markets.'
  }, {
    letter: 'O',
    value: 'Ownership',
    description: 'We promote the power of ownership—not just of land, but of responsibilities, roles, and results. Our team and clients alike are empowered to take ownership and lead.'
  }, {
    letter: 'R',
    value: 'Results-Oriented',
    description: 'Success for us is not in the promises but in the delivery. We measure our impact not just in profits, but in the lives we transform and the legacies we help build.'
  }, {
    letter: 'T',
    value: 'Team Spirit',
    description: 'We are one body, many talents. Collaboration is our culture. We win together, fail together, and rise together. Unity is our greatest strength.'
  }];
  const managementTeam = [{
    name: 'Dalvin Silva, PhD',
    role: 'MD/CEO',
    bio: 'As the Managing Director and Chief Executive Officer, Silva brings visionary leadership and over 15 years of real estate expertise to the company. He oversees strategic planning, growth initiatives, and ensures the delivery of top-tier services to clients.',
    imageUrl: './lovable-uploads/faf1fc01-6f49-4c4a-a9dc-9fd2a8bdbcff.png',
    social: {
      linkedin: 'https://linkedin.com/Dalvinsilva',
      email: 'dalvin.silva@pwanbridgefort.ng',
      phone: '+234 803 062 4059'
    }
  }, {
    name: 'Precious Silva',
    role: 'Chief Operation Officer',
    bio: 'Network marketing guru with expertise in real estate portfolio management and optimization. Mrs Precious ensures smooth daily operations across all departments. With a strong background in operations and project management, she streamlines processes and supports organizational efficiency and innovation.',
    imageUrl: './lovable-uploads/13bdaa8e-3bbb-4a80-85ad-ee6c75f45ad8.png',
    social: {
      linkedin: 'https://linkedin.com',
      email: 'precious.silva@pwanbridgefort.ng',
      phone: '+234 807 244 0090'
    }
  }, {
    name: 'Gideon Vincent',
    role: 'Head of Staff',
    bio: 'Mr Vincent leads the finance and HR departments, managing budgets, financial reporting, and team coordination. His attention to detail and integrity ensures strong fiscal management and a productive workplace.',
    imageUrl: './lovable-uploads/4a37c8e6-1846-4913-a6df-2072d3849096.png',
    social: {
      linkedin: 'https://linkedin.com',
      email: 'gideon.vincent@pwanbridgefort.ng',
      phone: '+234 803 768 8503'
    }
  }];
  const boardOfDirectors = [{
    name: 'Dr. Austin Onwumere',
    role: 'Founding Chairman, PWAN Group',
    imageUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'
  }, {
    name: 'Dr. Jayne Onwumere',
    role: 'Global President, PWAN Group',
    imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'
  }, {
    name: 'Dr. Michael Okonkwo',
    role: 'Executive Chairman, PWAN Group',
    imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'
  }, {
    name: 'Dr. Michael Akhuetie',
    role: 'Chairman, PWAN Bridgefort',
    imageUrl: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'
  }, {
    name: 'Dr. Dalvin Silva, PhD',
    role: 'Managing Director, PWAN Bridgefort',
    imageUrl: './lovable-uploads/faf1fc01-6f49-4c4a-a9dc-9fd2a8bdbcff.png'
  }, {
    name: 'Precious Silva',
    role: 'Executive Director, PWAN Bridgefort',
    imageUrl: './lovable-uploads/13bdaa8e-3bbb-4a80-85ad-ee6c75f45ad8.png'
  }];
  const achievements = [{
    number: '250+',
    text: 'Properties Sold'
  }, {
    number: '₦500m+',
    text: 'in Property Value'
  }, {
    number: '150+',
    text: 'Happy Clients'
  }, {
    number: '2+',
    text: 'Years of Experience'
  }];
  return <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative">
        <div className="h-[40vh] bg-cover bg-center" style={{
        backgroundImage: 'url(https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-4.0.3&auto=format&fit=crop&w=1500&q=80)'
      }}>
          <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center">
            <div className="container-custom text-white">
              <h1 className="text-3xl md:text-5xl font-bold mb-4">About PWAN Bridgefort</h1>
              <p className="text-xl max-w-2xl">Learn about our mission, vision, and the team behind Nigeria's leading real estate investment company.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Vision and Mission */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h2 className="text-2xl font-bold mb-4 text-estate-blue">CLEAR VISION</h2>
              <p className="text-lg italic font-medium mb-4">
                "To be a pioneering force in African real estate—bridging people to prosperity, one property at a time."
              </p>
              <p className="text-gray-700">
                Each project we execute, each territory we explore, and each partnership we nurture is driven by a crystal-clear vision to democratize property ownership, foster financial empowerment, and build communities that last for generations.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h2 className="text-2xl font-bold mb-4 text-estate-blue">GUIDING MISSION</h2>
              <p className="text-lg italic font-medium mb-4">
                "To simplify home ownership, strengthen people, and serve with purpose—while redefining what is possible in real estate across Africa and the world at large."
              </p>
              <p className="text-gray-700">
                Our mission is to create accessible real estate opportunities, equip and empower our network of realtors, and offer clients real solutions that go beyond land—to legacy, lifestyle, and long-term security.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4">OUR CORE VALUES</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Each letter in PWAN BRIDGEFORT symbolizes the pillars upon which our company stands—principles that guide our actions, influence our culture, and define how we deliver value across the real estate ecosystem.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {coreValues.map((value, index) => <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-center mb-4">
                  <span className="text-2xl font-bold text-estate-blue mr-2">{value.letter}</span>
                  <h3 className="text-xl font-semibold">– {value.value}</h3>
                </div>
                <p className="text-gray-700">{value.description}</p>
              </div>)}
          </div>
        </div>
      </section>
      
      {/* Why Real Estate */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold mb-6 text-estate-blue">Unlock the Future with PWAN Bridgefort Estates & Investment Ltd</h2>
              <p className="text-gray-700 mb-6">
                Did you know that over 90% of the world's millionaires have built wealth through real estate? In Nigeria, real estate is not just a wealth creation tool; it's a hedge against inflation, a symbol of generational wealth, and a cornerstone of economic growth. With Nigeria's urban population set to double by 2050, the demand for quality housing and strategically located properties has never been higher.
              </p>
              <p className="text-gray-700 mb-6">
                At PWAN Bridgefort Estates & Investment Ltd, we're not just selling properties—we're building legacies. We provide secure, affordable, and strategically located real estate solutions designed to help you achieve financial freedom and secure your future.
              </p>
              
              <h3 className="text-2xl font-bold mb-4">Why Real Estate, Why Now?</h3>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <span className="text-estate-blue mr-2 font-bold">•</span>
                  <span className="text-gray-700"><strong>Unprecedented Growth:</strong> Real estate in Nigeria has consistently outperformed most investment classes, yielding high returns even during economic downturns.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-estate-blue mr-2 font-bold">•</span>
                  <span className="text-gray-700"><strong>Safety and Stability:</strong> Unlike volatile markets, land and property are tangible assets that appreciate over time.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-estate-blue mr-2 font-bold">•</span>
                  <span className="text-gray-700"><strong>Demand Surge:</strong> Urbanization and population growth mean real estate will remain a hotcake in both the short and long term.</span>
                </li>
              </ul>
            </div>
            
            <div>
              <img src="public/lovable-uploads/84195595-cefb-44c6-90c9-1d17b754d992.png" alt="Real Estate Investment" className="w-full h-auto rounded-lg shadow-lg mb-8 hover:scale-[1.02] transition-transform duration-300" />
              
              <h3 className="text-2xl font-bold mb-4">Why Choose PWAN Bridgefort?</h3>
              <p className="text-gray-700 mb-6">
                At PWAN Bridgefort, we stand out because of our unwavering commitment to excellence, transparency, and customer satisfaction. With estates strategically located in high-demand areas, we ensure our clients get maximum returns on investment (ROI) while enjoying the peace of mind that comes with secure land ownership.
              </p>
              
              <h3 className="text-2xl font-bold mb-4">Our Unique Offerings:</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-xl font-semibold mb-2">1. Strategic Locations:</h4>
                  <p className="text-gray-700">
                    We have estates in prime areas that promise high appreciation value, excellent connectivity, and proximity to essential amenities like schools, hospitals, and business districts.
                  </p>
                </div>
                <div>
                  <h4 className="text-xl font-semibold mb-2">2. Flexible Payment Plans:</h4>
                  <p className="text-gray-700">
                    We understand that affordability is key. That's why we offer payment plans tailored to suit your budget, making it easier for you to own your dream property.
                  </p>
                </div>
                <div>
                  <h4 className="text-xl font-semibold mb-2">3. Verified and Secure Titles:</h4>
                  <p className="text-gray-700">
                    Every property we sell is thoroughly vetted, ensuring you receive genuine documentation and total peace of mind.
                  </p>
                </div>
                <div>
                  <h4 className="text-xl font-semibold mb-2">4. Customer-Centric Approach:</h4>
                  <p className="text-gray-700">
                    We're not just selling land; we're partnering with you to secure your future. From initial inquiries to after-sales support, we're with you every step of the way.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Estates */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4">Our Estates: A World of Opportunity</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Whether you're looking for a place to call home or an investment opportunity, our estates offer something for everyone:
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center">
              <img src="public/lovable-uploads/dfe26401-712e-4dfd-b08f-69abac4fec61.png" alt="Residential Estate" className="w-full h-52 object-cover object-center rounded-md mb-4" />
              <h3 className="text-xl font-bold mb-2">Residential Estates</h3>
              <p className="text-gray-700">
                Located in serene, family-friendly environments designed for modern living.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center">
              <img src="public/lovable-uploads/42de3711-6788-43ea-9ce8-d618293b14e5.png" alt="Commercial Estate" className="w-full h-52 object-cover object-center rounded-md mb-4" />
              <h3 className="text-xl font-bold mb-2">Commercial Estates</h3>
              <p className="text-gray-700">
                Prime plots perfect for businesses, warehouses, or rental properties.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center">
              <img src="public/lovable-uploads/ec42e076-d3b6-44ec-a586-11d4f85544f2.png" alt="Land Banking" className="w-full h-52 object-cover object-center rounded-md mb-4" />
              <h3 className="text-xl font-bold mb-2">Land Banking Options</h3>
              <p className="text-gray-700">
                For savvy investors looking to capitalize on land appreciation over time.
              </p>
            </div>
          </div>
          
          <div className="text-center mt-10">
            <h3 className="text-2xl font-bold mb-4">Join the PWAN Bridgefort Family Today</h3>
            <p className="text-gray-700 mb-6 max-w-3xl mx-auto">
              At PWAN Bridgefort, we're more than a real estate company; we're a bridge to your dreams. Let's help you turn your aspirations into reality, one property at a time.
            </p>
            <p className="text-lg font-medium text-estate-blue mb-6">Invest now, because tomorrow begins today.</p>
            
            <Link to="/contact" className="btn-cta py-3 px-8 text-lg">
              Contact Us Today
            </Link>
          </div>
        </div>
      </section>

      {/* Team Photo */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4">Our Team</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              The PWAN Bridgefort team brings together expertise across real estate development, finance, marketing, and customer service.
            </p>
          </div>
          
          <div className="rounded-lg overflow-hidden shadow-xl">
            <img src="public/lovable-uploads/f79aaed2-c246-4c4d-8b88-8c601683c0d1.png" alt="PWAN Bridgefort Team" className="w-full h-auto" />
          </div>
        </div>
      </section>

      {/* Management Team */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4">MEET OUR MANAGEMENT TEAM</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Led by industry experts committed to excellence and innovation in real estate.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {managementTeam.map((member, index) => <div key={index} className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                <img src={member.imageUrl} alt={member.name} className="w-full h-80 object-cover object-top" />
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                  <p className="text-estate-blue font-medium mb-4">{member.role}</p>
                  <p className="text-gray-700 mb-4">{member.bio}</p>
                  
                  <div className="flex space-x-3 mt-4">
                    <a href={member.social.linkedin} className="text-gray-500 hover:text-estate-blue transition-colors">
                      <Linkedin size={18} />
                    </a>
                    <a href={`mailto:${member.social.email}`} className="text-gray-500 hover:text-estate-blue transition-colors">
                      <Mail size={18} />
                    </a>
                    <a href={`tel:${member.social.phone}`} className="text-gray-500 hover:text-estate-blue transition-colors">
                      <Phone size={18} />
                    </a>
                  </div>
                </div>
              </div>)}
          </div>
        </div>
      </section>

      {/* Board of Directors */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4">MEET OUR BOARD OF DIRECTORS</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Our distinguished board brings decades of industry expertise and strategic vision.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {boardOfDirectors.map((director, index) => <div key={index} className="bg-white p-6 rounded-lg shadow-md text-center">
                <Avatar className="mx-auto mb-4 h-32 w-32">
                  <AvatarImage src={director.imageUrl} alt={director.name} className="object-cover" />
                  <AvatarFallback>{director.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <h3 className="text-xl font-bold mb-2">{director.name}</h3>
                <p className="text-estate-blue">{director.role}</p>
              </div>)}
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
    </div>;
};
export default About;