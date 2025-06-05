import React from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import Button from '../ui/Button';
import { Link2 } from 'lucide-react';

interface GoogleOAuthButtonProps {
  onSuccess: (tokenResponse: any) => void;
  onError?: (error: any) => void;
  buttonText?: string;
}

const GoogleOAuthButton: React.FC<GoogleOAuthButtonProps> = ({ 
  onSuccess, 
  onError,
  buttonText = 'Connect with Google'
}) => {
  const login = useGoogleLogin({
    onSuccess,
    onError,
    scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/calendar.events',
  });

  return (
    <Button
      icon={<Link2 size={20} />}
      onClick={() => login()}
    >
      {buttonText}
    </Button>
  );
};

export default GoogleOAuthButton;