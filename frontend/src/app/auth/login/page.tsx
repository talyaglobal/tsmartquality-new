import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="bg-white">
      <Navbar />
      
      <div className="flex min-h-screen flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
            Sign in to your account
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <LoginForm />

          <p className="mt-10 text-center text-sm text-gray-500">
            Not a member?{' '}
            <Link href="/auth/signup" className="font-semibold leading-6 text-primary-600 hover:text-primary-500">
              Sign up for a free account
            </Link>
          </p>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}