import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { GoogleAuthHandler } from "./handlers/GoogleAuthHandler";
import { useSessionManagement } from "@/hooks/useSessionManagement";
import {
  validateCsrfToken,
  handleAuthenticationError,
  handlePaymentRequired,
  handleSubscriptionRequired,
  handleAccountLocked,
  handleSuccessfulAuth
} from "@/utils/auth/sessionUtils";

export const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { createNewSession } = useSessionManagement();
  const provider = searchParams.get("provider");
  
  const selectedPlan = searchParams.get('selectedPlan') || localStorage.getItem('selected_plan');

  if (provider === "google") {
    return <GoogleAuthHandler />;
  }

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log("=== Auth Callback Flow Start ===");
        console.log("Selected plan:", selectedPlan);
        
        // Validate CSRF token
        const state = searchParams.get('state');
        const storedState = localStorage.getItem('auth_state');
        if (!validateCsrfToken(state, storedState)) {
          throw new Error("Invalid state parameter");
        }
        localStorage.removeItem('auth_state');
        localStorage.removeItem('selected_plan');

        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          throw new Error("No session found");
        }

        // Get user profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          console.error("Profile error:", profileError);
          throw new Error("Failed to fetch user profile");
        }

        // Check account lock status
        if (profile.login_attempts >= 5) {
          await handleAccountLocked({ navigate, toast });
          return;
        }

        // If this is a paid plan signup, redirect to payment first
        if (selectedPlan && selectedPlan !== 'free') {
          console.log('Paid plan selected, redirecting to payment');
          await handlePaymentRequired({ navigate, toast });
          return;
        }

        // Verify subscription status for paid plans
        if (!profile.subscription_plan || profile.subscription_plan === 'pending') {
          console.log('No valid subscription found, redirecting to pricing');
          await handleSubscriptionRequired({ navigate, toast });
          return;
        }

        // Create new session after all checks pass
        console.log("Creating new session...");
        const newSession = await createNewSession(session.user.id);
        
        if (!newSession) {
          throw new Error("Failed to create new session");
        }

        // Reset login attempts
        await supabase
          .from('profiles')
          .update({ login_attempts: 0 })
          .eq('id', profile.id);

        console.log("=== Auth Callback Flow Complete ===");
        await handleSuccessfulAuth(session, { navigate, toast });

      } catch (error) {
        console.error("Error in auth callback:", error);
        await handleAuthenticationError({ navigate, toast });
      }
    };

    handleAuthCallback();
  }, [navigate, toast, createNewSession, searchParams, selectedPlan]);

  return null;
};