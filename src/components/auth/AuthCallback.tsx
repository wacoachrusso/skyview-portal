import { useSearchParams, useNavigate } from "react-router-dom";
import { useSessionHandler } from "@/hooks/useSessionHandler";
import { useToast } from "@/hooks/use-toast";
import { EmailConfirmationHandler } from './handlers/EmailConfirmationHandler';

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
        // For password reset, we'll pass the tokens directly in the URL
        const token = searchParams.get('token');
        if (token) {
          navigate(`/reset-password?token=${token}`);
          return;
        }
      }

      if (type === 'email_change') {
        const { processEmailConfirmation } = EmailConfirmationHandler({ searchParams });
        const success = await processEmailConfirmation();
        if (success) {
          navigate('/settings');
          return;
        }
        navigate('/login');
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