
import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { MapPin, Phone, Mail, Clock, Send, MessageSquare } from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    interested: 'residential'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here we would typically handle form submission
    console.log('Form submitted:', formData);
    alert('Thank you for your message. Our team will contact you shortly!');
    // Reset form
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
      interested: 'residential'
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative">
        <div className="h-[40vh] bg-cover bg-center" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1423666639041-f56000c27a9a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1500&q=80)' }}>
          <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center">
            <div className="container-custom text-white">
              <h1 className="text-3xl md:text-5xl font-bold mb-4">Contact Us</h1>
              <p className="text-xl max-w-2xl">Get in touch with our team of experts for personalized assistance with your real estate needs.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Information */}
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-lg shadow-md h-full">
                <h2 className="text-2xl font-bold mb-6">Get In Touch</h2>
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="bg-estate-blue bg-opacity-10 p-3 rounded-full mr-4">
                      <MapPin size={24} className="text-estate-blue" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-1">Our Location</h3>
                      <p className="text-gray-600">123 Victoria Island, Lagos, Nigeria</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-estate-blue bg-opacity-10 p-3 rounded-full mr-4">
                      <Phone size={24} className="text-estate-blue" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-1">Phone</h3>
                      <p className="text-gray-600">
                        <a href="tel:+2348012345678" className="hover:text-estate-blue transition duration-200">+234 801 234 5678</a>
                      </p>
                      <p className="text-gray-600">
                        <a href="tel:+2349087654321" className="hover:text-estate-blue transition duration-200">+234 908 765 4321</a>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-estate-blue bg-opacity-10 p-3 rounded-full mr-4">
                      <Mail size={24} className="text-estate-blue" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-1">Email</h3>
                      <p className="text-gray-600">
                        <a href="mailto:info@bridgefort.com" className="hover:text-estate-blue transition duration-200">info@bridgefort.com</a>
                      </p>
                      <p className="text-gray-600">
                        <a href="mailto:sales@bridgefort.com" className="hover:text-estate-blue transition duration-200">sales@bridgefort.com</a>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-estate-blue bg-opacity-10 p-3 rounded-full mr-4">
                      <Clock size={24} className="text-estate-blue" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-1">Business Hours</h3>
                      <p className="text-gray-600">Monday to Friday: 8AM - 6PM</p>
                      <p className="text-gray-600">Saturday: 9AM - 2PM</p>
                      <p className="text-gray-600">Sunday: Closed</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-3">Connect With Us</h3>
                  <div className="flex space-x-4">
                    <a href="#" className="bg-estate-blue text-white p-2 rounded-full hover:bg-estate-darkBlue transition duration-300">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                      </svg>
                    </a>
                    <a href="#" className="bg-estate-blue text-white p-2 rounded-full hover:bg-estate-darkBlue transition duration-300">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                      </svg>
                    </a>
                    <a href="#" className="bg-estate-blue text-white p-2 rounded-full hover:bg-estate-darkBlue transition duration-300">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                      </svg>
                    </a>
                    <a href="#" className="bg-estate-blue text-white p-2 rounded-full hover:bg-estate-darkBlue transition duration-300">
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
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-6">Send Us a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="input-field w-full"
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="input-field w-full"
                        placeholder="Your email address"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="input-field w-full"
                        placeholder="Your phone number"
                      />
                    </div>
                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="input-field w-full"
                        placeholder="Message subject"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="interested" className="block text-sm font-medium text-gray-700 mb-1">I'm Interested In</label>
                    <select
                      id="interested"
                      name="interested"
                      value={formData.interested}
                      onChange={handleChange}
                      className="input-field w-full"
                    >
                      <option value="residential">Residential Properties</option>
                      <option value="commercial">Commercial Properties</option>
                      <option value="land">Land</option>
                      <option value="investment">Investment Packages</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={5}
                      className="input-field w-full"
                      placeholder="Your message"
                    ></textarea>
                  </div>

                  <div className="pt-2">
                    <button type="submit" className="btn-cta flex items-center justify-center w-full md:w-auto">
                      <Send size={18} className="mr-2" />
                      Send Message
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-8">
        <div className="container-custom">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6">Our Location</h2>
            <div className="rounded-lg overflow-hidden h-[400px]">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126831.80627414225!2d3.3488895568878364!3d6.548055891872627!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103b8b2ae68280c1%3A0xdc9e87a367c3d9cb!2sVictoria%20Island%2C%20Lagos!5e0!3m2!1sen!2sng!4v1650532950932!5m2!1sen!2sng" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen 
                loading="lazy"
                title="PWAN Bridgefort Office Location"
              ></iframe>
            </div>
          </div>
        </div>
      </section>

      {/* WhatsApp Float Button */}
      <a 
        href="https://wa.me/2348012345678" 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 bg-green-500 text-white p-3 rounded-full shadow-lg hover:bg-green-600 transition duration-300 z-50"
      >
        <MessageSquare size={24} />
      </a>

      <Footer />
    </div>
  );
};

export default Contact;
