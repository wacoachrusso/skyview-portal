
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useEmailConfirmation } from '@/hooks/useEmailConfirmation';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { useAuthCallback } from '@/hooks/useAuthCallback';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { handleEmailConfirmation } = useEmailConfirmation();
  const { handleCallback } = useAuthCallback();
  const [processingStatus, setProcessingStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [statusMessage, setStatusMessage] = useState('Processing authentication...');
  
  useEffect(() => {
    const processCallback = async () => {
      console.log("Auth callback processing started");
      setProcessingStatus('processing');
      
      try {
        // Check if this is an email confirmation callback
        const email = searchParams.get('email');
        const token_hash = searchParams.get('token_hash');
        
        if (email && token_hash) {
          console.log("Handling email confirmation for:", email);
          setStatusMessage('Confirming your email address...');
          
          // Handle email confirmation
          const success = await handleEmailConfirmation(email, token_hash);
          
          if (success) {
            setProcessingStatus('success');
            setStatusMessage('Email confirmed successfully! Redirecting...');
            
            // Redirect to login page after successful confirmation
            setTimeout(() => navigate('/login'), 1500);
          } else {
            setProcessingStatus('error');
            setStatusMessage('Failed to confirm email. Please try again.');
            setTimeout(() => navigate('/login'), 3000);
          }
        } else {
          // This is an OAuth callback (like Google)
          console.log("Handling OAuth callback");
          setStatusMessage('Completing sign-in process...');
          
          // First check if we already have a valid session
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) {
            console.log("No session found in OAuth callback");
            setProcessingStatus('error');
            setStatusMessage('Authentication failed. Please try again.');
            setTimeout(() => navigate('/login'), 2000);
            return;
          }
          
          // Process the OAuth callback
          await handleCallback();
          
          // At this point, handleCallback has already navigated to the appropriate page
          // But we'll set a success state just in case
          setProcessingStatus('success');
          setStatusMessage('Authentication successful! Redirecting...');
        }
      } catch (error) {
        console.error("Error in auth callback:", error);
        setProcessingStatus('error');
        setStatusMessage('An error occurred during authentication. Please try again.');
        
        // Show error toast
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "Failed to complete authentication. Please try again."
        });
        
        // Redirect to login after a delay
        setTimeout(() => navigate('/login'), 3000);
      }
    };
    
    processCallback();
  }, [searchParams, navigate, handleEmailConfirmation, handleCallback, toast]);
  
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
