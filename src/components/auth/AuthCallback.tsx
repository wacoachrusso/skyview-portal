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
      // Also set the recently_signed_up flag to prevent pricing redirects
      sessionStorage.setItem('recently_signed_up', 'true');
      
      try {
        // Check if this is a Stripe callback with session_id parameter
        const sessionId = searchParams.get('session_id');
        if (sessionId) {
          console.log("AuthCallback: Stripe payment callback detected with session ID:", sessionId);
          setStatusMessage('Completing your payment...');
          
          // Set a direct redirect flag to ensure we land on chat after payment
          localStorage.setItem('direct_payment_redirect', 'true');
          
          // Import and use the Stripe callback handler
          const { handleStripeCallback } = await import('@/utils/auth/stripeCallbackHandler');
          await handleStripeCallback(sessionId, navigate);
          
          // After payment, send a thank you email via Resend
          try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
              await supabase.functions.invoke('send-payment-confirmation', {
                body: { 
                  email: session.user.email,
                  userId: session.user.id
                }
              });
              console.log("Payment confirmation email sent");
            }
          } catch (emailError) {
            console.error("Failed to send payment confirmation email:", emailError);
          }
          
          return; // Let the Stripe handler take over the flow
        }
        
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
          
          // We'll automatically confirm the email without waiting for verification
          // Just set success and redirect to chat
          setProcessingStatus('success');
          setStatusMessage('Account setup successful! Redirecting...');
          
          // For post-payment flow or regular flow - redirect to chat
          setTimeout(() => {
            localStorage.removeItem('login_in_progress');
            navigate('/chat', { replace: true });
          }, 1500);
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
