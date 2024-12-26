import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const AuthCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const showWelcomeTutorial = (userName: string) => {
    // Initial welcome
    toast({
      title: `Welcome to SkyGuide, ${userName}! 👋`,
      description: "We're excited to have you here!",
      duration: 5000,
    });

    // Delayed tutorial messages
    setTimeout(() => {
      toast({
        title: "Quick Tip #1",
        description: "Use the search bar to quickly find contract information.",
        duration: 5000,
      });
    }, 6000);

    setTimeout(() => {
      toast({
        title: "Quick Tip #2",
        description: "Click on 'Chat' to start a conversation with our AI assistant.",
        duration: 5000,
      });
    }, 12000);

    setTimeout(() => {
      toast({
        title: "Quick Tip #3",
        description: "Need help? Look for the '?' icon in the top right corner.",
        duration: 5000,
      });
    }, 18000);
  };

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('=== Auth Callback Started ===');
        console.log('Current URL:', window.location.href);
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('=== Auth Callback Error ===');
          console.error('Error details:', error);
          toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "There was an error signing in. Please try again."
          });
          navigate('/login');
          return;
        }

        if (session) {
          console.log('=== Session Established ===');
          console.log('User ID:', session.user.id);
          console.log('Provider:', session.user.app_metadata.provider);
          
          // Check if profile exists and is complete
          const { data: profile } = await supabase
            .from('profiles')
            .select('user_type, airline, full_name')
            .eq('id', session.user.id)
            .single();

          console.log('Profile data:', profile);

          // For Google auth, update profile with Google user data if needed
          if (session.user.app_metadata.provider === 'google') {
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

          // Get the user's name for the welcome message
          const userName = profile?.full_name || session.user.user_metadata.full_name || 'there';

          // Redirect based on profile completion
          if (profile?.user_type && profile?.airline) {
            console.log('Profile complete, redirecting to dashboard');
            showWelcomeTutorial(userName.split(' ')[0]); // Use first name only
            navigate('/dashboard');
          } else {
            console.log('Profile incomplete, redirecting to complete-profile');
            navigate('/complete-profile');
          }
        } else {
          console.log('No session found, redirecting to login');
          navigate('/login');
        }
      } catch (error) {
        console.error('=== Unexpected Error in Auth Callback ===');
        console.error('Error details:', error);
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