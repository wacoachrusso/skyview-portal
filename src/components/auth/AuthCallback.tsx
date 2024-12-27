import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const AuthCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const showWelcomeTutorial = (userName: string) => {
    toast({
      title: `Welcome back to SkyGuide, ${userName}! 👋`,
      description: "We're glad to see you again!",
      duration: 5000,
    });
  };

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('=== Auth Callback Started ===');
        
        // Clear any existing session first
        await supabase.auth.signOut();
        
        // Get the current session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth error:', error);
          toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "There was an error signing in. Please try again."
          });
          navigate('/login');
          return;
        }

        // If no session is found, the sign-in was cancelled or failed
        if (!session || !session.user) {
          console.log('No valid session found, redirecting to login');
          toast({
            variant: "default",
            title: "Sign in cancelled",
            description: "The sign in process was cancelled or failed."
          });
          navigate('/login');
          return;
        }

        // Check if this is a valid Google auth session
        if (session.user.app_metadata.provider !== 'google') {
          console.log('Invalid auth provider');
          toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "Invalid authentication provider."
          });
          await supabase.auth.signOut();
          navigate('/login');
          return;
        }

        console.log('Session found, checking profile');
        
        // Check if profile exists and is complete
        const { data: profile } = await supabase
          .from('profiles')
          .select('user_type, airline, full_name')
          .eq('id', session.user.id)
          .single();

        console.log('Profile data:', profile);

        // Get the user's name for the welcome message
        const userName = profile?.full_name || session.user.user_metadata.full_name || 'there';

        // For Google auth, update profile with Google user data if needed
        if (!profile?.full_name) {
          const { error: profileUpdateError } = await supabase
            .from('profiles')
            .update({
              full_name: session.user.user_metadata.full_name
            })
            .eq('id', session.user.id);

          if (profileUpdateError) {
            console.error('Error updating profile:', profileUpdateError);
          }
        }

        // If profile is complete, redirect to dashboard immediately
        if (profile?.user_type && profile?.airline) {
          console.log('Profile complete, redirecting to dashboard');
          showWelcomeTutorial(userName.split(' ')[0]); // Use first name only
          navigate('/dashboard', { replace: true }); // Use replace to prevent back navigation
        } else {
          console.log('Profile incomplete, redirecting to complete-profile');
          navigate('/complete-profile', { replace: true });
        }
      } catch (error) {
        console.error('Unexpected error:', error);
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "An unexpected error occurred. Please try again."
        });
        navigate('/login');
      }
    };

    handleAuthCallback();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-foreground">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-current mx-auto"></div>
        <p className="mt-4">Completing sign in...</p>
      </div>
    </div>
  );
};