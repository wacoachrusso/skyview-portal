import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const AuthCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  const showWelcomeTutorial = (userName: string) => {
    toast({
      title: `Welcome to SkyGuide, ${userName}! 👋`,
      description: "We're glad to see you again!",
      duration: 5000,
    });
  };

  const redirectToProduction = () => {
    // Check if it's an Android device
    const isAndroid = /Android/i.test(navigator.userAgent);
    if (isAndroid) {
      // Show app install prompt for Android users
      if (window.confirm('Would you like to install the SkyGuide app?')) {
        window.location.href = 'https://play.google.com/store/apps/details?id=com.skyguide.app';
        return;
      }
    }
    // Redirect to production URL
    window.location.href = 'https://www.skyguide.site';
  };

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('=== Auth Callback Started ===');
        
        // Check if this is an email confirmation
        const email = searchParams.get('email');
        const token_hash = searchParams.get('token_hash');
        const type = searchParams.get('type');
        
        console.log('Callback params:', { email, type });

        if (type === 'signup' && email && token_hash) {
          console.log('Processing email confirmation');
          const { error } = await supabase.auth.verifyOtp({
            email,
            token: token_hash,
            type: 'signup'
          });

          if (error) {
            console.error('Email confirmation error:', error);
            toast({
              variant: "destructive",
              title: "Confirmation Failed",
              description: "There was an error confirming your email. Please try again."
            });
            redirectToProduction();
            return;
          }

          console.log('Email confirmed successfully');
          toast({
            title: "Email Confirmed",
            description: "Your email has been confirmed successfully. You can now log in.",
          });
          redirectToProduction();
          return;
        }

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
        console.log('Checking profile');
        
        // Check if profile exists and is complete
        const { data: profile } = await supabase
          .from('profiles')
          .select('user_type, airline, full_name, subscription_plan')
          .eq('id', session.user.id)
          .single();

        console.log('Profile data:', profile);

        // Get the user's name for the welcome message
        const userName = profile?.full_name || session.user.user_metadata.full_name || 'there';

        // Send welcome email
        try {
          console.log('Sending welcome email...');
          const { error: welcomeEmailError } = await supabase.functions.invoke('send-welcome-email', {
            body: { 
              email: session.user.email,
              name: userName,
              plan: profile?.subscription_plan || 'free'
            }
          });

          if (welcomeEmailError) {
            console.error('Error sending welcome email:', welcomeEmailError);
          } else {
            console.log('Welcome email sent successfully');
          }
        } catch (emailError) {
          console.error('Failed to send welcome email:', emailError);
        }

        // For Google auth, update profile with Google user data if needed
        if (session.user.app_metadata.provider === 'google' && !profile?.full_name) {
          console.log('Updating profile with Google data');
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
        redirectToProduction();
      }
    };

    handleAuthCallback();
  }, [navigate, toast, searchParams]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-foreground">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-current mx-auto"></div>
        <p className="mt-4">Processing authentication...</p>
      </div>
    </div>
  );
};
