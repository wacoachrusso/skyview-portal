import { useNavigate } from 'react-router-dom';
import { useEmailConfirmation } from "@/hooks/useEmailConfirmation";
import { redirectToProduction } from "@/utils/redirectUtils";
import { useToast } from "@/hooks/use-toast";
import { URLSearchParams } from 'url';

interface EmailConfirmationHandlerProps {
  searchParams: URLSearchParams;
}

export const EmailConfirmationHandler = ({ searchParams }: EmailConfirmationHandlerProps) => {
  const navigate = useNavigate();
  const { handleEmailConfirmation } = useEmailConfirmation();
  const { toast } = useToast();

  const processEmailConfirmation = async () => {
    const email = searchParams.get('email');
    const tokenHash = searchParams.get('token_hash');
    
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