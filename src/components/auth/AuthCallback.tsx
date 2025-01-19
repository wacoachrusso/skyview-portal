import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { GoogleAuthHandler } from "./handlers/GoogleAuthHandler";
import { useSessionManagement } from "@/hooks/useSessionManagement";
import { handleStripeCallback } from "@/utils/auth/stripeCallbackHandler";
import { createUserAccount } from "@/utils/auth/userCreationHandler";
import { handleAuthSession } from "@/utils/auth/sessionHandler";

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
          const pendingSignup = await handleStripeCallback(sessionId, navigate);
          if (!pendingSignup) return;

          // Create the user account
          const user = await createUserAccount(pendingSignup);
          console.log("User account created successfully:", user.id);

          // Sign in the user immediately
          console.log("Attempting to sign in user:", pendingSignup.email);
          const { data: { session }, error: signInError } = await supabase.auth.signInWithPassword({
            email: pendingSignup.email,
            password: pendingSignup.password
          });

          if (signInError || !session) {
            console.error("Error signing in user:", signInError);
            throw new Error("Failed to sign in after account creation");
          }

          console.log("User signed in successfully:", session.user.id);

          // Create new session and handle redirect
          await handleAuthSession(session.user.id, createNewSession, navigate);

          // Delete the pending signup
          console.log("Cleaning up pending signup data");
          const { error: deleteError } = await supabase
            .from('pending_signups')
            .delete()
            .eq('stripe_session_id', sessionId);

          if (deleteError) {
            console.error("Error cleaning up pending signup:", deleteError);
          }

          return;
        }

        // Handle regular auth callback flow
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          console.error("Session error:", sessionError);
          throw new Error("Invalid session");
        }

        await handleAuthSession(session.user.id, createNewSession, navigate);

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