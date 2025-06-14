
import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { HomeIcon, Building, Wallet, ArrowRight, Construction, LandPlot, GraduationCap, BarChart, HeartHandshake, Scale } from 'lucide-react';

const services = [
  {
    icon: <HomeIcon size={28} />,
    title: 'Luxury Homes',
    description: 'Premium residential properties in sought-after locations with exceptional amenities and potential for appreciation.',
    link: '/services',
  },
  {
    icon: <Building size={28} />,
    title: 'Commercial Plots',
    description: 'Strategic commercial properties and land in high-growth areas ideal for development or long-term investment.',
    link: '/services',
  },
  {
    icon: <Wallet size={28} />,
    title: 'Buy2Sell Program',
    description: 'Our guaranteed investment program where we resell your property within 12 months with up to 30% profit.',
    link: '/buy2sell',
    isCallToAction: true
  },
  {
    icon: <HeartHandshake size={28} />,
    title: 'Real Estate Management',
    description: 'Expert property management with proactive supervision, trusted expertise, and our TEAMWORK philosophy for your investment success.',
    link: '/services',
  },
  {
    icon: <Scale size={28} />,
    title: 'Property Development',
    description: 'End-to-end development services including strategic land acquisition, legal support, master-planned estates, and construction services.',
    link: '/services',
  },
  {
    icon: <LandPlot size={28} />,
    title: 'Land Surveys',
    description: 'Comprehensive land surveying services including boundary mapping, topographic surveys, and title verification.',
    link: '/services',
  },
  {
    icon: <Construction size={28} />,
    title: 'Construction & Development',
    description: 'Expert building services from architectural design to full property development with quality craftsmanship.',
    link: '/services',
  },
  {
    icon: <BarChart size={28} />,
    title: 'Consultancy',
    description: 'Expert real estate advisory services tailored to help you make informed investment decisions and maximize returns.',
    link: '/services',
  },
  {
    icon: <GraduationCap size={28} />,
    title: 'Training & Education',
    description: 'Gain valuable insights into real estate investment strategies through our comprehensive educational programs and seminars.',
    link: '/training',
  },
];

const InvestmentServices = () => {
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleScroll = () => {
      cardsRef.current.forEach((el, idx) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight - 100) {
          el.classList.add('animate-slide-in-up'); // custom animation
          el.classList.remove('opacity-0');
        }
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className="section-padding">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Our Services</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">We offer a range of services designed to maximize your real estate acquisition returns.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {services.map((service, idx) => (
            <div
              key={service.title}
              className="opacity-0 bg-estate-blue p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300 text-center transform"
              ref={el => cardsRef.current[idx] = el}
              style={{ animationDuration: '0.7s', transitionDelay: `${idx * 50}ms` }}
            >
              <div className="bg-white bg-opacity-15 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                {
                  React.cloneElement(
                    service.icon as React.ReactElement,
                    { className: "text-white", color: "white" }
                  )
                }
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">{service.title}</h3>
              <p className="text-blue-100 mb-4">{service.description}</p>
              <Link
                to={service.link}
                className={`text-white font-medium hover:text-gray-200 flex items-center justify-center transition-colors
                  ${service.isCallToAction ? 'mt-2 font-bold' : ''}`
                }
              >
                {service.isCallToAction ? (
                  <>
                    Explore More <ArrowRight size={16} className="ml-1" color="white" />
                  </>
                ) : 'Learn More'}
              </Link>
            </div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Link to="/services" className="btn-cta">
            View All Services
          </Link>
        </div>
      </div>
      {/* Add custom animation keyframes */}
      <style>{`
        @keyframes slide-in-up {
          0% {
            transform: translateY(40px) scale(0.97);
            opacity: 0;
          }
          90% {
            opacity: 1;
            transform: translateY(-5px) scale(1.03);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-slide-in-up {
          animation: slide-in-up 0.7s cubic-bezier(0.23, 1, 0.32, 1) forwards;
        }
      `}</style>
    </section>
  );
};

export default InvestmentServices;
