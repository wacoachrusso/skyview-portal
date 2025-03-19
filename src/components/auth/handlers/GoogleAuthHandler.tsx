
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const GoogleAuthHandler = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const handleAuthCallback = async () => {
      console.log('Handling Google auth callback');
      try {
        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('Session error:', sessionError);
          toast({
            variant: "destructive",
            title: "Authentication Failed",
            description: sessionError.message || "Failed to authenticate with Google.",
            duration:30000
          });
          navigate('/login');
          return;
        }

        if (!session?.user) {
          console.log('No session found');
          navigate('/login');
          return;
        }

        console.log('Session found for user:', session.user.email);
        console.log('User ID:', session.user.id);

        // Extract user data from the session
        const { email, user_metadata } = session.user;
        const fullName = user_metadata?.full_name || user_metadata?.name || "";

        // Check if the user has a profile in the profiles table
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('user_type, airline')
          .eq('id', session.user.id)
          .maybeSingle();

        // Handle profile fetch errors (excluding "No rows found" error)
        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Profile error:', profileError);
          toast({
            variant: "destructive",
            title: "Profile Error",
            description: `Failed to fetch user profile: ${profileError.message}`,
            duration:30000
          });
          navigate('/login');
          return;
        }

        // Debug: Log the profile data
        console.log("Profile data:", profile);

        // If profile exists and is complete, redirect to chat
        if (profile?.user_type && profile?.airline) {
          console.log('Profile is complete, redirecting to chat');
          navigate('/chat', { replace: true });
          return;
        }

        // If profile does not exist or is incomplete, redirect to signup
        console.log('Profile is incomplete, redirecting to signup');
        toast({
          title: "Welcome!",
          description: "Please complete your profile to get started."
        });
        navigate('/signup', {
          state: { userId: session.user.id, email, fullName, isGoogleSignIn: true }, // Pass user data and Google sign-in flag
        });
        
      } catch (error) {
        console.error('Unexpected error in auth callback:', error);
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: error.message || "An unexpected error occurred. Please try again.",
          duration:30000
        });
        navigate('/login');
      } finally {
        setIsProcessing(false);
      }
    };

    handleAuthCallback();
  }, [navigate, toast]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-luxury-dark">
      <div className="relative">
        {/* Loading indicator with glow */}
        <div className="absolute -inset-4 bg-gradient-to-r from-brand-purple/30 to-brand-gold/30 rounded-full blur-xl opacity-50 animate-pulse-subtle" />
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent relative" />
      </div>
    </div>
  );
};
