import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { createNewSession } from "@/services/sessionService";

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
            duration: 5000
          });
          navigate('/login', { replace: true });
          return;
        }

        if (!session?.user) {
          console.log('No session found');
          navigate('/login', { replace: true });
          return;
        }

        console.log('Session found for user:', session.user.email);
        
        // Create a new session and save token to localStorage
        try {
          await createNewSession(session.user.id);
        } catch (error) {
          console.error('Error creating session:', error);
          toast({
            variant: "destructive",
            title: "Session Error",
            description: "Failed to create user session.",
            duration: 5000
          });
          navigate('/login', { replace: true });
          return;
        }
        
        // Extract user data from the session
        const { email, user_metadata } = session.user;
        const fullName = user_metadata?.full_name || user_metadata?.name || "";

        // Check if the user has a profile in the profiles table
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Profile error:', profileError);
          toast({
            variant: "destructive",
            title: "Profile Error",
            description: `Failed to fetch user profile: ${profileError.message}`,
            duration: 5000
          });
          navigate('/login', { replace: true });
          return;
        }
        
        // If profile does not exist, create it
        if (!profile) {
          console.log('Profile does not exist, creating profile');
          const { error: createError } = await supabase
            .from('profiles')
            .insert({
              id: session.user.id,
              email: email,
              full_name: fullName,
              subscription_plan: 'free',
              email_notifications: true,
              push_notifications: true,
              account_status: 'active'
            });

          if (createError) {
            console.error('Error creating profile:', createError);
            toast({
              variant: "destructive",
              title: "Profile Creation Error",
              description: createError.message || "Failed to create your profile.",
              duration: 5000
            });
            navigate('/login', { replace: true });
            return;
          }
          
          toast({
            title: "Welcome!",
            description: "Please complete your profile to get started."
          });
          navigate('/signup', {
            state: { userId: session.user.id, email, fullName, isGoogleSignIn: true },
            replace: true
          });
          return;
        }

        // If profile exists but is incomplete, redirect to signup
        if (!profile.user_type || !profile.airline) {
          console.log('Profile is incomplete, redirecting to signup');
          toast({
            title: "Welcome!",
            description: "Please complete your profile to get started."
          });
          navigate('/signup', {
            state: { userId: session.user.id, email, fullName, isGoogleSignIn: true },
            replace: true
          });
          return;
        }

        // If profile is complete, redirect to chat
        console.log('Profile is complete, redirecting to chat');
        toast({
          title: "Welcome back!",
          description: "You've successfully signed in."
        });
        navigate('/chat', { replace: true });
        
      } catch (error) {
        console.error('Unexpected error in auth callback:', error);
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "An unexpected error occurred. Please try again.",
          duration: 5000
        });
        navigate('/login', { replace: true });
      } finally {
        setIsProcessing(false);
      }
    };

    handleAuthCallback();
  }, [navigate, toast]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-luxury-dark">
      <div className="relative">
        <div className="absolute -inset-4 bg-gradient-to-r from-brand-purple/30 to-brand-gold/30 rounded-full blur-xl opacity-50 animate-pulse-subtle" />
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent relative" />
      </div>
    </div>
  );
};
