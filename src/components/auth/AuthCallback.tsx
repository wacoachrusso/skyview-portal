import { useSearchParams, useNavigate } from "react-router-dom";
import { useSessionHandler } from "@/hooks/useSessionHandler";
import { useToast } from "@/hooks/use-toast";
import { EmailConfirmationHandler } from './handlers/EmailConfirmationHandler';
import { supabase } from "@/integrations/supabase/client";

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

      // Handle Google sign-in first since it's most common
      if (type === 'google') {
        console.log('Processing Google sign-in callback');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          await supabase.auth.signOut();
          navigate('/login');
          return;
        }

        if (!session?.user) {
          console.error('No valid session found after Google sign-in');
          navigate('/login');
          return;
        }

        // Check if user has a profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
        }

        // Even if there's no profile, we should still let them in since the auth was successful
        // The profile will be created by the database trigger
        console.log('Google sign-in successful, redirecting to dashboard');
        await handleSession();
        navigate('/dashboard');
        return;
      }

      if (type === 'signup' || type === 'magiclink') {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          await supabase.auth.signOut();
          navigate('/login');
          return;
        }

        if (!session) {
          console.error('No session found');
          navigate('/login');
          return;
        }

        await handleSession();
        navigate('/dashboard');
        return;
      }

      if (type === 'recovery') {
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