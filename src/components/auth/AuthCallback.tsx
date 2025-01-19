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
  const sessionId = searchParams.get("session_id");

  if (provider === "google") {
    return <GoogleAuthHandler />;
  }

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log("Starting auth callback process with params:", {
          sessionId,
          provider,
          hasSearchParams: searchParams.toString()
        });
        
        if (sessionId) {
          console.log("Processing Stripe payment callback with session ID:", sessionId);
          
          // First check if user already exists
          const { data: existingUser, error: userError } = await supabase.auth.getUser();
          console.log("Existing user check result:", { 
            hasUser: !!existingUser?.user,
            email: existingUser?.user?.email,
            error: userError 
          });

          if (existingUser?.user) {
            console.log("User already exists and is logged in:", existingUser.user.email);
            navigate('/dashboard');
            return;
          }

          // Fetch pending signup data with retry logic
          let pendingSignup = null;
          let pendingSignupError = null;
          
          for (let i = 0; i < 3; i++) {
            console.log(`Attempt ${i + 1}: Fetching pending signup data for session:`, sessionId);
            const result = await supabase
              .from('pending_signups')
              .select('*')
              .eq('stripe_session_id', sessionId)
              .maybeSingle();
            
            if (result.data) {
              pendingSignup = result.data;
              break;
            }
            
            pendingSignupError = result.error;
            if (i < 2) {
              console.log("Retrying pending signup fetch in 1 second...");
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          }

          console.log("Final pending signup query result:", { 
            hasPendingSignup: !!pendingSignup,
            pendingSignupEmail: pendingSignup?.email,
            error: pendingSignupError 
          });

          if (pendingSignupError) {
            console.error("Error fetching pending signup:", pendingSignupError);
            throw new Error("Failed to fetch signup data. Please contact support.");
          }

          if (!pendingSignup) {
            console.error("No pending signup found for session:", sessionId);
            toast({
              variant: "destructive",
              title: "Signup Error",
              description: "Your signup data was not found. Please try signing up again or contact support if the issue persists."
            });
            navigate('/?scrollTo=pricing-section');
            return;
          }

          const signupData = pendingSignup as PendingSignup;
          console.log("Found pending signup for email:", signupData.email);

          // Create the user account
          console.log("Creating user account with data:", {
            email: signupData.email,
            fullName: signupData.full_name,
            jobTitle: signupData.job_title,
            airline: signupData.airline,
            plan: signupData.plan
          });

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

          console.log("Signup result:", { 
            success: !!signUpData?.user,
            userId: signUpData?.user?.id,
            error: signUpError 
          });

          if (signUpError) {
            console.error("Error creating user account:", signUpError);
            throw signUpError;
          }

          if (!signUpData?.user) {
            console.error("No user data returned from signup");
            throw new Error("Failed to create user account");
          }

          console.log("User account created successfully:", signUpData.user.id);

          // Sign in the user immediately
          console.log("Attempting to sign in user:", signupData.email);
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
          console.log("Creating new session for user:", session.user.id);
          const newSession = await createNewSession(session.user.id);
          
          if (!newSession) {
            console.error("Failed to create new session");
            throw new Error("Failed to create session");
          }

          console.log("New session created successfully:", newSession);

          // Delete the pending signup
          console.log("Cleaning up pending signup data");
          const { error: deleteError } = await supabase
            .from('pending_signups')
            .delete()
            .eq('stripe_session_id', sessionId);

          if (deleteError) {
            console.error("Error cleaning up pending signup:", deleteError);
          }

          toast({
            title: "Welcome to SkyGuide!",
            description: "Your account has been created and you've been successfully signed in."
          });
          
          console.log("Redirecting to dashboard");
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
        navigate('/?scrollTo=pricing-section');
      }
    };

    handleAuthCallback();
  }, [navigate, toast, createNewSession, sessionId]);

  return null;
};