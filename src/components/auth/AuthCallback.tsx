
import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useEmailConfirmation } from '@/hooks/useEmailConfirmation';
import { LoadingSpinner } from '../shared/LoadingSpinner';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleEmailConfirmation } = useEmailConfirmation();
  
  useEffect(() => {
    const processCallback = async () => {
      const email = searchParams.get('email');
      const token_hash = searchParams.get('token_hash');
      
      if (email && token_hash) {
        // Handle email confirmation
        const success = await handleEmailConfirmation(email, token_hash);
        
        if (success) {
          // Redirect to login page after successful confirmation
          navigate('/login');
        }
      } else {
        // For other auth callbacks or if missing parameters
        navigate('/login');
      }
    };
    
    processCallback();
  }, [searchParams, navigate, handleEmailConfirmation]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <h2 className="mt-4 text-xl text-white">Processing authentication...</h2>
      </div>
    </div>
  );
};

export default AuthCallback;
