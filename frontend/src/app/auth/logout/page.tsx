'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    // Remove the auth token
    Cookies.remove('auth_token');
    
    // Redirect to login page
    setTimeout(() => {
      router.push('/auth/login');
    }, 100);
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-xl font-semibold">Logging out...</h1>
      <p className="text-gray-600 mt-2">You will be redirected shortly.</p>
    </div>
  );
}