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

      // Handle Google sign-in
      if (type === 'google') {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session?.user) {
          console.error('No valid session found after Google sign-in:', sessionError);
          await supabase.auth.signOut();
          navigate('/?scrollTo=pricing-section');
          return;
        }

        // Check if user has a profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profileError || !profile) {
          console.log('No profile found for Google user, signing out and redirecting to pricing');
          await supabase.auth.signOut({ scope: 'global' });
          toast({
            title: "Account Required",
            description: "Please sign up for an account before signing in with Google.",
            variant: "destructive",
          });
          navigate('/?scrollTo=pricing-section');
          return;
        }

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
      // Make sure to sign out if there's any error
      await supabase.auth.signOut({ scope: 'global' });
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred during authentication."
      });
      navigate('/?scrollTo=pricing-section');
    }
  };

  processCallback();

  return null;
};