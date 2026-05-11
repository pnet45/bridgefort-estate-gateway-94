
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
            <p className="text-gray-600 mb-6">
              Company Name: Bridgefort Homes Development Ltd<br />
              Website: www.pwanbridgefort.ng
            </p>
            <hr className="my-6" />
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">1. Introduction</h2>
              <p className="mb-4">
                Bridgefort Homes Development Ltd ("we", "our", "us") is a fully corporate, Nigerian real estate and e-commerce company that provides innovative land banking, digital property sales, investment programs, training, and land trading services. This Privacy Policy describes how we collect, use, protect, and share your personal information.
              </p>
              <p className="mb-4">
                By using our website or any of our platforms, you agree to this policy and our data practices.
              </p>
            </section>
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">2. Information We Collect</h2>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Personal information: full name, phone numbers, email, postal address, date of birth, government-issued ID (for compliance/KYC/AML), and photographs.</li>
                <li>Automatically collected data: IP address, location, browser/device info, transaction logs, page visits, cookies, session analytics, and referral sources.</li>
                <li>Financial/payment information: card details, bank info, billing addresses (processed securely and never stored on our servers).</li>
                <li>Purchase history, investment portfolio, and communications with our support or sales teams.</li>
                <li>Business or commission information for realtors and agents.</li>
              </ul>
              <p>
                We strive to collect only the minimum data necessary, and you may use many site features without providing sensitive data.
              </p>
            </section>
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">3. How We Use Your Information</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>Facilitate land/property transactions, cart/e-commerce management, and delivery of e-contracts and documents.</li>
                <li>Verify identity for regulatory compliance (anti-money laundering, KYC).</li>
                <li>Investments: Analyze risk, calculate returns, and optimize land banking and trading products.</li>
                <li>To process secure payments through trusted providers. Bridgefort Homes Development Ltd does not store customers’ card details.</li>
                <li>Marketing, service updates, and industry insights/education by email or SMS (opt-out any time).</li>
                <li>Customer support and dispute resolution.</li>
                <li>Site and investment security, including fraud prevention.</li>
                <li>Analytics to improve our services and user experience.</li>
              </ul>
            </section>
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">4. Data Sharing & International Transfers</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>With internal departments and partners within the PWAN Group for investment, digital commerce, and compliance operations.</li>
                <li>Third-party service providers (e.g., Paystack, regulatory databases, CRM systems) only as needed for operations.</li>
                <li>Payment and verification partners who have appropriate data security standards.</li>
                <li>Regulators, anti-fraud authorities, and Nigerian government agencies when legally required.</li>
                <li>Data may be processed in Nigeria or externally (where privacy rules apply, e.g., GDPR for global users).</li>
              </ul>
            </section>
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">5. Data Security</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>Encryption, secure payments, and encrypted transmission of personal/financial info.</li>
                <li>Regular audits and staff training in regulatory and cybersecurity best practices.</li>
                <li>Access control: only authorized staff may access sensitive info.</li>
                <li>We promptly report any breaches and take remediation steps as needed.</li>
              </ul>
            </section>
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">6. Your Data Rights</h2>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Request a copy of your data</li>
                <li>Request correction, deletion, or restriction of your data</li>
                <li>Object to processing for marketing</li>
                <li>Withdraw consent for marketing at any time</li>
              </ul>
              <p>To exercise your rights, email <a href="mailto:info@pwanbridgefort.ng" className="text-estate-blue hover:underline">info@pwanbridgefort.ng</a>. Certain requests may take 14 business days and require verification for your protection.</p>
            </section>
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">7. Data Retention</h2>
              <p>
                Data is kept as long as necessary for legal, financial, or regulatory purposes. We conduct regular purges to remove unnecessary info.
              </p>
            </section>
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">8. Minors</h2>
              <p>
                We do not target or knowingly collect data from anyone under 18. Parents may request removal of children's info.
              </p>
            </section>
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">9. International & Regulatory Compliance</h2>
              <p>
                We comply with Nigeria Data Protection Act, NDPR, and international privacy standards. Where required, global data transfers are protected by standard contractual clauses.
              </p>
            </section>
            <section className="mb-8" id="amlkyc">
              <h2 className="text-2xl font-bold mb-4">10. Anti-Money Laundering (AML) & KYC Policy</h2>
              <p>
                To meet Nigerian and global standards, we collect KYC information for large transactions, may request additional verification, and monitor transactions to detect suspicious patterns.
              </p>
            </section>
            <section className="mb-8" id="risk">
              <h2 className="text-2xl font-bold mb-4">11. Risk Disclosure</h2>
              <p>
                Investment in real estate, land banking and trading involves risks. We make efforts to secure your data, prevent fraud, and provide education, but all investments carry risk of loss, including (rarely) data-related incidents.
              </p>
            </section>
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">12. Changes to this Policy</h2>
              <p>
                We may update this Privacy Policy at any time, with dates posted above. Continued use of our platforms indicates acceptance of updated terms.
              </p>
            </section>
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">13. Contact Us</h2>
              <div className="bg-gray-50 p-4 rounded">
                <p><strong>Bridgefort Homes Development Ltd</strong></p>
                <p>
                  📍 Plot 117 Wosilat Okoya Seriki Street, Eleganza Gardens Estate,<br />
                  VGC Bus Stop, Lekki-Ajah, Lagos
                </p>
                <p>📧 <a href="mailto:info@pwanbridgefort.ng" className="text-estate-blue hover:underline">info@pwanbridgefort.ng</a></p>
                <p>📞 <a href="tel:+2348030624059" className="text-estate-blue hover:underline">+234 803 062 4059</a></p>
              </div>
            </section>
            <footer className="text-center text-gray-600 mt-10">
              © 2025 Bridgefort Homes Development Ltd. All rights reserved. <br />
              This platform and all data are protected under Nigerian law and global privacy standards.
            </footer>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
