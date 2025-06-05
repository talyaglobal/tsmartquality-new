import React from 'react';
import Card from '../ui/Card';
import { Shield, Lock, Eye, FileText } from 'lucide-react';

const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-[var(--text-secondary)]">
          Last updated: April 1, 2024
        </p>
      </div>
      
      <Card className="mb-8">
        <div className="flex items-center mb-4">
          <Shield className="text-[var(--primary-main)] mr-3" size={24} />
          <h2 className="text-2xl font-semibold">Our Commitment to Privacy</h2>
        </div>
        <p className="text-[var(--text-secondary)] mb-4">
          At TSmart Quality, we take your privacy seriously and are committed to protecting your personal information. 
          This Privacy Policy explains how we collect, use, and safeguard your data when you use our services.
        </p>
      </Card>

      <div className="space-y-8">
        <Card>
          <h2 className="text-xl font-semibold mb-4">1. Information We Collect</h2>
          <p className="text-[var(--text-secondary)] mb-4">
            We collect information that you provide directly to us, including:
          </p>
          <ul className="list-disc pl-6 text-[var(--text-secondary)] mb-4 space-y-2">
            <li>Contact information (name, email address, phone number)</li>
            <li>Account credentials</li>
            <li>Company information</li>
            <li>Usage data and preferences</li>
            <li>Information about your devices and browsers</li>
          </ul>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold mb-4">2. How We Use Your Information</h2>
          <p className="text-[var(--text-secondary)] mb-4">
            We use the collected information to:
          </p>
          <ul className="list-disc pl-6 text-[var(--text-secondary)] mb-4 space-y-2">
            <li>Provide and maintain our services</li>
            <li>Process your transactions</li>
            <li>Send you important updates and notifications</li>
            <li>Improve our services and user experience</li>
            <li>Comply with legal obligations</li>
            <li>Prevent fraud and abuse</li>
          </ul>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold mb-4">3. Data Security</h2>
          <div className="flex items-center mb-4">
            <Lock className="text-[var(--success-main)] mr-3" size={24} />
            <p className="text-[var(--text-secondary)]">
              We implement appropriate technical and organizational measures to protect your personal information
              against unauthorized access, alteration, disclosure, or destruction.
            </p>
          </div>
          <p className="text-[var(--text-secondary)] mb-4">
            Our security practices include:
          </p>
          <ul className="list-disc pl-6 text-[var(--text-secondary)] mb-4 space-y-2">
            <li>Encryption of sensitive data</li>
            <li>Regular security assessments</li>
            <li>Access controls and authentication</li>
            <li>Secure data storage</li>
            <li>Employee training on data protection</li>
          </ul>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold mb-4">4. Your Rights</h2>
          <div className="flex items-center mb-4">
            <Eye className="text-[var(--info-main)] mr-3" size={24} />
            <p className="text-[var(--text-secondary)]">
              You have the right to:
            </p>
          </div>
          <ul className="list-disc pl-6 text-[var(--text-secondary)] mb-4 space-y-2">
            <li>Access your personal information</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Object to data processing</li>
            <li>Request data portability</li>
            <li>Withdraw consent at any time</li>
          </ul>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold mb-4">5. Data Retention</h2>
          <p className="text-[var(--text-secondary)] mb-4">
            We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, 
            unless a longer retention period is required or permitted by law.
          </p>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold mb-4">6. Third-Party Services</h2>
          <p className="text-[var(--text-secondary)] mb-4">
            Our services may contain links to third-party websites or services that are not owned or controlled by TSmart Quality. 
            We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party 
            websites or services.
          </p>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold mb-4">7. Changes to This Privacy Policy</h2>
          <p className="text-[var(--text-secondary)] mb-4">
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new 
            Privacy Policy on this page and updating the "Last updated" date.
          </p>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold mb-4">8. Contact Us</h2>
          <div className="flex items-center mb-4">
            <FileText className="text-[var(--primary-main)] mr-3" size={24} />
            <p className="text-[var(--text-secondary)]">
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
          </div>
          <div className="pl-10 text-[var(--text-secondary)]">
            <p>Email: privacy@tsmartquality.com</p>
            <p>Address: 123 Quality Street, San Francisco, CA 94105</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPage;