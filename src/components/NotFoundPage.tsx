import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import Button from './ui/Button';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[var(--background-default)] flex items-center justify-center p-6">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-[var(--primary-main)]">404</h1>
        <h2 className="text-3xl font-semibold mt-4 mb-2">Page Not Found</h2>
        <p className="text-[var(--text-secondary)] mb-8 max-w-md mx-auto">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <div className="flex justify-center space-x-4">
          <Button
            variant="outline"
            icon={<ArrowLeft size={20} />}
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>
          <Button
            icon={<Home size={20} />}
            onClick={() => navigate('/')}
          >
            Home Page
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;