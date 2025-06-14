
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
            <h1 className="text-3xl md:text-4xl font-bold mb-6 text-estate-blue">Terms and Conditions of Use</h1>
            <p className="text-gray-600 mb-6">Effective Date: May 20, 2025</p>
            <p className="text-gray-600 mb-6">Company Name: PWAN Bridgefort Estate and Investment Ltd<br />
            Website: www.pwanbridgefort.ng</p>
            <hr className="my-6" />
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
              <p className="mb-4">
                By using this website or any of our digital services ("the Site"), you accept these Terms and our Privacy Policy. If you do not agree, please do not use or transact on our e-commerce and investment platform.
              </p>
            </section>
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">2. Services Provided</h2>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Digital sale of residential and commercial property and land in Nigeria</li>
                <li>Land banking, land trading, and Buy2Sell investment programs</li>
                <li>End-to-end e-commerce cart, checkout and payment via trusted gateways</li>
                <li>Property management and development</li>
                <li>Training, education, and seminars on real estate investment</li>
                <li>Performance analytics and order tracking through our dashboard</li>
              </ul>
              <p>
                All services are provided in accordance with Nigerian law and international best e-commerce practices.
              </p>
            </section>
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">3. Customer Eligibility</h2>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>You must be at least 18 years old and legally capable of entering contracts to transact.</li>
                <li>Property purchases for non-Nigerian citizens or companies may attract special documentation.</li>
              </ul>
            </section>
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">4. Investment and Land Banking Disclaimer</h2>
              <p>
                All land banking and trading investments are subject to market risks. Projected ROI and resale dates are advisory only. Always consult a certified advisor before making investment decisions.
              </p>
              <p>
                We are not liable for market downturns, external regulatory changes, or loss of expected returns.
              </p>
            </section>
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">5. User Responsibilities</h2>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Providing accurate and current information during registration and purchases.</li>
                <li>Not engaging in fraudulent, illegal or abusive activity on our platform.</li>
                <li>Maintaining confidentiality of all login credentials and reporting suspicious activity promptly.</li>
                <li>Following contract, policy, and regulatory requirements of all transactions.</li>
              </ul>
            </section>
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">6. Payment & E-commerce Terms</h2>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>All property and service payments must be made through our approved payment gateway (e.g., Paystack).</li>
                <li>No cash is to be paid to agents or staff outside the platform or official channels.</li>
                <li>Refund and cancellation policies apply as published for each property or service.</li>
                <li>Order confirmation/receipts will be sent automatically by email and available on your dashboard.</li>
              </ul>
            </section>
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">7. Land Banking & Trading Compliance</h2>
              <p>
                As a digital land banking provider, we comply fully with the Nigerian Land Use Act and all relevant state/local laws. Title search/KYC/AML and legal paperwork are mandatory for investment.
              </p>
            </section>
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">8. Intellectual Property</h2>
              <p>
                All Site content (text, photos, documents, calculators, videos) remains the property of PWAN Bridgefort unless explicitly licensed separately. Use of content for personal research/decision is permitted; publishing or copying is prohibited without written permission.
              </p>
            </section>
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">9. Third-Party Links</h2>
              <p>
                Our website may contain links or integrations with payment processors, third party property partners, learning platforms, or regulatory sites. We cannot guarantee the accuracy or privacy practices of external sites.
              </p>
            </section>
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">10. Limitation of Liability</h2>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>PWAN Bridgefort is not liable for indirect, incidental, or consequential losses resulting from use of the platform.</li>
                <li>No guarantees are made for future price appreciation of any property, investment, or land banking package.</li>
                <li>Platform reliability cannot be guaranteed during scheduled maintenance or uncontrollable external downtime.</li>
              </ul>
            </section>
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">11. Privacy and Data Security</h2>
              <p>
                Use of our platform is governed by our <Link to="/privacy-policy" className="text-estate-blue hover:underline">Privacy Policy</Link>. All payments are processed via secure, encrypted channels, fully compliant with Nigerian law.
              </p>
            </section>
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">12. Dispute Resolution and Regulatory Compliance</h2>
              <p>
                Disputes will first be handled via mediation by our internal compliance team. Unresolved matters may be referred to regulatory authorities or, if needed, to arbitration in Lagos, under Nigerian law.
              </p>
            </section>
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">13. Changes to Terms</h2>
              <p>
                We reserve the right to update or amend these Terms at any time. Changes will be posted with new effective dates. Use of the platform indicates acceptance of the amended Terms.
              </p>
            </section>
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">14. Contact Information & Regulatory Address</h2>
              <div className="bg-gray-50 p-4 rounded">
                <p><strong>PWAN Bridgefort Estate and Investment Ltd</strong></p>
                <p>Plot 117 Wosilat Okoya Seriki Street, Eleganza Gardens Estate,<br />
                  VGC Bus Stop, Lekki-Ajah, Lagos, Nigeria</p>
                <p>📞 <a href="tel:+2348030624059" className="text-estate-blue hover:underline">+234 803 062 4059</a></p>
                <p>📧 <a href="mailto:info@pwanbridgefort.ng" className="text-estate-blue hover:underline">info@pwanbridgefort.ng</a></p>
              </div>
            </section>
            <footer className="text-center text-gray-600 mt-10">
              © 2025 PWAN Bridgefort Estate and Investment Ltd. E-commerce, digital real estate and land investment platform. Regulated and protected under Nigerian law.
            </footer>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsOfService;
