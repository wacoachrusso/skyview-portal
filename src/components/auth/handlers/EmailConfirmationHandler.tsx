import { useEmailConfirmation } from "@/hooks/useEmailConfirmation";
import { redirectToProduction } from "@/utils/redirectUtils";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

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
      console.error('Missing email or token hash');
      toast({
        variant: "destructive",
        title: "Invalid Confirmation Link",
        description: "The confirmation link is invalid or has expired."
      });
      navigate('/login');
      return;
    }

    try {
      const result = await handleEmailConfirmation(email, tokenHash);
      
      if (result.success) {
        toast({
          title: "Email Confirmed",
          description: "Your email has been confirmed successfully."
        });
      } else {
        toast({
          variant: "destructive",
          title: "Confirmation Failed",
          description: result.error || "Failed to confirm email. Please try again."
        });
      }
    } catch (error) {
      console.error('Error confirming email:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred. Please try again."
      });
    }

    // Check if we need to redirect to production
    if (redirectToProduction()) return;
    
    navigate('/login');
  };

  return { processEmailConfirmation };
};