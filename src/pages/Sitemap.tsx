
import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const sitemapData = [
  {
    title: 'Main Navigation',
    links: [
      { name: 'Home', path: '/' },
      { name: 'About Us', path: '/about' },
      { name: 'Properties', path: '/properties' },
      { name: 'Services', path: '/services' },
      { name: 'Buy2Sell Program', path: '/buy2sell' },
      { name: 'Land Banking & Trading', path: '/services#landbanking' },
      { name: 'Training & Seminars', path: '/training' },
      { name: 'Career', path: '/career' },
      { name: 'Contact Us', path: '/contact' },
    ]
  },
  {
    title: 'Property Categories',
    links: [
      { name: 'Residential Estates', path: '/properties#residential' },
      { name: 'Commercial Plots', path: '/properties#commercial' },
      { name: 'Luxury Villas', path: '/properties#luxury' },
      { name: 'Buy2Sell Investment', path: '/buy2sell' },
    ]
  },
  {
    title: 'Customer & Investor Services',
    links: [
      { name: 'E-commerce Cart', path: '/cart' },
      { name: 'Dashboard', path: '/dashboard' },
      { name: 'Order Tracking', path: '/dashboard#orders' },
      { name: 'Training Registration', path: '/training#register' },
      { name: 'FAQs', path: '/services#faq' },
      { name: 'Newsletter Signup', path: '/blog#newsletter' },
    ]
  },
  {
    title: 'Investment Tools',
    links: [
      { name: 'ROI Calculator', path: '/services#roi-calculator' },
      { name: 'Investment Packages', path: '/services#investments' },
      { name: 'LandBanking Insights', path: '/services#landbanking' },
      { name: 'Blog Insights', path: '/blog' },
      { name: 'YouTube Series', path: '/blog#youtube' },
      { name: 'Monday Motivation', path: '/blog#mondaymotivation' },
    ]
  },
  {
    title: 'Account & Support',
    links: [
      { name: 'Login / Register', path: '/auth' },
      { name: 'Reset Password', path: '/reset-password' },
      { name: 'Account Settings', path: '/dashboard#account' },
      { name: 'Saved Properties', path: '/dashboard#saved' },
      { name: 'Book Inspection', path: '/dashboard#book' },
    ]
  },
  {
    title: 'Legal & Compliance',
    links: [
      { name: 'Privacy Policy', path: '/privacy-policy' },
      { name: 'Terms of Service', path: '/terms-of-service' },
      { name: 'AML & KYC Policy', path: '/privacy-policy#amlkyc' },
      { name: 'Risk Disclosure', path: '/privacy-policy#risk' }
    ]
  },
  {
    title: 'Company',
    links: [
      { name: 'Management Team', path: '/about#team' },
      { name: 'Our Partners', path: '/about#partners' },
      { name: 'Board of Directors', path: '/about#board' },
      { name: 'Contact Support', path: '/contact#support' },
    ]
  },
];

const Sitemap = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow pt-24 pb-16">
        <div className="container-custom">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h1 className="text-3xl font-bold mb-10 text-center text-estate-blue">Sitemap & Navigation</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
              {sitemapData.map((section, index) => (
                <div key={index} className="mb-6">
                  <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200">{section.title}</h2>
                  <ul className="space-y-2">
                    {section.links.map((link, linkIndex) => (
                      <li key={linkIndex}>
                        <Link to={link.path} className="text-gray-700 hover:text-estate-blue transition duration-200">
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="mt-10 text-xs text-center text-gray-400">
              <p>PWAN Bridgefort Estate & Investment Ltd is a fully corporate e-commerce platform providing digital real estate, land banking, investment and education, fully compliant with Nigerian regulations and best global practice.</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Sitemap;
