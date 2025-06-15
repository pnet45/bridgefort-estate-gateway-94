import { useState } from 'react';
import Navbar from '../components/Navbar';
import WhatsAppChat from '../components/WhatsAppChat';
import Footer from '../components/Footer';
import ContactForm from '../components/ContactForm';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
const Contact = () => {
  return <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative animate-fade-in">
        <div className="h-[40vh] bg-cover bg-center hover:scale-105 transition-transform duration-500" style={{
        backgroundImage: 'url(https://images.unsplash.com/photo-1423666639041-f56000c27a9a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1500&q=80)'
      }}>
          <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center">
            <div className="container-custom text-white">
              <h1 className="text-3xl md:text-5xl font-bold mb-4 animate-scale-in">Contact Us</h1>
              <p className="text-xl max-w-2xl animate-fade-in">Get in touch with our team of experts for personalized assistance with your real estate needs.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="section-padding animate-fade-in">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Information */}
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-lg shadow-md h-full hover:shadow-lg transition-all duration-300 hover:scale-105">
                <h2 className="text-2xl font-bold mb-6 animate-fade-in text-left">Get In Touch</h2>
                <div className="space-y-6 text-left">
                  <div className="flex items-start animate-fade-in">
                    <div className="bg-estate-blue bg-opacity-10 p-3 rounded-full mr-4 hover:scale-110 transition-transform duration-300">
                      <MapPin size={24} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-1">Our Location</h3>
                      <p className="text-gray-600">Plot 117 Wosilat Okoya Seriki Street, Eleganza Gardens Estate, VGC bus stop, Lekki-Ajah, Lagos</p>
                    </div>
                  </div>

                  <div className="flex items-start animate-fade-in">
                    <div className="bg-estate-blue bg-opacity-10 p-3 rounded-full mr-4 hover:scale-110 transition-transform duration-300">
                      <Phone size={24} className="text-white " />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-1">Phone</h3>
                      <p className="text-gray-600">
                        <a href="tel:+2348030624059" className="hover:text-estate-blue transition duration-200 hover:scale-105">+234 803 062 4059</a>
                      </p>
                      <p className="text-gray-600">
                        <a href="tel:+2348070710688" className="hover:text-estate-blue transition duration-200 hover:scale-105">+234 807 071 0688</a>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start animate-fade-in">
                    <div className="bg-estate-blue bg-opacity-10 p-3 rounded-full mr-4 hover:scale-110 transition-transform duration-300">
                      <Mail size={24} className="text-white " />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-1">Email</h3>
                      <p className="text-gray-600">
                        <a href="mailto:info@pwanbridgefort.ng" className="hover:text-estate-blue transition duration-200">info@pwanbridgefort.ng</a>
                      </p>
                      <p className="text-gray-600">
                        <a href="mailto:sales@pwanbridgefort.ng" className="hover:text-estate-blue transition duration-200">sales@pwanbridgefort.ng</a>
                      </p>
                      <p className="text-gray-600">
                        <a href="mailto:admin@pwanbridgefort.ng" className="hover:text-estate-blue transition duration-200">admin@pwanbridgefort.ng</a>
                      </p>
                      <p className="text-gray-600">
                        <a href="mailto:account@pwanbridgefort.ng" className="hover:text-estate-blue transition duration-200">account@pwanbridgefort.ng</a>
                      </p>
                      <p className="text-gray-600">
                        <a href="mailto:training@pwanbridgefort.ng" className="hover:text-estate-blue transition duration-200">training@pwanbridgefort.ng</a>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start animate-fade-in">
                    <div className="bg-estate-blue bg-opacity-10 p-3 rounded-full mr-4 hover:scale-110 transition-transform duration-300">
                      <Clock size={24} className="text-white " />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-1">Business Hours</h3>
                      <p className="text-gray-600">Monday to Friday: 8AM - 6PM</p>
                      <p className="text-gray-600">Saturday: 9AM - 2PM</p>
                      <p className="text-gray-600">Sunday: Closed</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 animate-fade-in text-left">
                  <h3 className="text-lg font-semibold mb-3">Connect With Us</h3>
                  <div className="flex space-x-4">
                    <a href="https://facebook.com" className="bg-blue-500 p-2 rounded-full hover:bg-estate-darkBlue transition duration-300 hover:scale-110">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                      </svg>
                    </a>
                    <a href="https://instagram.com/pwanbridgefort" className="bg-indigo-300 text-white p-2 rounded-full hover:bg-estate-darkBlue transition duration-300 hover:scale-110">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                      </svg>
                    </a>
                    <a href="https://x.com/pwanbridgefort" className="bg-emerald-500 text-white p-2 rounded-full hover:bg-estate-darkBlue transition duration-300 hover:scale-110">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                      </svg>
                    </a>
                    <a href="https://linkedln.com/pwanbridgefort" className="bg-blue-800 text-white p-2 rounded-full hover:bg-estate-darkBlue transition duration-300 hover:scale-110">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                        <rect x="2" y="9" width="4" height="12"></rect>
                        <circle cx="4" cy="4" r="2"></circle>
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 animate-fade-in">
                <h2 className="text-2xl font-bold mb-6">Send Us a Message</h2>
                <ContactForm />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-8 animate-fade-in">
        <div className="container-custom">
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
            <h2 className="text-2xl font-bold mb-6">Locate us</h2>
            <div className="rounded-lg overflow-hidden h-[400px]">
              <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3964.494921657449!2d3.5562652739743537!3d6.458803023913895!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103bf76b19d8d963%3A0x66a842f364d577c8!2sPWAN%20BRIDGEFORT!5e0!3m2!1sen!2sng!4v1745856567136!5m2!1sen!2sng" width="100%" height="100%" style={{
              border: 0
            }} allowFullScreen={true} loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="PWAN Bridgefort location"></iframe>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <WhatsAppChat />

    </div>;
};
export default Contact;