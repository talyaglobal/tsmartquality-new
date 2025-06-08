'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Cookies from 'js-cookie';

// Pages that don't require authentication
const publicPaths = ['/', '/auth/login', '/auth/signup', '/auth/forgot-password'];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  
  useEffect(() => {
    // Check if the current path requires authentication
    const requiresAuth = !publicPaths.includes(pathname);
    
    // Check if the user is authenticated
    const token = Cookies.get('auth_token');
    const isAuthenticated = !!token;
    
    if (requiresAuth && !isAuthenticated) {
      // Redirect to login page if not authenticated
      router.push('/auth/login');
    }
  }, [pathname, router]);
  
  return <>{children}</>;
}