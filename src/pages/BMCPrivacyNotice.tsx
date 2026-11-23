import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const sections = [
  { title: '1. Scope and separation from general services', body: 'This BMC Privacy Notice applies specifically to applicants, registered Bridgefort Multi-Business Consultants (BMCs), and persons administering the BMC partner programme. It explains how Bridgefort Homes Development Ltd processes personal information for BMC recruitment, onboarding, verification, account administration, referral attribution, partner support and commission administration. It is a separate partner-facing notice. It does not replace, amend or merge with Bridgefort’s general Privacy Policy or general Terms of Service, which continue to govern the Company’s general services and client relationships.' },
  { title: '2. Who is responsible for your information', body: 'Bridgefort Homes Development Ltd is responsible for personal information it determines to process for the BMC programme. For privacy enquiries, contact dpo@bridgeforthomes.com. Where a separate division or service provider determines its own processing purposes, the applicable information and responsibilities will be explained as required by law.' },
  { title: '3. Information we collect', body: 'Depending on the BMC relationship, we may collect name, contact details, address, date of birth where required, identity and verification documents, photograph, business and company details, selected business divisions, referral and sponsor codes, account and security records, training and activity information, commission records, bank name, account number and account-name verification results, communications, declarations and agreement acceptance evidence.' },
  { title: '4. Why we use the information', body: 'We use BMC information to process applications; verify identity and business authority; create and administer partner accounts; manage Homes, Travels and Agrovest division access; preserve referral attribution and historical records; validate leads and transactions; calculate and pay commissions; prevent fraud and unauthorised financial changes; secure accounts and systems; provide partner support and training; resolve disputes; and meet legal, tax, accounting and regulatory obligations.' },
  { title: '5. Legal grounds and transparency', body: 'We process information on applicable lawful bases under Nigerian data protection law, which may include steps requested before entering a partner agreement, performance of the BMC agreement, compliance with legal obligations, legitimate interests balanced against individual rights, and consent where consent is the appropriate basis. Where consent is used, it will be specific and may be withdrawn without affecting processing already lawfully carried out.' },
  { title: '6. Bank details and commission security', body: 'Bank details are used for partner identity checks, account ownership verification, commission payment, reconciliation, fraud prevention and financial recordkeeping. Access is limited to authorised personnel who need the information for legitimate finance, compliance or support duties. We do not need or request your ATM PIN, card security code, online banking password or bank one-time password. Never disclose those credentials to anyone claiming to represent Bridgefort. Requests to change payout details are subject to additional verification and may generate security notifications.' },
  { title: '7. Identity documents and KYC privacy', body: 'Identity documents and verification information are treated as restricted information. They are made available only to authorised personnel or vetted service providers who need them for onboarding, verification, legal compliance or fraud prevention. We apply reasonable access, storage, transmission and retention safeguards. Do not send identity documents through unofficial accounts or to persons whose authority you cannot verify.' },
  { title: '8. Sharing and recipients', body: 'We do not sell BMC personal information to unrelated third parties for their independent marketing. Where necessary and lawful, information may be shared with authorised Bridgefort personnel and relevant divisions; secure hosting, identity-verification, communications and technology providers; banks and payment providers for commission processing; professional advisers; auditors; regulators; law-enforcement agencies or courts where legally required. Appropriate contractual, confidentiality and security safeguards are used where required.' },
  { title: '9. International transfers', body: 'Some approved technology or hosting providers may process information outside Nigeria. Where an international transfer occurs, the Company will use applicable legal transfer mechanisms and safeguards required by Nigerian data protection law.' },
  { title: '10. Retention', body: 'We retain BMC information only for as long as reasonably necessary for the purposes described in this Notice, including the duration of the partner relationship, commission and financial recordkeeping, dispute resolution, fraud prevention, security and applicable legal retention periods. Where information is no longer required, it will be securely deleted, anonymised or otherwise handled in accordance with applicable law.' },
  { title: '11. Your privacy rights', body: 'Subject to applicable law and lawful exceptions, you may request access to your personal information, correction of inaccurate information, deletion, restriction or objection to certain processing, portability where applicable, and withdrawal of consent where processing is based on consent. You may also lodge a complaint with the Nigeria Data Protection Commission. We may need to verify your identity before acting on a request.' },
  { title: '12. Security and incident handling', body: 'We use reasonable technical and organisational measures designed to protect BMC information against unauthorised access, loss, alteration or disclosure. No system can be guaranteed completely secure. If you suspect that your account, identity documents, personal information or bank details have been compromised, contact dpo@bridgeforthomes.com promptly. We will assess and respond to incidents in accordance with applicable legal obligations.' },
  { title: '13. Optional marketing', body: 'Marketing and promotional communications are optional and separate from BMC registration, agreement acceptance and commission administration. You may decline or withdraw marketing consent without losing eligibility solely for that reason. Essential account, security, verification, contractual and payment communications may still be sent where necessary.' },
  { title: '14. Children and eligibility', body: 'The BMC programme is intended for persons legally capable of entering the relevant partner arrangement. We do not knowingly onboard children as BMC partners. Where a business applicant provides information about its representatives, it confirms it has authority to provide that information and has given required notices.' },
  { title: '15. Changes to this Notice', body: 'We may update this BMC-specific Notice to reflect changes in law, systems, security measures or partner operations. Material changes will be communicated through appropriate partner channels and the current version and effective date will be displayed here. This Notice remains distinct from the general Bridgefort Privacy Policy.' },
];

export default function BMCPrivacyNotice() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-24 pb-16">
        <div className="container-custom max-w-5xl">
          <article className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-8 lg:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-estate-blue">Bridgefort Homes Development Ltd · BMC Partner Network</p>
            <h1 className="mt-3 text-3xl font-bold text-foreground sm:text-4xl">BMC Privacy Notice</h1>
            <p className="mt-2 text-sm font-medium text-muted-foreground">Bridgefort Multi-Business Consultants · Version 1.0</p>
            <div className="mt-6 rounded-xl border border-estate-blue/20 bg-estate-blue/5 p-4 text-sm leading-6 text-foreground">
              This notice is exclusively for BMC applicants and partners. It is separate from Bridgefort’s general Privacy Policy and general Terms of Service for clients and users of the Company’s services.
            </div>
            <div className="mt-8 space-y-7">
              {sections.map(section => (
                <section key={section.title}>
                  <h2 className="text-lg font-semibold text-foreground">{section.title}</h2>
                  <p className="mt-2 leading-7 text-muted-foreground">{section.body}</p>
                </section>
              ))}
            </div>
            <div className="mt-9 rounded-xl border border-border p-4 text-sm leading-6 text-muted-foreground">
              <strong className="text-foreground">Privacy contact:</strong> <a className="text-estate-blue underline" href="mailto:dpo@bridgeforthomes.com">dpo@bridgeforthomes.com</a><br />
              <strong className="text-foreground">Company contact:</strong> <a className="text-estate-blue underline" href="mailto:info@bridgeforthomes.com">info@bridgeforthomes.com</a><br />
              <strong className="text-foreground">Related BMC terms:</strong> <Link className="text-estate-blue underline" to="/bmc-partner-agreement">BMC Partner Agreement</Link>
            </div>
            <p className="mt-6 text-xs leading-5 text-muted-foreground">This is a BMC-specific working privacy notice.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/bmc-partner-agreement" className="inline-flex items-center rounded-md bg-estate-blue px-5 py-3 text-sm font-semibold text-white hover:opacity-90">Read BMC Partner Agreement</Link>
              <Link to="/privacy-policy" className="inline-flex items-center rounded-md border border-border px-5 py-3 text-sm font-semibold text-foreground hover:bg-muted">General Bridgefort Privacy Policy</Link>
            </div>
          </article>
        </div>
      </main>
      <Footer />
    </div>
  );
}
