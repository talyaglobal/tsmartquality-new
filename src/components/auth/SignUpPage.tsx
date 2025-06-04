import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Box } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card from '../ui/Card';

const SignUpPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Store demo token and redirect to dashboard
    localStorage.setItem('auth_token', 'demo_token');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[var(--background-default)] flex items-center justify-center p-6">
      <div className="w-full max-w-[400px]">
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
            <Input
              label="Full Name"
              placeholder="Enter your name"
              startIcon={<User size={20} />}
              required
            />

            <Input
              label="Email"
              type="email"
              placeholder="Enter your email"
              startIcon={<Mail size={20} />}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="Create a password"
              startIcon={<Lock size={20} />}
              required
            />

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

            <Button type="submit" className="w-full">
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