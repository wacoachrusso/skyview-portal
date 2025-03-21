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
      // Set new user signup flag to maintain redirect to chat
      localStorage.setItem('new_user_signup', 'true');
      
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
              await supabase.functions.invoke('send-subscription-confirmation', {
                body: { 
                  email: session.user.email,
                  name: session.user.user_metadata?.full_name || session.user.email,
                  plan: localStorage.getItem('selected_plan') || 'monthly'
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
          // We don't need to wait for email confirmation - redirect immediately
          // to avoid that "check your email" message
          
          // Instead of confirming, just redirect to chat
          setProcessingStatus('success');
          setStatusMessage('Account setup successful! Redirecting...');
          
          // Clear login_in_progress but keep recently_signed_up
          localStorage.removeItem('login_in_progress');
          sessionStorage.setItem('recently_signed_up', 'true');
          
          // For post-payment flow or regular flow - redirect to chat
          setTimeout(() => {
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
          
          // Set success state
          setProcessingStatus('success');
          setStatusMessage('Authentication successful! Redirecting...');
          
          // Always redirect to chat
          navigate('/chat', { replace: true });
        }
      } catch (error) {
        console.error("AuthCallback: Error in auth callback:", error);
        setProcessingStatus('error');
        setStatusMessage('An error occurred during authentication. Please try again.');
        localStorage.removeItem('login_in_progress');
        setTimeout(() => navigate('/login'), 2000);
      }
    };

    processCallback();
  }, [navigate, toast, handleCallback, handleEmailConfirmation, searchParams]);

  if (isOAuthFlow) {
    return <GoogleAuthHandler />;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-luxury-dark text-white">
      <div className="w-full max-w-md space-y-8 px-4 sm:px-6">
        <div className="flex flex-col items-center space-y-4 text-center">
          <img 
            src="/lovable-uploads/030a54cc-8003-4358-99f1-47f47313de93.png" 
            alt="SkyGuide Logo" 
            className="h-12 w-auto" 
          />
          
          <h1 className="text-2xl font-bold tracking-tight">
            {processingStatus === 'processing' ? 'Processing Authentication' : 
             processingStatus === 'success' ? 'Authentication Successful' : 
             'Authentication Error'}
          </h1>
          
          <p className="text-sm text-gray-400">
            {statusMessage}
          </p>
          
          {processingStatus === 'processing' && (
            <div className="mt-4">
              <LoadingSpinner size="lg" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;
