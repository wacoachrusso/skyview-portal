import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const AuthCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

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
        
        console.log('Callback params:', { email, type, token_hash });

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

          // Get user profile to confirm database entry
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', email)
            .single();

          if (profile) {
            console.log('User profile found:', profile);
            // Update profile if needed
            const { error: updateError } = await supabase
              .from('profiles')
              .update({ email_verified: true })
              .eq('email', email);

            if (updateError) {
              console.error('Error updating profile:', updateError);
            }
          }

          console.log('Email confirmed successfully');
          toast({
            title: "Email Confirmed",
            description: "Your email has been confirmed successfully. You can now log in to your account.",
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