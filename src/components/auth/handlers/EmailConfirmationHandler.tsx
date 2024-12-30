import { useNavigate } from 'react-router-dom';
import { useEmailConfirmation } from "@/hooks/useEmailConfirmation";
import { redirectToProduction } from "@/utils/redirectUtils";
import { useToast } from "@/hooks/use-toast";

interface EmailConfirmationHandlerProps {
  email: string | null;
  tokenHash: string | null;
}

export const EmailConfirmationHandler = ({ email, tokenHash }: EmailConfirmationHandlerProps) => {
  const navigate = useNavigate();
  const { handleEmailConfirmation } = useEmailConfirmation();
  const { toast } = useToast();

  const processEmailConfirmation = async () => {
    console.log('Processing email confirmation:', { email, tokenHash });
    
    if (!email || !tokenHash) {
      console.error('Missing email or token_hash for confirmation');
      toast({
        variant: "destructive",
        title: "Invalid confirmation link",
        description: "The confirmation link is invalid or has expired."
      });
      navigate('/login');
      return false;
    }

    const confirmed = await handleEmailConfirmation(email, tokenHash);
    if (confirmed) {
      redirectToProduction();
      return true;
    }
    return false;
  };

  return { processEmailConfirmation };
};