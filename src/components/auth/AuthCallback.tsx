import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useSessionHandler } from "@/hooks/useSessionHandler";
import { useToast } from "@/hooks/use-toast";
import { EmailConfirmationHandler } from './handlers/EmailConfirmationHandler';
import { usePasswordResetHandler } from './handlers/PasswordResetHandler';

export const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleSession } = useSessionHandler();
  const { toast } = useToast();

  useEffect(() => {
    const processCallback = async () => {
      try {
        console.log('=== Auth Callback Started ===');
        const type = searchParams.get('type');
        console.log('Auth callback type:', type);

        if (type === 'signup') {
          const email = searchParams.get('email');
          const token_hash = searchParams.get('token_hash');
          const { processEmailConfirmation } = EmailConfirmationHandler({ 
            email, 
            tokenHash: token_hash 
          });
          const confirmed = await processEmailConfirmation();
          if (confirmed) return;
        }

        if (type === 'recovery') {
          const access_token = searchParams.get('access_token');
          const refresh_token = searchParams.get('refresh_token');
          const { processPasswordReset } = usePasswordResetHandler(
            access_token, 
            refresh_token
          );
          const processed = await processPasswordReset();
          if (processed) return;
        }

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
  }, [searchParams, handleSession, toast, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-foreground">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-current mx-auto"></div>
        <p className="mt-4">Processing authentication...</p>
      </div>
    </div>
  );
};