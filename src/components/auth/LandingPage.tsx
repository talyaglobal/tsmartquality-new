import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, CheckCircle, Shield, Users, BarChart2, FileText, Award, Boxes, Truck, BookOpen, Star, Linkedin, Youtube, Globe } from 'lucide-react';
import Button from '../ui/Button';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleBypassAuth = () => {
    localStorage.setItem('auth_token', 'demo_token');
    navigate('/dashboard');
  };

  const features = [
    {
      icon: <Box className="text-[var(--primary-main)]" size={32} />,
      title: 'Product Quality Management',
      description: 'Comprehensive tools for managing product quality throughout the lifecycle'
    },
    {
      icon: <CheckCircle className="text-[var(--success-main)]\" size={32} />,
      title: 'Audit & Compliance',
      description: 'Streamlined audit processes and compliance tracking'
    },
    {
      icon: <Shield className="text-[var(--warning-main)]\" size={32} />,
      title: 'Document Control',
      description: 'Centralized document management and version control'
    },
    {
      icon: <Users className="text-[var(--info-main)]\" size={32} />,
      title: 'Supplier Management',
      description: 'Efficient supplier qualification and performance monitoring'
    },
    {
      icon: <BarChart2 className="text-[var(--error-main)]\" size={32} />,
      title: 'Analytics & Reporting',
      description: 'Advanced analytics and customizable reporting tools'
    },
    {
      icon: <Award className="text-[var(--primary-main)]\" size={32} />,
      title: 'Training & Certification',
      description: 'Employee training management and certification tracking'
    },
    {
      icon: <Boxes className="text-[var(--success-main)]\" size={32} />,
      title: 'Warehouse Management',
      description: 'Complete warehouse and inventory control system'
    },
    {
      icon: <Truck className="text-[var(--warning-main)]\" size={32} />,
      title: 'Logistics Integration',
      description: 'Seamless integration with logistics and shipping systems'
    },
    {
      icon: <BookOpen className="text-[var(--info-main)]\" size={32} />,
      title: 'Quality Academy',
      description: 'Built-in learning management system for quality training'
    }
  ];

  const testimonials = [
    {
      quote: "TSmart Quality has transformed our quality management processes. We've seen a 30% reduction in quality incidents since implementation.",
      author: "Sarah Johnson",
      position: "Quality Director",
      company: "Global Foods Inc.",
      avatar: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg"
    },
    {
      quote: "The document control system is exceptional. We're now fully compliant with ISO 9001 requirements and audits are a breeze.",
      author: "Michael Chen",
      position: "Compliance Manager",
      company: "Precision Manufacturing",
      avatar: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg"
    },
    {
      quote: "The supplier management module has helped us improve our vendor relationships and ensure consistent quality of incoming materials.",
      author: "Emily Rodriguez",
      position: "Procurement Director",
      company: "Organic Essentials Co.",
      avatar: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--background-default)] to-[var(--background-paper)]">
      {/* Header */}
      <header className="bg-[var(--background-paper)] border-b border-[var(--divider)] py-6 fixed w-full top-0 z-50">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Box className="text-[var(--primary-main)] w-12 h-12" />
              <h1 className="text-[var(--primary-main)] text-2xl font-bold ml-3">TSmart Quality</h1>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-[var(--text-secondary)] hover:text-[var(--primary-main)] transition-colors">Features</a>
              <a href="#testimonials" className="text-[var(--text-secondary)] hover:text-[var(--primary-main)] transition-colors">Testimonials</a>
              <a href="#pricing" className="text-[var(--text-secondary)] hover:text-[var(--primary-main)] transition-colors">Pricing</a>
              <a href="#contact" className="text-[var(--text-secondary)] hover:text-[var(--primary-main)] transition-colors">Contact</a>
            </nav>
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={() => navigate('/login')}>
                Sign In
              </Button>
              <Button onClick={() => navigate('/register')}>
                Sign Up
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-40 pb-20 bg-gradient-to-br from-[var(--primary-main)] to-[var(--primary-dark)] text-white">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Quality Management<br />Made Simple
          </h1>
          <p className="text-xl mb-12 opacity-90 max-w-3xl mx-auto leading-relaxed">
            Streamline your quality processes, ensure compliance, and drive continuous improvement with our comprehensive quality management system.
          </p>
          <div className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-6">
            <Button 
              size="lg"
              onClick={() => navigate('/register')}
              className="bg-white text-[var(--primary-dark)] hover:bg-white hover:bg-opacity-90 px-8 font-bold"
            >
              Start Free Trial
            </Button>
            <Button 
              size="lg"
              variant="outline"
              onClick={handleBypassAuth}
              className="border-white text-white hover:bg-white hover:bg-opacity-10 px-8"
            >
              View Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-[var(--background-paper)]">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Everything You Need for Quality Excellence
          </h2>
          <p className="text-[var(--text-secondary)] text-center mb-16 max-w-2xl mx-auto">
            Our comprehensive platform provides all the tools and features you need to manage and improve your quality processes.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 bg-[var(--background-default)] rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-[var(--text-secondary)]">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 bg-[var(--background-default)]">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Trusted by Quality Professionals
          </h2>
          <p className="text-[var(--text-secondary)] text-center mb-16 max-w-2xl mx-auto">
            See what our customers have to say about TSmart Quality
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-[var(--background-paper)] p-8 rounded-xl shadow-md">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} className="text-[var(--warning-main)] fill-current" />
                  ))}
                </div>
                <p className="text-[var(--text-secondary)] mb-6 italic">"{testimonial.quote}"</p>
                <div className="flex items-center">
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.author} 
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h4 className="font-semibold">{testimonial.author}</h4>
                    <p className="text-sm text-[var(--text-secondary)]">{testimonial.position}, {testimonial.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-[var(--background-paper)]">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-[var(--text-secondary)] text-center mb-16 max-w-2xl mx-auto">
            Choose the plan that best fits your needs. All plans include core quality management features.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Starter Plan */}
            <div className="bg-[var(--background-default)] rounded-xl shadow-md p-8">
              <h3 className="text-xl font-bold mb-2">Starter</h3>
              <p className="text-[var(--text-secondary)] mb-4">Perfect for small businesses</p>
              <div className="flex items-baseline mb-6">
                <span className="text-4xl font-bold">$49</span>
                <span className="text-[var(--text-secondary)] ml-2">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <CheckCircle size={16} className="text-[var(--success-main)] mr-2" />
                  <span>Up to 5 users</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle size={16} className="text-[var(--success-main)] mr-2" />
                  <span>Basic document management</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle size={16} className="text-[var(--success-main)] mr-2" />
                  <span>Quality control tools</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle size={16} className="text-[var(--success-main)] mr-2" />
                  <span>Email support</span>
                </li>
              </ul>
              <Button className="w-full" onClick={() => navigate('/register')}>Get Started</Button>
            </div>
            
            {/* Professional Plan */}
            <div className="bg-[var(--background-default)] rounded-xl shadow-lg p-8 border-2 border-[var(--primary-main)] relative">
              <div className="absolute top-0 right-0 bg-[var(--primary-main)] text-white px-4 py-1 rounded-bl-lg font-medium">
                Popular
              </div>
              <h3 className="text-xl font-bold mb-2">Professional</h3>
              <p className="text-[var(--text-secondary)] mb-4">Ideal for growing companies</p>
              <div className="flex items-baseline mb-6">
                <span className="text-4xl font-bold">$99</span>
                <span className="text-[var(--text-secondary)] ml-2">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <CheckCircle size={16} className="text-[var(--success-main)] mr-2" />
                  <span>Up to 20 users</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle size={16} className="text-[var(--success-main)] mr-2" />
                  <span>Advanced document management</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle size={16} className="text-[var(--success-main)] mr-2" />
                  <span>Full quality control suite</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle size={16} className="text-[var(--success-main)] mr-2" />
                  <span>Supplier management</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle size={16} className="text-[var(--success-main)] mr-2" />
                  <span>Priority email & phone support</span>
                </li>
              </ul>
              <Button className="w-full" onClick={() => navigate('/register')}>Get Started</Button>
            </div>
            
            {/* Enterprise Plan */}
            <div className="bg-[var(--background-default)] rounded-xl shadow-md p-8">
              <h3 className="text-xl font-bold mb-2">Enterprise</h3>
              <p className="text-[var(--text-secondary)] mb-4">For large organizations</p>
              <div className="flex items-baseline mb-6">
                <span className="text-4xl font-bold">$199</span>
                <span className="text-[var(--text-secondary)] ml-2">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <CheckCircle size={16} className="text-[var(--success-main)] mr-2" />
                  <span>Unlimited users</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle size={16} className="text-[var(--success-main)] mr-2" />
                  <span>Complete quality management suite</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle size={16} className="text-[var(--success-main)] mr-2" />
                  <span>Advanced analytics & reporting</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle size={16} className="text-[var(--success-main)] mr-2" />
                  <span>Custom integrations</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle size={16} className="text-[var(--success-main)] mr-2" />
                  <span>24/7 dedicated support</span>
                </li>
              </ul>
              <Button className="w-full" onClick={() => navigate('/contact')}>Contact Sales</Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="contact" className="py-24 bg-gradient-to-br from-[var(--primary-light)] to-[var(--primary-main)] text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your Quality Management?
          </h2>
          <p className="text-xl mb-12 opacity-90 max-w-2xl mx-auto">
            Join thousands of companies using TSmart Quality to streamline their quality processes and ensure product excellence.
          </p>
          <div className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-6">
            <Button
              size="lg"
              onClick={() => navigate('/register')}
              className="bg-white text-[var(--primary-dark)] hover:bg-opacity-90 px-8 font-bold"
            >
              Start Free Trial
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={handleBypassAuth}
              className="border-white text-white hover:bg-white hover:bg-opacity-10 px-8"
            >
              View Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[var(--background-paper)] border-t border-[var(--divider)] py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div>
              <div className="flex items-center mb-6">
                <Box className="text-[var(--primary-main)] w-8 h-8" />
                <h3 className="text-[var(--primary-main)] font-bold ml-2">TSmart Quality</h3>
              </div>
              <p className="text-[var(--text-secondary)] mb-4">
                Empowering quality excellence through intelligent solutions.
              </p>
              <div className="flex space-x-4 mt-4">
                <a href="https://www.linkedin.com/company/talya-smart/?viewAsMember=true" target="_blank" rel="noopener noreferrer" className="text-[var(--text-secondary)] hover:text-[var(--primary-main)]">
                  <Linkedin size={24} />
                </a>
                <a href="https://www.youtube.com/@TalyaSmart" target="_blank" rel="noopener noreferrer" className="text-[var(--text-secondary)] hover:text-[var(--primary-main)]">
                  <Youtube size={24} />
                </a>
                <a href="https://www.tsmart.ai" target="_blank" rel="noopener noreferrer" className="text-[var(--text-secondary)] hover:text-[var(--primary-main)]">
                  <Globe size={24} />
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-[var(--text-secondary)]">
                <li className="hover:text-[var(--primary-main)] cursor-pointer">
                  <a href="/features">Features</a>
                </li>
                <li className="hover:text-[var(--primary-main)] cursor-pointer">
                  <a href="/pricing">Pricing</a>
                </li>
                <li className="hover:text-[var(--primary-main)] cursor-pointer">
                  <a href="/case-studies">Case Studies</a>
                </li>
                <li className="hover:text-[var(--primary-main)] cursor-pointer">
                  <a href="/documentation">Documentation</a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-[var(--text-secondary)]">
                <li className="hover:text-[var(--primary-main)] cursor-pointer">
                  <a href="/about">About Us</a>
                </li>
                <li className="hover:text-[var(--primary-main)] cursor-pointer">
                  <a href="/careers">Careers</a>
                </li>
                <li className="hover:text-[var(--primary-main)] cursor-pointer">
                  <a href="/blog">Blog</a>
                </li>
                <li className="hover:text-[var(--primary-main)] cursor-pointer">
                  <a href="/contact">Contact</a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-[var(--text-secondary)]">
                <li className="hover:text-[var(--primary-main)] cursor-pointer">
                  <a href="/privacy">Privacy Policy</a>
                </li>
                <li className="hover:text-[var(--primary-main)] cursor-pointer">
                  <a href="/terms">Terms of Service</a>
                </li>
                <li className="hover:text-[var(--primary-main)] cursor-pointer">
                  <a href="/security">Security</a>
                </li>
                <li className="hover:text-[var(--primary-main)] cursor-pointer">
                  <a href="/compliance">Compliance</a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-16 pt-8 border-t border-[var(--divider)] text-center">
            <p className="text-[var(--text-secondary)]">&copy; {new Date().getFullYear()} TSmart Quality. All rights reserved.</p>
            <p className="text-[var(--text-secondary)] mt-2">
              <a href="https://www.tsmart.ai" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--primary-main)]">www.tsmart.ai</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;