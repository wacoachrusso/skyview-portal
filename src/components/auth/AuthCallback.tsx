import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { handleGoogleSignIn, handleEmailSignIn, handlePasswordRecovery, handleEmailChange } from "@/utils/authCallbackHandlers";
import { EmailConfirmationHandler } from "./handlers/EmailConfirmationHandler";
import { supabase } from "@/integrations/supabase/client";

export const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const handleSession = async () => {
    try {
      console.log('Handling session in AuthCallback');
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        navigate('/login');
        return;
      }

      if (!session) {
        console.log('No active session found');
        navigate('/login');
        return;
      }

      console.log('Session found, checking profile');
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        await supabase.auth.signOut();
        navigate('/login');
        return;
      }

      if (!profile) {
        console.log('No profile found, redirecting to signup');
        await supabase.auth.signOut();
        toast({
          variant: "destructive",
          title: "Account Required",
          description: "Please sign up for an account first."
        });
        navigate('/signup');
        return;
      }

      if (profile.account_status !== 'active') {
        console.log('Account not active');
        await supabase.auth.signOut();
        toast({
          variant: "destructive",
          title: "Account Not Active",
          description: "Your account is not active. Please contact support."
        });
        navigate('/login');
        return;
      }

      console.log('Profile found and active, proceeding to dashboard');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error in handleSession:', error);
      await supabase.auth.signOut();
      navigate('/login');
    }
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
        await supabase.auth.signOut();
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