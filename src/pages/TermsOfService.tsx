
import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const TermsOfService = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-16">
        <div className="container-custom">
          <div className="bg-white rounded-lg shadow-md p-6 md:p-10">
            <h1 className="text-3xl md:text-4xl font-bold mb-6 text-estate-blue">Terms and Conditions</h1>
            <p className="text-gray-600 mb-6">Effective Date: May 20, 2025</p>
            <p className="text-gray-600 mb-6">Company Name: PWAN Bridgefort Estate and Investment Ltd<br />
            Website: www.pwanbridgefort.ng</p>
            <hr className="my-6" />
            
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
              <p className="mb-4">By accessing or using our website (the "Site") and services offered by PWAN Bridgefort ("we", "us", or "our"), you agree to be bound by these Terms and Conditions and our Privacy Policy. If you do not agree to these terms, please do not use our website.</p>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">2. Services Provided</h2>
              <p className="mb-4">PWAN Bridgefort offers real estate investment and property services, including but not limited to:</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Sale of residential and commercial land/property</li>
                <li>Buy2Sell investment packages</li>
                <li>Property management and development</li>
                <li>Training programs and consultancy</li>
                <li>Rental income plans</li>
                <li>Investment advisory and performance tracking tools</li>
              </ul>
              <p>All services are provided in accordance with applicable Nigerian laws and are subject to change without prior notice.</p>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">3. Eligibility</h2>
              <p className="mb-4">Our services are available to individuals who are 18 years or older and legally capable of entering into binding contracts. By using this website, you represent and warrant that you meet these requirements.</p>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">4. Investment Disclaimer</h2>
              <p className="mb-4">Real estate investments carry inherent risks. Although PWAN Bridgefort provides projections (e.g., through the Buy2Sell program or Land Banking Calculator), these are estimates based on historical data and market trends. Actual results may vary, and past performance is not indicative of future results. Always consult with our certified investment advisors before making financial decisions.</p>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">5. User Responsibilities</h2>
              <p className="mb-4">By using our website or services, you agree to:</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Provide accurate, complete, and current information.</li>
                <li>Not use our services for illegal purposes.</li>
                <li>Not impersonate another person or misrepresent your affiliation with a person or entity.</li>
                <li>Keep your account credentials secure if a login is required.</li>
              </ul>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">6. Buy2Sell Program Terms</h2>
              <p className="mb-4">Buy2Sell is an investment option that allows you to purchase property with the intention of reselling it within 12 months. While PWAN Bridgefort strives to secure up to 30% returns, these returns are not guaranteed. Properties must meet program criteria, and resale timing may depend on market conditions.</p>
              <p className="mb-4">Specific contracts and conditions will apply and be provided at the point of sale or investment.</p>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">7. Intellectual Property</h2>
              <p className="mb-4">All content on the Site—including text, graphics, logos, videos, documents, calculators, and software—is the property of PWAN Bridgefort or its licensors. You may not reproduce, distribute, or exploit any content without our prior written consent.</p>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">8. Third-Party Links</h2>
              <p className="mb-4">Our website may contain links to third-party websites or services not owned or controlled by PWAN Bridgefort. We are not responsible for the content, policies, or practices of these websites and encourage users to read their terms and conditions.</p>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">9. Limitation of Liability</h2>
              <p className="mb-4">PWAN Bridgefort shall not be liable for any indirect, incidental, special, or consequential damages arising out of your use of our website or services, including loss of investment or profit.</p>
              <p className="mb-4">While we strive for accuracy, we do not guarantee the completeness or reliability of information displayed on the Site.</p>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">10. Privacy</h2>
              <p className="mb-4">Our Privacy Policy explains how we collect, use, and protect your personal data. By using our Site and services, you consent to the practices described in our Privacy Policy.</p>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">11. Modifications to Terms</h2>
              <p className="mb-4">PWAN Bridgefort reserves the right to update or modify these Terms at any time. We will notify users by updating the "Effective Date" above. Your continued use of our website following any changes means you accept the revised Terms.</p>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">12. Governing Law</h2>
              <p className="mb-4">These Terms and any dispute arising out of your use of our services shall be governed by and construed in accordance with the laws of the Federal Republic of Nigeria.</p>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">13. Contact Information</h2>
              <p className="mb-4">For questions about these Terms or our services, contact us at:</p>
              <div className="bg-gray-50 p-4 rounded">
                <p><strong>PWAN Bridgefort Estate and Investment Ltd</strong></p>
                <p>Plot 117 Wosilat Okoya Seriki Street, Eleganza Gardens Estate,<br />
                VGC Bus Stop, Lekki-Ajah, Lagos</p>
                <p>📞 <a href="tel:+2348030624059" className="text-estate-blue hover:underline">+234 803 062 4059</a></p>
                <p>📧 <a href="mailto:info@pwanbridgefort.ng" className="text-estate-blue hover:underline">info@pwanbridgefort.ng</a></p>
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

export default TermsOfService;
