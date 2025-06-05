import React from 'react';
import { Shield, FileText } from 'lucide-react';
import Card from '../ui/Card';

const TermsPage: React.FC = () => {
  return (
    <div className="container mx-auto px-6 py-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
        <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">
          Please read these terms carefully before using our services.
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <Card className="prose prose-lg">
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
              <p className="text-[var(--text-secondary)]">
                By accessing and using TSmart Quality's services, you accept and agree to be bound by the terms and provision of this agreement.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">2. Description of Service</h2>
              <p className="text-[var(--text-secondary)]">
                TSmart Quality provides quality management software solutions through its web-based platform. The service includes quality control, document management, and related features.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">3. User Accounts</h2>
              <p className="text-[var(--text-secondary)]">
                You must create an account to use our services. You are responsible for maintaining the security of your account and for all activities that occur under your account.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">4. Privacy Policy</h2>
              <p className="text-[var(--text-secondary)]">
                Your use of TSmart Quality's services is subject to our Privacy Policy. Please review our Privacy Policy, which also governs the site and informs users of our data collection practices.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">5. Data Security</h2>
              <p className="text-[var(--text-secondary)]">
                We implement appropriate technical and organizational measures to ensure a level of security appropriate to the risk of processing your data.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">6. Intellectual Property</h2>
              <p className="text-[var(--text-secondary)]">
                The Service and its original content, features, and functionality are owned by TSmart Quality and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">7. Termination</h2>
              <p className="text-[var(--text-secondary)]">
                We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">8. Changes to Terms</h2>
              <p className="text-[var(--text-secondary)]">
                We reserve the right to modify these terms at any time. We will notify users of any changes by posting the new Terms of Service on this page.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">9. Contact Us</h2>
              <p className="text-[var(--text-secondary)]">
                If you have any questions about these Terms, please contact us at legal@tsmartquality.com.
              </p>
            </section>
          </div>

          <div className="mt-8 p-4 bg-[var(--background-default)] rounded-lg">
            <div className="flex items-center mb-4">
              <Shield size={24} className="text-[var(--primary-main)] mr-2" />
              <h3 className="font-semibold">Last Updated</h3>
            </div>
            <p className="text-[var(--text-secondary)]">
              These terms were last updated on March 15, 2024.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TermsPage;