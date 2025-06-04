import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Box } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card from '../ui/Card';

const SignInPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Store demo token and redirect to dashboard
    localStorage.setItem('auth_token', 'demo_token');
    navigate('/dashboard');
  };

  const handleBypassAuth = () => {
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
          <h2 className="text-2xl font-semibold mb-2">Welcome back! 👋</h2>
          <p className="text-[var(--text-secondary)]">
            Please sign in to your account
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
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
              placeholder="Enter your password"
              startIcon={<Lock size={20} />}
              required
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-[var(--divider)] text-[var(--primary-main)] focus:ring-[var(--primary-main)]"
                />
                <span className="ml-2 text-sm">Remember me</span>
              </label>
              <button
                type="button"
                className="text-sm text-[var(--primary-main)] hover:underline"
              >
                Forgot Password?
              </button>
            </div>

            <Button type="submit" className="w-full">
              Sign In
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={handleBypassAuth}
                className="text-sm text-[var(--text-secondary)] hover:text-[var(--primary-main)]"
              >
                Access Dashboard Demo
              </button>
            </div>
          </form>
        </Card>

        <p className="text-center mt-6 text-[var(--text-secondary)]">
          Don't have an account?{' '}
          <button
            onClick={() => navigate('/register')}
            className="text-[var(--primary-main)] hover:underline"
          >
            Create an account
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignInPage;