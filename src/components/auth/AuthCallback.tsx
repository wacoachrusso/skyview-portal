import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { handleGoogleSignIn, handleEmailSignIn, handlePasswordRecovery, handleEmailChange } from "@/utils/authCallbackHandlers";
import { EmailConfirmationHandler } from "./handlers/EmailConfirmationHandler";

export const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const handleSession = async () => {
    // Add any additional session handling logic here
    console.log('Handling session in AuthCallback');
  };

  useEffect(() => {
    const processCallback = async () => {
      console.log('Processing auth callback');
      const provider = searchParams.get("provider");
      const token = searchParams.get("token");
      const type = searchParams.get("type");

      try {
        switch (true) {
          case provider === "google":
            await handleGoogleSignIn({ navigate, toast, handleSession });
            break;

          case type === "recovery":
            if (handlePasswordRecovery(token, navigate)) return;
            break;

          case type === "email_change":
            if (await handleEmailChange(searchParams, navigate, EmailConfirmationHandler)) return;
            break;

          default:
            await handleEmailSignIn({ navigate, toast, handleSession });
        }
      } catch (error) {
        console.error('Error in auth callback:', error);
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "An error occurred during authentication. Please try again."
        });
        navigate('/login');
      }
    };

    processCallback();
  }, [navigate, searchParams, toast]);

  return (
    <div className="min-h-screen bg-hero-gradient flex items-center justify-center">
      <div className="bg-white/5 backdrop-blur-lg p-8 rounded-lg shadow-xl border border-white/10">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-8 bg-brand-gold/20 rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-brand-gold/20 rounded"></div>
        </div>
      </div>
    </div>
  );
};