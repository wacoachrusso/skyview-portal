import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { redirectToProduction } from "@/utils/redirectUtils";

export const useSessionHandler = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSession = async () => {
    try {
      // Clear any existing session first
      await supabase.auth.signOut({ scope: 'local' });
      console.log('Cleared existing session');

      // Get the current session
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Auth error:', error);
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "There was an error signing in. Please try again."
        });
        redirectToProduction();
        return;
      }

      if (!session) {
        console.log('No session found, redirecting to login');
        redirectToProduction();
        return;
      }

      console.log('Session found:', session.user.id);
      
      // Check if profile exists and is complete
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      console.log('Profile data:', profile);

      if (profile) {
        toast({
          title: "Welcome back!",
          description: "You have successfully signed in.",
        });
        navigate('/dashboard', { replace: true });
      } else {
        navigate('/complete-profile', { replace: true });
      }

    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "An unexpected error occurred. Please try again."
      });
      redirectToProduction();
    }
  };

  return { handleSession };
};