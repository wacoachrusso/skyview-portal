import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useEmailConfirmation } from "@/hooks/useEmailConfirmation";
import { useSessionHandler } from "@/hooks/useSessionHandler";
import { redirectToProduction } from "@/utils/redirectUtils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleEmailConfirmation } = useEmailConfirmation();
  const { handleSession } = useSessionHandler();
  const { toast } = useToast();

  useEffect(() => {
    const processCallback = async () => {
      try {
        console.log('=== Auth Callback Started ===');
        
        // Get the type of auth callback from URL
        const type = searchParams.get('type');
        console.log('Auth callback type:', type);

        // Handle email confirmation
        if (type === 'signup') {
          const email = searchParams.get('email');
          const token_hash = searchParams.get('token_hash');
          
          console.log('Processing signup confirmation:', { email, token_hash });

          if (email && token_hash) {
            const confirmed = await handleEmailConfirmation(email, token_hash);
            if (confirmed) {
              redirectToProduction();
              return;
            }
          }
        }

        // Handle password reset
        if (type === 'recovery') {
          console.log('Processing password reset callback');
          const access_token = searchParams.get('access_token');
          const refresh_token = searchParams.get('refresh_token');

          if (!access_token || !refresh_token) {
            console.error('Missing tokens for password reset');
            toast({
              variant: "destructive",
              title: "Invalid reset link",
              description: "The password reset link is invalid or has expired."
            });
            navigate('/login');
            return;
          }

          // Set the session with the recovery tokens
          const { error: sessionError } = await supabase.auth.setSession({
            access_token,
            refresh_token
          });

          if (sessionError) {
            console.error('Error setting recovery session:', sessionError);
            toast({
              variant: "destructive",
              title: "Reset link expired",
              description: "Please request a new password reset link."
            });
            navigate('/login');
            return;
          }

          // Redirect to password reset page
          console.log('Redirecting to reset password page');
          navigate('/reset-password');
          return;
        }

        // Handle regular auth callback
        await handleSession();

      } catch (error) {
        console.error('Unexpected error in auth callback:', error);
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "An unexpected error occurred. Please try again."
        });
        navigate('/login');
      }
    };

    processCallback();
  }, [searchParams, handleEmailConfirmation, handleSession, toast, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-foreground">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-current mx-auto"></div>
        <p className="mt-4">Processing authentication...</p>
      </div>
    </div>
  );
};