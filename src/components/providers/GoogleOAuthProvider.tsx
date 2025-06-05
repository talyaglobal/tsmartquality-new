import React from 'react';
import { GoogleOAuthProvider as GoogleProvider } from '@react-oauth/google';

interface GoogleOAuthProviderProps {
  children: React.ReactNode;
}

const GoogleOAuthProvider: React.FC<GoogleOAuthProviderProps> = ({ children }) => {
  // In a real application, you would get this from environment variables
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your-client-id';

  return (
    <GoogleProvider clientId={clientId}>
      {children}
    </GoogleProvider>
  );
};

export default GoogleOAuthProvider;