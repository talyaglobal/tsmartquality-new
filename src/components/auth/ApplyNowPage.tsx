import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, User, Building, Phone, Briefcase, Globe, FileText, Send } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card from '../ui/Card';

const ApplyNowPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    company: '',
    position: '',
    industry: '',
    employees: '',
    message: '',
    resume: null as File | null
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, resume: e.target.files![0] }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log('Form submitted:', formData);
      setIsLoading(false);
      // Show success message or redirect
      navigate('/thank-you');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[var(--background-default)] flex items-center justify-center p-6">
      <div className="w-full max-w-[800px]">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Apply Now</h1>
          <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">
            Join the growing community of businesses using TSmart Quality to transform their quality management processes.
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Full Name"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
                startIcon={<User size={20} />}
                required
              />
              
              <Input
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                startIcon={<Mail size={20} />}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Phone Number"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
                startIcon={<Phone size={20} />}
                required
              />
              
              <Input
                label="Company Name"
                name="company"
                value={formData.company}
                onChange={handleChange}
                placeholder="Enter your company name"
                startIcon={<Building size={20} />}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Job Title"
                name="position"
                value={formData.position}
                onChange={handleChange}
                placeholder="Enter your job title"
                startIcon={<Briefcase size={20} />}
                required
              />
              
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                  Industry
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-secondary)]">
                    <Globe size={20} />
                  </div>
                  <select
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                    className="input-field w-full pl-10"
                    required
                  >
                    <option value="">Select your industry</option>
                    <option value="food">Food & Beverage</option>
                    <option value="pharma">Pharmaceuticals</option>
                    <option value="manufacturing">Manufacturing</option>
                    <option value="electronics">Electronics</option>
                    <option value="chemicals">Chemicals</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                Number of Employees
              </label>
              <select
                name="employees"
                value={formData.employees}
                onChange={handleChange}
                className="w-full border border-[var(--divider)] rounded-md p-2"
                required
              >
                <option value="">Select company size</option>
                <option value="1-10">1-10 employees</option>
                <option value="11-50">11-50 employees</option>
                <option value="51-200">51-200 employees</option>
                <option value="201-500">201-500 employees</option>
                <option value="501-1000">501-1000 employees</option>
                <option value="1000+">1000+ employees</option>
              </select>
            </div>

            <Input
              label="Message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Tell us about your quality management needs"
              multiline
              rows={4}
              required
            />

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                Resume/CV (Optional)
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-[var(--divider)] rounded-md">
                <div className="space-y-1 text-center">
                  <div className="flex text-sm text-[var(--text-secondary)]">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer rounded-md font-medium text-[var(--primary-main)] hover:text-[var(--primary-dark)] focus-within:outline-none"
                    >
                      <span>Upload a file</span>
                      <input
                        id="file-upload"
                        name="resume"
                        type="file"
                        className="sr-only"
                        onChange={handleFileChange}
                        accept=".pdf,.doc,.docx"
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)]">
                    PDF, DOC, DOCX up to 10MB
                  </p>
                  {formData.resume && (
                    <p className="text-sm text-[var(--primary-main)]">
                      <FileText size={16} className="inline mr-1" />
                      {formData.resume.name}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-start">
              <input
                type="checkbox"
                id="privacy"
                className="mt-1 w-4 h-4 rounded border-[var(--divider)] text-[var(--primary-main)] focus:ring-[var(--primary-main)]"
                required
              />
              <label htmlFor="privacy" className="ml-2 text-sm">
                I agree to the{' '}
                <button type="button" className="text-[var(--primary-main)] hover:underline" onClick={() => navigate('/privacy')}>
                  privacy policy
                </button>
                {' '}and consent to being contacted about TSmart Quality services.
              </label>
            </div>

            <Button 
              type="submit" 
              className="w-full"
              loading={isLoading}
              icon={<Send size={20} />}
            >
              Submit Application
            </Button>
          </form>
        </Card>

        <p className="text-center mt-6 text-[var(--text-secondary)]">
          Already have an account?{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-[var(--primary-main)] hover:underline"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
};

export default ApplyNowPage;