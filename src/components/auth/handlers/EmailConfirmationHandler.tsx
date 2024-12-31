import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface EmailConfirmationHandlerProps {
  searchParams: URLSearchParams;
}

export const EmailConfirmationHandler = ({ searchParams }: EmailConfirmationHandlerProps) => {
  const { toast } = useToast();

  const processEmailConfirmation = async () => {
    try {
      const email = searchParams.get('email');
      const tokenHash = searchParams.get('token_hash');

      if (!email || !tokenHash) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Invalid email confirmation link."
        });
        return false;
      }

      const { error } = await supabase.auth.verifyOtp({
        email,
        token: tokenHash,
        type: 'email_change'
      });

      if (error) {
        console.error('Error confirming email:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to confirm email change. Please try again."
        });
        return false;
      }

      toast({
        title: "Success",
        description: "Email change confirmed successfully."
      });
      return true;

    } catch (error) {
      console.error('Error in email confirmation:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred."
      });
      return false;
    }
  };

  return { processEmailConfirmation };
};