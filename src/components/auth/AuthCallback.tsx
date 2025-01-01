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
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log('No user found in session');
        navigate('/login');
        return;
      }

      // Get all active sessions for the user
      const { data: { sessions }, error: sessionsError } = await supabase.auth.getAllSessions();
      
      if (sessionsError) {
        console.error('Error fetching sessions:', sessionsError);
        throw sessionsError;
      }

      console.log('Active sessions found:', sessions?.length);

      // If there are multiple sessions, terminate all but the current one
      if (sessions && sessions.length > 1) {
        console.log('Multiple sessions detected, cleaning up...');
        const currentSession = await supabase.auth.getSession();
        const currentSessionId = currentSession.data.session?.id;

        // Sign out from all other sessions
        for (const session of sessions) {
          if (session.id !== currentSessionId) {
            await supabase.auth.admin.signOut(session.id);
            console.log('Terminated session:', session.id);
          }
        }
      }

      // Check if profile exists and is complete
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

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
    } catch (error) {
      console.error('Error in handleSession:', error);
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