import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Box, Eye, EyeOff, Building, Phone } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card from '../ui/Card';

const SignUpPage: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      // Store demo token and redirect to dashboard
      localStorage.setItem('auth_token', 'demo_token');
      navigate('/dashboard');
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[var(--background-default)] flex items-center justify-center p-6">
      <div className="w-full max-w-[500px]">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Box className="text-[var(--primary-main)] w-12 h-12" />
            <h1 className="text-[var(--primary-main)] text-2xl font-bold ml-3">TSmart Quality</h1>
          </div>
          <h2 className="text-2xl font-semibold mb-2">Adventure starts here 🚀</h2>
          <p className="text-[var(--text-secondary)]">
            Create your account and start the journey
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Full Name"
                placeholder="Enter your name"
                startIcon={<User size={20} />}
                required
              />
              
              <Input
                label="Company Name"
                placeholder="Enter company name"
                startIcon={<Building size={20} />}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Email"
                type="email"
                placeholder="Enter your email"
                startIcon={<Mail size={20} />}
                required
              />
              
              <Input
                label="Phone"
                type="tel"
                placeholder="Enter your phone number"
                startIcon={<Phone size={20} />}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  startIcon={<Lock size={20} />}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-9 text-[var(--text-secondary)]"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                  Industry
                </label>
                <select
                  className="w-full border border-[var(--divider)] rounded-md p-2"
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

            <div className="flex items-start">
              <input
                type="checkbox"
                id="terms"
                className="mt-1 w-4 h-4 rounded border-[var(--divider)] text-[var(--primary-main)] focus:ring-[var(--primary-main)]"
                required
              />
              <label htmlFor="terms" className="ml-2 text-sm">
                I agree to the{' '}
                <button type="button" className="text-[var(--primary-main)] hover:underline">
                  terms of service
                </button>
                {' '}and{' '}
                <button type="button" className="text-[var(--primary-main)] hover:underline">
                  privacy policy
                </button>
              </label>
            </div>

            <Button 
              type="submit" 
              className="w-full"
              loading={isLoading}
            >
              Sign Up
            </Button>
          </form>
        </Card>

        <p className="text-center mt-6 text-[var(--text-secondary)]">
          Already have an account?{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-[var(--primary-main)] hover:underline"
          >
            Sign in instead
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignUpPage;