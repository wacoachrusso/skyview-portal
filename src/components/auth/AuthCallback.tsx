import { useSearchParams, useNavigate } from "react-router-dom";
import { useSessionHandler } from "@/hooks/useSessionHandler";
import { useToast } from "@/hooks/use-toast";
import { EmailConfirmationHandler } from './handlers/EmailConfirmationHandler';
import { usePasswordResetHandler } from './handlers/PasswordResetHandler';

export const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { handleSession } = useSessionHandler();

  const processCallback = async () => {
    try {
      const type = searchParams.get('type');
      console.log('Processing auth callback of type:', type);

      if (!type) {
        console.error('No callback type provided');
        toast({
          variant: "destructive",
          title: "Error",
          description: "Invalid authentication callback."
        });
        navigate('/login');
        return;
      }

      if (type === 'signup' || type === 'magiclink') {
        await handleSession();
        navigate('/dashboard');
        return;
      }

      if (type === 'recovery') {
        const access_token = searchParams.get('access_token');
        const refresh_token = searchParams.get('refresh_token');
        const { processPasswordReset } = usePasswordResetHandler(
          access_token, 
          refresh_token
        );
        const processed = await processPasswordReset();
        if (processed) {
          navigate('/reset-password#access_token=' + access_token + '&refresh_token=' + refresh_token);
          return;
        }
      }

      if (type === 'email_change') {
        const { processEmailConfirmation } = EmailConfirmationHandler({ searchParams });
        await processEmailConfirmation();
        navigate('/settings');
        return;
      }

      console.error('Unhandled callback type:', type);
      navigate('/login');
    } catch (error) {
      console.error('Error in auth callback:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred during authentication."
      });
      navigate('/login');
    }
  };

  processCallback();

  return null;
};