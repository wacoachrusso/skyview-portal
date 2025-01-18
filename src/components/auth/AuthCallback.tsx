import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { GoogleAuthHandler } from "./handlers/GoogleAuthHandler";
import { useSessionManagement } from "@/hooks/useSessionManagement";

interface PendingSignup {
  email: string;
  password: string;
  full_name: string;
  job_title: string;
  airline: string;
  plan: string;
  stripe_session_id: string;
}

export const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { createNewSession } = useSessionManagement();
  const provider = searchParams.get("provider");
  const sessionId = searchParams.get("session_id"); // Stripe checkout session ID

  if (provider === "google") {
    return <GoogleAuthHandler />;
  }

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log("Handling auth callback...");
        
        // If coming from Stripe checkout, handle the payment success flow
        if (sessionId) {
          console.log("Processing successful Stripe payment with session ID:", sessionId);
          const { data: pendingSignup, error: pendingSignupError } = await supabase
            .from('pending_signups')
            .select('*')
            .eq('stripe_session_id', sessionId)
            .single();

          if (pendingSignupError) {
            console.error("Error fetching pending signup:", pendingSignupError);
            throw new Error("Failed to fetch pending signup data");
          }

          if (!pendingSignup) {
            console.error("No pending signup found for session:", sessionId);
            throw new Error("No pending signup found for this session");
          }

          console.log("Found pending signup:", pendingSignup);
          const signupData = pendingSignup as PendingSignup;

          // Sign up the user with their stored details
          console.log("Attempting to create user account for:", signupData.email);
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: signupData.email,
            password: signupData.password,
            options: {
              data: {
                full_name: signupData.full_name,
                user_type: signupData.job_title,
                airline: signupData.airline,
                subscription_plan: signupData.plan
              }
            }
          });

          if (signUpError) {
            console.error("Error signing up user:", signUpError);
            throw signUpError;
          }

          console.log("User account created successfully, attempting immediate sign in");

          // Sign in the user immediately after signup
          const { data: { session }, error: signInError } = await supabase.auth.signInWithPassword({
            email: signupData.email,
            password: signupData.password
          });

          if (signInError || !session) {
            console.error("Error signing in user:", signInError);
            throw new Error("Failed to sign in after payment");
          }

          console.log("User signed in successfully:", session.user.id);

          // Create a new session and invalidate others
          console.log("Creating new session and invalidating others...");
          const newSession = await createNewSession(session.user.id);
          
          if (!newSession) {
            throw new Error("Failed to create new session");
          }

          // Delete the pending signup
          const { error: deleteError } = await supabase
            .from('pending_signups')
            .delete()
            .eq('stripe_session_id', sessionId);

          if (deleteError) {
            console.error("Error deleting pending signup:", deleteError);
            // Don't throw here, as the user is already signed in
          }

          toast({
            title: "Welcome to SkyGuide!",
            description: "Your account has been created and you've been successfully signed in."
          });
          navigate('/dashboard');
          return;
        }

        // Handle regular auth callback flow
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          console.error("Session error:", sessionError);
          throw new Error("Invalid session");
        }

        // Create a new session and invalidate others
        console.log("Creating new session and invalidating others...");
        const newSession = await createNewSession(session.user.id);
        
        if (!newSession) {
          throw new Error("Failed to create new session");
        }

        // Check if user exists in profiles
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', session.user.email)
          .single();

        if (profileError || !profile) {
          console.log('No profile found, redirecting to signup');
          await supabase.auth.signOut();
          toast({
            title: "Welcome to SkyGuide!",
            description: "Please select a subscription plan to get started."
          });
          navigate('/?scrollTo=pricing-section');
          return;
        }

        // Check if profile has subscription
        if (!profile.subscription_plan || profile.subscription_plan === 'free') {
          console.log('No subscription plan, redirecting to pricing');
          await supabase.auth.signOut();
          toast({
            title: "Welcome Back!",
            description: "Please select a subscription plan to continue."
          });
          navigate('/?scrollTo=pricing-section');
          return;
        }

        // All good, redirect to dashboard
        toast({
          title: "Welcome back!",
          description: "You've been successfully signed in. Any other active sessions have been ended."
        });
        navigate('/dashboard');

      } catch (error) {
        console.error("Error in auth callback:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "An unexpected error occurred. Please try again."
        });
        navigate('/login');
      }
    };

    handleAuthCallback();
  }, [navigate, toast, createNewSession]);

  return null;
};