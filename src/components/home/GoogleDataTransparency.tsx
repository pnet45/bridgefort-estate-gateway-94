
import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, UserCheck } from 'lucide-react';

/**
 * GoogleDataTransparency
 *
 * Required by Google's OAuth verification guidelines:
 * "Explain with transparency the purpose for which your app requests user data"
 *
 * This section must be:
 * - Visible on the homepage without requiring login
 * - Clearly describe what data is collected via Google Sign-In and why
 * - Include a direct link to the Privacy Policy
 */
const GoogleDataTransparency = () => {
  return (
    <section className="py-12 bg-muted/40 border-t border-border">
      <div className="container-custom max-w-4xl mx-auto">

        {/* Section header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-estate-purple/10 text-estate-purple px-4 py-1.5 rounded-full text-sm font-medium mb-3">
            <Shield size={14} />
            Your Privacy & Data
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            How We Use Your Information
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Bridgefort Homes is committed to full transparency about the data we collect
            and why — in compliance with Google's OAuth verification requirements and
            Nigeria's Data Protection Act (NDPA).
          </p>
        </div>

        {/* Three cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">

          <div className="glass-card rounded-xl p-5">
            <div className="w-10 h-10 bg-estate-purple/15 rounded-lg flex items-center justify-center mb-3">
              <UserCheck size={20} className="text-estate-purple" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Google Sign-In</h3>
            <p className="text-sm text-muted-foreground">
              When you choose "Continue with Google," we request access to your
              <strong className="text-foreground"> name and email address only</strong>.
              We do not access your Google Drive, contacts, Gmail, or any other Google
              service. This data is used solely to create and identify your Bridgefort
              Homes account.
            </p>
          </div>

          <div className="glass-card rounded-xl p-5">
            <div className="w-10 h-10 bg-estate-gold/15 rounded-lg flex items-center justify-center mb-3">
              <Lock size={20} className="text-estate-gold" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Why We Need It</h3>
            <p className="text-sm text-muted-foreground">
              Your email is used to send you property purchase confirmations, payment
              receipts, training event registrations, and important account updates.
              Your name personalises your dashboard and documents. We never sell
              your data to third parties.
            </p>
          </div>

          <div className="glass-card rounded-xl p-5">
            <div className="w-10 h-10 bg-beauty-green/15 rounded-lg flex items-center justify-center mb-3">
              <Shield size={20} className="text-beauty-green" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Your Rights</h3>
            <p className="text-sm text-muted-foreground">
              You may sign in with email/password instead of Google at any time.
              You can request deletion of your data, withdraw consent, or update
              your information by contacting us at{' '}
              <a href="mailto:dpo@bridgeforthomes.com" className="text-estate-purple hover:underline">
                dpo@bridgeforthomes.com
              </a>.
            </p>
          </div>

        </div>

        {/* Privacy policy link — prominently visible per Google's requirement */}
        <div className="text-center bg-estate-purple/5 border border-estate-purple/20 rounded-xl p-5">
          <p className="text-sm text-muted-foreground mb-2">
            For full details on how we collect, store, and use your personal data:
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              to="/privacy-policy"
              className="inline-flex items-center gap-1.5 bg-estate-purple text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-estate-darkBlue transition-colors"
            >
              <Shield size={14} />
              Read our Privacy Policy
            </Link>
            <Link
              to="/NDPP"
              className="inline-flex items-center gap-1.5 border border-estate-purple text-estate-purple px-5 py-2 rounded-lg text-sm font-semibold hover:bg-estate-purple hover:text-white transition-colors"
            >
              Data Protection Policy (NDPA)
            </Link>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Bridgefort Homes Development Ltd · www.bridgeforthomes.com ·{' '}
            Registered in Nigeria · NDPA Compliant
          </p>
        </div>

      </div>
    </section>
  );
};

export default GoogleDataTransparency;
