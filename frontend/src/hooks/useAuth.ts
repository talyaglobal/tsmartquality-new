'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { authAPI } from '@/lib/api';

export interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

export function useAuth() {
  const router = useRouter();
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null
  });

  const loadUserProfile = async () => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));
      
      const token = Cookies.get('auth_token');
      if (!token) {
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
          error: null
        });
        return;
      }
      
      const userData = await authAPI.getProfile();
      
      setAuthState({
        user: userData.user,
        isLoading: false,
        isAuthenticated: true,
        error: null
      });
    } catch (error) {
      console.error('Failed to load user profile:', error);
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: 'Session expired or invalid'
      });
      Cookies.remove('auth_token');
    }
  };

  useEffect(() => {
    loadUserProfile();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));
      
      const response = await authAPI.login(email, password);
      
      Cookies.set('auth_token', response.token, { expires: 7 }); // 7 days
      
      setAuthState({
        user: response.user,
        isLoading: false,
        isAuthenticated: true,
        error: null
      });
      
      return response;
    } catch (error: any) {
      console.error('Login error:', error);
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: error.response?.data?.message || 'Failed to login'
      }));
      throw error;
    }
  };

  const register = async (username: string, name: string, surname: string, email: string, password: string) => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));
      
      const response = await authAPI.register(username, name, surname, email, password);
      
      Cookies.set('auth_token', response.token, { expires: 7 }); // 7 days
      
      setAuthState({
        user: response.user,
        isLoading: false,
        isAuthenticated: true,
        error: null
      });
      
      return response;
    } catch (error: any) {
      console.error('Register error:', error);
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: error.response?.data?.message || 'Failed to register'
      }));
      throw error;
    }
  };

  const logout = () => {
    authAPI.logout();
    setAuthState({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      error: null
    });
    router.push('/auth/login');
  };

  const updateProfile = async (userData: Partial<User>) => {
    try {
      const response = await authAPI.updateProfile(userData);
      
      setAuthState((prev) => ({
        ...prev,
        user: response.user
      }));
      
      return response;
    } catch (error: any) {
      console.error('Update profile error:', error);
      setAuthState((prev) => ({
        ...prev,
        error: error.response?.data?.message || 'Failed to update profile'
      }));
      throw error;
    }
  };

  return {
    ...authState,
    login,
    register,
    logout,
    updateProfile,
    refreshUser: loadUserProfile,
  };
}