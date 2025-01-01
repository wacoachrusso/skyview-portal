import { useSearchParams, useNavigate } from "react-router-dom";
import { useSessionHandler } from "@/hooks/useSessionHandler";
import { useToast } from "@/hooks/use-toast";
import { EmailConfirmationHandler } from './handlers/EmailConfirmationHandler';
import { supabase } from "@/integrations/supabase/client";
import { 
  handleGoogleSignIn, 
  handleEmailSignIn, 
  handlePasswordRecovery,
  handleEmailChange 
} from "@/utils/authCallbackHandlers";

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

      const handlerProps = { navigate, toast, handleSession };

      switch (type) {
        case 'google':
          await handleGoogleSignIn(handlerProps);
          break;

        case 'signup':
        case 'magiclink':
          await handleEmailSignIn(handlerProps);
          break;

        case 'recovery':
          const token = searchParams.get('token');
          handlePasswordRecovery(token, navigate);
          break;

        case 'email_change':
          await handleEmailChange(searchParams, navigate, EmailConfirmationHandler);
          break;

        default:
          console.error('Unhandled callback type:', type);
          navigate('/login');
      }
    } catch (error) {
      console.error('Error in auth callback:', error);
      await supabase.auth.signOut();
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred during authentication."
      });
      navigate('/login');
    }
  };

  processCallback();

  return null;
};