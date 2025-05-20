
import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Sitemap = () => {
  const sitemapData = [
    {
      title: 'Main Pages',
      links: [
        { name: 'Home', path: '/' },
        { name: 'About Us', path: '/about' },
        { name: 'Properties', path: '/properties' },
        { name: 'Services', path: '/services' },
        { name: 'Buy2Sell Program', path: '/buy2sell' },
        { name: 'Training', path: '/training' },
        { name: 'Career', path: '/career' },
        { name: 'Contact Us', path: '/contact' },
      ]
    },
    {
      title: 'Blog',
      links: [
        { name: 'Blog Home', path: '/blog' },
        { name: 'Categories', path: '/blog#categories' },
      ]
    },
    {
      title: 'Account',
      links: [
        { name: 'Login / Register', path: '/auth' },
        { name: 'Dashboard', path: '/dashboard' }
      ]
    },
    {
      title: 'Legal Information',
      links: [
        { name: 'Privacy Policy', path: '/privacy-policy' },
        { name: 'Terms of Service', path: '/terms-of-service' },
      ]
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-16">
        <div className="container-custom">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h1 className="text-3xl font-bold mb-10 text-center text-estate-blue">Sitemap</h1>
            
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
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Sitemap;
