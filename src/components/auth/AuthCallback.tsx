
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useEmailConfirmation } from '@/hooks/useEmailConfirmation';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { useAuthCallback } from '@/hooks/useAuthCallback';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { GoogleAuthHandler } from './handlers/GoogleAuthHandler';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { handleEmailConfirmation } = useEmailConfirmation();
  const { handleCallback } = useAuthCallback();
  const [processingStatus, setProcessingStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [statusMessage, setStatusMessage] = useState('Processing authentication...');
  const [isEmailConfirmation, setIsEmailConfirmation] = useState(false);
  const [isOAuthFlow, setIsOAuthFlow] = useState(false);
  
  useEffect(() => {
    const processCallback = async () => {
      console.log("AuthCallback: Processing started with URL params:", Object.fromEntries(searchParams.entries()));
      setProcessingStatus('processing');
      
      // Set a flag to indicate login processing, this prevents redirects 
      // during authentication flow
      localStorage.setItem('login_in_progress', 'true');
      
      try {
        // Check if this is a special post-payment flow (marked by postPaymentConfirmation flag)
        const isPostPayment = localStorage.getItem('postPaymentConfirmation') === 'true';
        if (isPostPayment) {
          console.log("AuthCallback: Post-payment confirmation flow detected");
          setStatusMessage('Completing your subscription...');
        }
        
        // Check if this is an email confirmation callback
        const email = searchParams.get('email');
        const token_hash = searchParams.get('token_hash');
        const type = searchParams.get('type');
        const provider = searchParams.get('provider');
        
        // Check if this is a Google OAuth callback
        if (provider === 'google' || type === 'oauth') {
          console.log("AuthCallback: Detected OAuth callback with provider:", provider || 'unknown');
          setIsOAuthFlow(true);
          return; // Let GoogleAuthHandler component handle this
        }
        
        if (email && token_hash) {
          console.log("AuthCallback: Handling email confirmation for:", email);
          setIsEmailConfirmation(true);
          setStatusMessage('Confirming your email address...');
          
          // Handle email confirmation
          const success = await handleEmailConfirmation(email, token_hash);
          
          if (success) {
            setProcessingStatus('success');
            setStatusMessage('Email confirmed successfully! Redirecting...');
            
            if (isPostPayment) {
              // For post-payment flow, don't clear flags yet
              setTimeout(() => window.location.href = '/chat', 1000);
            } else {
              // Regular flow - clear flag and redirect
              localStorage.removeItem('login_in_progress');
              setTimeout(() => navigate('/login'), 1500);
            }
          } else {
            setProcessingStatus('error');
            setStatusMessage('Failed to confirm email. Please try again.');
            localStorage.removeItem('login_in_progress');
            setTimeout(() => navigate('/login'), 3000);
          }
        } else {
          // This is an OAuth callback (like Google)
          console.log("AuthCallback: Handling OAuth callback");
          setStatusMessage('Completing sign-in process...');
          
          // First check if we already have a valid session
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error("AuthCallback: Session error in callback:", error);
            setProcessingStatus('error');
            setStatusMessage('Authentication failed. Please try again.');
            localStorage.removeItem('login_in_progress');
            setTimeout(() => navigate('/login'), 2000);
            return;
          }
          
          if (!session) {
            console.log("AuthCallback: No session found in OAuth callback");
            setProcessingStatus('error');
            setStatusMessage('Authentication failed. Please try again.');
            localStorage.removeItem('login_in_progress');
            setTimeout(() => navigate('/login'), 2000);
            return;
          }
          
          console.log("AuthCallback: Session found, proceeding with handleCallback");
          
          // Process the OAuth callback
          await handleCallback();
          
          // Clear login processing flag before redirecting
          localStorage.removeItem('login_in_progress');
          
          // At this point, handleCallback has already navigated to the appropriate page
          // But we'll set a success state just in case
          setProcessingStatus('success');
          setStatusMessage('Authentication successful! Redirecting...');
        }
      } catch (error) {
        console.error("AuthCallback: Error in auth callback:", error);
        setProcessingStatus('error');
        setStatusMessage('An error occurred during authentication. Please try again.');
        
        // Show error toast
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "Failed to complete authentication. Please try again."
        });
        
        // Clear the login flag and redirect to login
        localStorage.removeItem('login_in_progress');
        setTimeout(() => navigate('/login'), 3000);
      }
    };
    
    processCallback();
  }, [searchParams, navigate, handleEmailConfirmation, handleCallback, toast]);

  // If this is a Google OAuth flow, use the specialized handler
  if (isOAuthFlow) {
    return <GoogleAuthHandler />;
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="text-center max-w-md w-full p-6 space-y-4">
        <LoadingSpinner size="lg" />
        
        <h2 className={`mt-4 text-xl ${
          processingStatus === 'success' ? 'text-green-400' : 
          processingStatus === 'error' ? 'text-red-400' : 
          'text-white'
        }`}>
          {statusMessage}
        </h2>
        
        {processingStatus === 'error' && (
          <p className="text-gray-300 text-sm">
            You'll be redirected to the login page shortly.
          </p>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
