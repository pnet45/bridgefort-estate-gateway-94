
import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const PrivacyPolicy = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-16">
        <div className="container-custom">
          <div className="bg-white rounded-lg shadow-md p-6 md:p-10">
            <h1 className="text-3xl md:text-4xl font-bold mb-6 text-estate-blue">Privacy Policy</h1>
            <p className="text-gray-600 mb-6">Effective Date: May 20, 2025</p>
            <p className="text-gray-600 mb-6">Company Name: PWAN Bridgefort Estate and Investment Ltd<br />
            Website: www.pwanbridgefort.ng</p>
            <hr className="my-6" />
            
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">1. Introduction</h2>
              <p className="mb-4">At PWAN Bridgefort, we value your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and protect your data when you visit our website, use our services, or contact us.</p>
              <p className="mb-4">By using our website and services, you agree to the terms outlined in this policy.</p>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">2. Information We Collect</h2>
              <p className="mb-4">We collect the following types of information:</p>
              
              <h3 className="text-xl font-semibold mb-2">a. Personal Information</h3>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Full Name</li>
                <li>Phone Number</li>
                <li>Email Address</li>
                <li>Home or Office Address (if provided)</li>
                <li>Investment preferences and financial goals</li>
                <li>Identification documents (for transactions requiring KYC verification)</li>
              </ul>
              
              <h3 className="text-xl font-semibold mb-2">b. Usage Information</h3>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>IP address</li>
                <li>Browser type</li>
                <li>Pages visited on our website</li>
                <li>Device information</li>
                <li>Date and time of your visit</li>
              </ul>
              
              <h3 className="text-xl font-semibold mb-2">c. Cookies and Tracking</h3>
              <p>We use cookies and similar technologies to enhance your browsing experience and analyze website traffic. You may disable cookies through your browser settings.</p>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">3. How We Use Your Information</h2>
              <p className="mb-2">We use the information we collect to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Provide and improve our real estate and investment services</li>
                <li>Process transactions and manage investments</li>
                <li>Communicate with you regarding your inquiries or ongoing services</li>
                <li>Send newsletters, marketing materials, or promotional offers (you may opt out at any time)</li>
                <li>Comply with legal obligations and prevent fraud</li>
                <li>Customize user experience on our website</li>
              </ul>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">4. Data Sharing and Disclosure</h2>
              <p className="mb-4">We do not sell your personal information. We may share data with:</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Our internal departments (sales, legal, admin)</li>
                <li>Partner companies within the PWAN Group (only as necessary)</li>
                <li>Third-party service providers for legal, technical, or marketing support</li>
                <li>Government agencies or law enforcement when required by law</li>
              </ul>
              <p>All third parties are required to respect the security and confidentiality of your data.</p>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">5. Data Security</h2>
              <p className="mb-4">We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, loss, or misuse. This includes:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Secure data storage</li>
                <li>Limited access to sensitive data</li>
                <li>Regular software updates and backups</li>
              </ul>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">6. Your Rights</h2>
              <p className="mb-4">You have the right to:</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Request access to the personal data we hold about you</li>
                <li>Correct or update your personal information</li>
                <li>Withdraw consent for marketing communications</li>
                <li>Request deletion of your data (subject to legal requirements)</li>
              </ul>
              <p>To exercise any of these rights, contact us at info@pwanbridgefort.ng.</p>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">7. Data Retention</h2>
              <p>We retain personal data only as long as necessary to fulfill the purposes outlined in this policy, or to comply with legal, tax, or regulatory requirements.</p>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">8. International Users</h2>
              <p>If you are accessing our services from outside Nigeria, note that your information may be transferred to, stored, or processed in Nigeria, where our servers and offices are located.</p>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">9. Updates to This Policy</h2>
              <p>We may update this Privacy Policy periodically. Changes will be posted on this page with an updated effective date. Continued use of our services constitutes your acceptance of the revised policy.</p>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">10. Contact Us</h2>
              <p className="mb-4">If you have any questions or concerns about this Privacy Policy, please contact:</p>
              <div className="bg-gray-50 p-4 rounded">
                <p><strong>PWAN Bridgefort Estate and Investment Ltd</strong></p>
                <p>📍 Plot 117 Wosilat Okoya Seriki Street, Eleganza Gardens Estate,<br />
                VGC Bus Stop, Lekki-Ajah, Lagos</p>
                <p>📧 <a href="mailto:info@pwanbridgefort.ng" className="text-estate-blue hover:underline">info@pwanbridgefort.ng</a></p>
                <p>📞 <a href="tel:+2348030624059" className="text-estate-blue hover:underline">+234 803 062 4059</a></p>
              </div>
            </section>
            
            <footer className="text-center text-gray-600 mt-10">
              © 2025 PWAN Bridgefort Estate and Investment Ltd. All rights reserved.
            </footer>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
