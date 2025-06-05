import React, { useState } from 'react';
import { Mail, Phone, MapPin, MessageSquare, Send, Linkedin, Youtube, Globe } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log('Form submitted:', formData);
      setIsLoading(false);
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
      // Show success message (in a real app)
    }, 1000);
  };

  const contactInfo = [
    {
      icon: <Mail className="text-[var(--primary-main)]\" size={24} />,
      title: 'Email',
      content: 'info@tsmart.ai',
      link: 'mailto:info@tsmart.ai'
    },
    {
      icon: <Phone className="text-[var(--success-main)]\" size={24} />,
      title: 'Phone',
      content: '+1 (201) 719-1777',
      link: 'tel:+12017191777'
    },
    {
      icon: <MapPin className="text-[var(--error-main)]\" size={24} />,
      title: 'Address',
      content: '17-09 Zink Pl UNIT 4, Fair Lawn, NJ 07410, United States',
      link: 'https://maps.google.com'
    }
  ];

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
        <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">
          Have questions? We're here to help. Reach out to our team for support or inquiries.
        </p>
        <div className="flex justify-center space-x-4 mt-6">
          <a href="https://www.linkedin.com/company/talya-smart/?viewAsMember=true" target="_blank" rel="noopener noreferrer" className="text-[var(--text-secondary)] hover:text-[var(--primary-main)]">
            <Linkedin size={24} />
          </a>
          <a href="https://www.youtube.com/@TalyaSmart" target="_blank" rel="noopener noreferrer" className="text-[var(--text-secondary)] hover:text-[var(--primary-main)]">
            <Youtube size={24} />
          </a>
          <a href="https://www.tsmart.ai" target="_blank" rel="noopener noreferrer" className="text-[var(--text-secondary)] hover:text-[var(--primary-main)] flex items-center">
            <Globe size={24} />
            <span className="ml-1">www.tsmart.ai</span>
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {contactInfo.map((info, index) => (
          <Card key={index}>
            <a
              href={info.link}
              className="block text-center hover:bg-[var(--primary-light)] hover:bg-opacity-5 transition-colors rounded-lg p-4"
            >
              <div className="mb-4">{info.icon}</div>
              <h3 className="font-semibold mb-2">{info.title}</h3>
              <p className="text-[var(--text-secondary)]">{info.content}</p>
            </a>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <Card>
          <h2 className="text-2xl font-bold mb-6">Send us a Message</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
              <Input
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <Input
              label="Phone"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
            <Input
              label="Subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
            />
            <Input
              label="Message"
              multiline
              rows={4}
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
            />
            <Button
              type="submit"
              icon={<Send size={20} />}
              loading={isLoading}
            >
              Send Message
            </Button>
          </form>
        </Card>

        <div>
          <Card>
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">How can I get started?</h3>
                <p className="text-[var(--text-secondary)]">
                  Getting started is easy! Simply sign up for a free trial and our team will guide you through the setup process.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">What support options are available?</h3>
                <p className="text-[var(--text-secondary)]">
                  We offer 24/7 email support, phone support during business hours, and comprehensive documentation.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Do you offer custom solutions?</h3>
                <p className="text-[var(--text-secondary)]">
                  Yes, we can customize our platform to meet your specific needs. Contact our sales team to discuss your requirements.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Is there a free trial available?</h3>
                <p className="text-[var(--text-secondary)]">
                  Yes, we offer a 14-day free trial with full access to all features. No credit card required.
                </p>
              </div>
            </div>
          </Card>
          
          <div className="mt-8">
            <Card>
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-full bg-[var(--primary-light)] text-[var(--primary-dark)]">
                  <MessageSquare size={24} />
                </div>
                <div>
                  <h3 className="font-semibold">Live Chat Support</h3>
                  <p className="text-[var(--text-secondary)]">Our team is available Monday-Friday, 9am-5pm PT</p>
                </div>
              </div>
              <Button className="w-full mt-4">
                Start Live Chat
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;