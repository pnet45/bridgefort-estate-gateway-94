import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const sections = [
  { title: '1. Purpose and partner status', body: 'The BMC programme establishes a network of independent consultants and referral partners who introduce prospective customers and business opportunities to Bridgefort. Registration is an application only. A referral code or dashboard identity generated for attribution does not itself grant authority to represent or bind the Company, nor does it activate commission eligibility. Official BMC status and division privileges remain subject to identity verification and approval by authorised Company Management.' },
  { title: '2. Business divisions and scope', body: 'Approved BMCs may participate in Bridgefort Homes (real estate and property services), Bridgefort Travels (travel, tourism, flight and accommodation services) and Bridgefort Agrovest (agriculture, agribusiness and distribution). Each division is subject to separate approval, operating rules and commission schedules.' },
  { title: '3. Independent consultant relationship', body: 'A BMC is an independent consultant or referral partner, not an employee, director, shareholder, franchisee, legal agent or authorised signatory of Bridgefort Homes Development Ltd. A BMC must not bind the Company, sign contracts, make guarantees, promise discounts or commit Company resources without specific written authority.' },
  { title: '4. Professional conduct and marketing', body: 'BMCs must act honestly, accurately and professionally; use only approved marketing materials; disclose relevant conflicts; comply with applicable laws; and avoid misleading claims, impersonation, bribery, fraud or conduct that harms customers or the Company. Prices, offers, property details, travel terms and investment representations must not be altered or invented.' },
  { title: '5. Referral identity and legacy codes', body: 'Referral codes and links are assigned to a partner account and may not be sold, rented, duplicated or manipulated. A code is an attribution identifier only; it is not proof of Company employment, agency, approval, commission entitlement or authority to collect funds. Existing BH-Realtors referral codes, QR codes, sponsor relationships and valid historical attribution are intended to remain compatible during the BMC transition. Referral eligibility and attribution remain subject to verified system records and division-specific rules.' },
  { title: '6. Commissions and earnings', body: 'Commissions are governed by the approved written schedule for the relevant division. A lead, enquiry, booking request or expression of interest does not by itself create a commission entitlement. Eligibility may depend on genuine attribution, completed transaction requirements, cleared customer funds, verification and other published conditions. Undisputed commissions properly earned under the applicable schedule will not be arbitrarily withheld. Any adjustment, recovery or reversal must have a documented basis and comply with applicable law.' },
  { title: '7. Bank details and financial security', body: 'Commission payments are made only to a verified account belonging to the BMC, or another account approved through documented verification. Bank-detail changes require re-authentication and independent confirmation through a previously registered contact channel. Bridgefort will never request an ATM PIN, online banking password, card security code or bank OTP to release commission. BMCs must never share those credentials or pay a personal account to unlock a commission.' },
  { title: '8. Customer funds and payment instructions', body: 'BMCs must not collect, hold, redirect or transfer customer funds into personal accounts on behalf of the Company unless separately authorised in writing. Customers must use official payment instructions. Unauthorised receipts, altered invoices, unofficial payment instructions or suspected diversion of funds must be reported immediately.' },
  { title: '9. Confidentiality and company property', body: 'Customer information, unpublished prices, commission schedules, business plans, staff information, internal communications, platform access, documents and other non-public information must be protected and used only for approved BMC activities. Company trademarks, logos, materials, databases and intellectual property may be used only with permission. Confidentiality continues after the partnership ends while the information remains protected.' },
  { title: '10. BMC privacy and personal data', body: 'Bridgefort processes BMC identity, contact, business, verification, banking, referral and transaction information for partner onboarding, account administration, KYC, security, commission processing, fraud prevention and legal compliance. Access is restricted to authorised personnel with a legitimate need. Personal information is not sold to unrelated third parties for their independent marketing. Service providers, financial institutions, professional advisers or regulators may receive necessary information subject to applicable safeguards. Retention is limited to legitimate business and legal requirements.' },
  { title: '11. BMC rights and security responsibilities', body: 'Subject to applicable law, BMCs may request access to or correction of their personal information and exercise other data-subject rights. BMCs must keep account credentials confidential, use reasonable device security and promptly report suspected account, data or bank-detail compromise. Marketing communications require separate optional consent and are not a condition of BMC application.' },
  { title: '12. Customer privacy and non-circumvention', body: 'Customer and prospect information obtained through Bridgefort must not be used for unrelated personal marketing or unauthorised competing activity. BMCs must not deliberately divert or conceal Company-generated leads or transactions to evade referral or commission rules. This does not prohibit lawful independent business unrelated to misuse of Company confidential information or improperly diverted opportunities.' },
  { title: '13. Verification, audit and prohibited conduct', body: 'Bridgefort may reasonably verify identity, business details, referrals, transactions and commission claims. Fraud, falsified documents, referral manipulation, unauthorised collection or diversion of funds, misuse of confidential information, misleading claims, unauthorised access and serious policy violations may result in investigation, restrictions, suspension or termination.' },
  { title: '14. Suspension and termination', body: 'Either party may end the relationship under applicable partner policy or written notice. Bridgefort may take proportionate protective action where credible concerns involve fraud, unlawful conduct, customer safety, funds, data or systems. Except where immediate protective action is reasonably necessary, the BMC will be informed of the concern and given a reasonable opportunity to respond. Properly earned and undisputed commissions remain subject to the agreed schedule and applicable law.' },
  { title: '15. Liability and indemnity', body: 'Each party remains responsible for its own acts and omissions. A BMC may be responsible for losses directly caused by proven fraud, wilful misconduct, negligence or material breach, subject to applicable law. Nothing in this Agreement excludes liability or statutory rights that cannot lawfully be excluded.' },
  { title: '16. Disputes and governing law', body: 'The parties will first attempt good-faith resolution. If unresolved, they may pursue mediation or refer the dispute to a court of competent jurisdiction in Nigeria. This Agreement is governed by the laws of the Federal Republic of Nigeria.' },
  { title: '17. Changes and entire agreement', body: 'This BMC Agreement operates alongside the separate BMC Privacy Notice and approved division-specific rules and commission schedules. It does not replace, amend or merge with Bridgefort's general Terms of Service or general Privacy Policy, which continue to govern the Company's general services and client relationships. Material amendments will be communicated to affected BMCs and will not retrospectively remove commissions already properly earned. If any provision is unenforceable, the remaining provisions continue to the extent permitted by law.' },
  { title: '18. Declaration and acceptance', body: 'By electronically accepting this Agreement, the applicant confirms that the information supplied is accurate, that they have authority to apply personally or for the business named in their application, that they understand BMC status requires Company approval, and that they agree to comply with the obligations described here.' },
];

const BMCPartnerAgreement = () => (
  <div className="min-h-screen flex flex-col bg-background">
    <Navbar />
    <main className="flex-1 pt-24 pb-16">
      <div className="container-custom max-w-5xl">
        <article className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-8 lg:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-estate-blue">Bridgefort Homes Development Ltd</p>
          <h1 className="mt-3 text-3xl font-bold text-foreground sm:text-4xl">BMC Partner Agreement</h1>
          <p className="mt-2 text-sm font-medium text-muted-foreground">Bridgefort Multi-Business Consultants · Version 1.0 · Effective upon formal approval</p>
          <p className="mt-6 text-lg font-semibold text-foreground">ONE NETWORK. MULTIPLE BUSINESS OPPORTUNITIES.</p>
          <div className="mt-5 rounded-xl border border-estate-blue/20 bg-estate-blue/5 p-4 text-sm leading-6 text-foreground">
            This Agreement is between Bridgefort Homes Development Ltd (the “Company”) and the individual or duly authorised business representative applying to join the BMC network (the “BMC”). Applying does not itself confer official partner status; approval follows verification and formal Company acceptance.
          </div>
          <div className="mt-8 space-y-7">
            {sections.map((section) => (
              <section key={section.title}>
                <h2 className="text-lg font-semibold text-foreground">{section.title}</h2>
                <p className="mt-2 leading-7 text-muted-foreground">{section.body}</p>
              </section>
            ))}
          </div>
          <div className="mt-9 rounded-xl border border-border p-4 text-sm leading-6 text-muted-foreground">
            <strong className="text-foreground">Company:</strong> Bridgefort Homes Development Ltd<br />
            <strong className="text-foreground">Contact:</strong> <a className="text-estate-blue underline" href="mailto:info@bridgeforthomes.com">info@bridgeforthomes.com</a><br />
            <strong className="text-foreground">BMC Privacy:</strong> Read the separate <Link className="text-estate-blue underline" to="/bmc-privacy-notice">BMC Privacy Notice</Link>. The general Bridgefort Privacy Policy remains a separate document for general services and client relationships.
          </div>
          <p className="mt-6 text-xs leading-5 text-muted-foreground">This is a working digital agreement draft for implementation and must receive review and approval from qualified Nigerian legal counsel before it is treated as the Company's final executed legal instrument. Division-specific commission schedules and any special authority must be issued separately in writing.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/bridgefort-realtors-login" className="inline-flex items-center rounded-md bg-estate-blue px-5 py-3 text-sm font-semibold text-white hover:opacity-90">Apply to join BMC</Link>
            <Link to="/bmc-privacy-notice" className="inline-flex items-center rounded-md border border-border px-5 py-3 text-sm font-semibold text-foreground hover:bg-muted">Read BMC Privacy Notice</Link>
          </div>
        </article>
      </div>
    </main>
    <Footer />
  </div>
);

export default BMCPartnerAgreement;
