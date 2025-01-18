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
        console.log("Starting auth callback process...");
        
        // If coming from Stripe checkout, handle the payment success flow
        if (sessionId) {
          console.log("Processing Stripe payment callback with session ID:", sessionId);
          
          // First check if user already exists
          const { data: existingUser } = await supabase.auth.getUser();
          if (existingUser?.user) {
            console.log("User already exists and is logged in:", existingUser.user.email);
            navigate('/dashboard');
            return;
          }

          // Fetch pending signup data
          const { data: pendingSignup, error: pendingSignupError } = await supabase
            .from('pending_signups')
            .select('*')
            .eq('stripe_session_id', sessionId)
            .maybeSingle();

          if (pendingSignupError) {
            console.error("Error fetching pending signup:", pendingSignupError);
            throw new Error("Failed to fetch signup data. Please contact support.");
          }

          if (!pendingSignup) {
            console.error("No pending signup found for session:", sessionId);
            throw new Error("No signup data found. Please try again or contact support.");
          }

          console.log("Found pending signup for email:", pendingSignup.email);
          const signupData = pendingSignup as PendingSignup;

          // Create the user account
          console.log("Creating user account for:", signupData.email);
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
            console.error("Error creating user account:", signUpError);
            throw signUpError;
          }

          if (!signUpData?.user) {
            throw new Error("Failed to create user account");
          }

          console.log("User account created, proceeding with sign in");

          // Sign in the user immediately
          const { data: { session }, error: signInError } = await supabase.auth.signInWithPassword({
            email: signupData.email,
            password: signupData.password
          });

          if (signInError || !session) {
            console.error("Error signing in user:", signInError);
            throw new Error("Failed to sign in after account creation");
          }

          console.log("User signed in successfully:", session.user.id);

          // Create a new session and invalidate others
          console.log("Creating new session...");
          const newSession = await createNewSession(session.user.id);
          
          if (!newSession) {
            throw new Error("Failed to create session");
          }

          // Delete the pending signup
          const { error: deleteError } = await supabase
            .from('pending_signups')
            .delete()
            .eq('stripe_session_id', sessionId);

          if (deleteError) {
            console.error("Error cleaning up pending signup:", deleteError);
            // Don't throw here as user is already signed in
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
        console.log("Creating new session...");
        const newSession = await createNewSession(session.user.id);
        
        if (!newSession) {
          throw new Error("Failed to create session");
        }

        toast({
          title: "Welcome back!",
          description: "You've been successfully signed in."
        });
        navigate('/dashboard');

      } catch (error) {
        console.error("Error in auth callback:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "An unexpected error occurred. Please try again or contact support."
        });
        navigate('/login');
      }
    };

    handleAuthCallback();
  }, [navigate, toast, createNewSession]);

  return null;
};