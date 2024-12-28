import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useEmailConfirmation } from "@/hooks/useEmailConfirmation";
import { useSessionHandler } from "@/hooks/useSessionHandler";
import { redirectToProduction } from "@/utils/redirectUtils";

export const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const { handleEmailConfirmation } = useEmailConfirmation();
  const { handleSession } = useSessionHandler();

  useEffect(() => {
    const processCallback = async () => {
      try {
        console.log('=== Auth Callback Started ===');
        
        // Check if this is an email confirmation
        const email = searchParams.get('email');
        const token_hash = searchParams.get('token_hash');
        const type = searchParams.get('type');
        
        console.log('Callback params:', { email, type, token_hash });

        if (type === 'signup' && email && token_hash) {
          const confirmed = await handleEmailConfirmation(email, token_hash);
          if (confirmed) {
            redirectToProduction();
            return;
          }
        }

        // Handle regular auth callback
        await handleSession();

      } catch (error) {
        console.error('Unexpected error in auth callback:', error);
        redirectToProduction();
      }
    };

    processCallback();
  }, [searchParams, handleEmailConfirmation, handleSession]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-foreground">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-current mx-auto"></div>
        <p className="mt-4">Processing authentication...</p>
      </div>
    </div>
  );
};