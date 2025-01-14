import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { GoogleAuthHandler } from "./handlers/GoogleAuthHandler";
import { useSessionManagement } from "@/hooks/useSessionManagement";
import { checkSession, checkUserProfile } from "@/utils/authCallbackUtils";
import { handleSelectedPlan } from "@/utils/authCallbackHandlers";
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
  
  const selectedPlan = searchParams.get('selectedPlan');
  const priceId = searchParams.get('priceId');

  if (provider === "google") {
    return <GoogleAuthHandler />;
  }

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log("=== Auth Callback Flow Start ===");
        console.log("Selected plan:", selectedPlan);
        console.log("Price ID:", priceId);
        
        // Validate CSRF token
        const state = searchParams.get('state');
        const storedState = localStorage.getItem('auth_state');
        if (!validateCsrfToken(state, storedState)) {
          throw new Error("Invalid state parameter");
        }
        localStorage.removeItem('auth_state');

        // Handle paid plan selection first
        if (selectedPlan && selectedPlan !== 'free') {
          console.log('Paid plan selected, redirecting to payment before completing auth');
          const success = await handleSelectedPlan(selectedPlan, { navigate, toast });
          if (!success) {
            await handlePaymentRequired({ navigate, toast });
            return;
          }
          return;
        }

        // Check session validity
        const session = await checkSession({ navigate, toast });
        if (!session) return;

        console.log("Valid session found for user:", session.user.email);

        // Verify user profile
        const profile = await checkUserProfile(session.user.id, { navigate, toast });
        if (!profile) return;

        // Check account lock status
        if (profile.login_attempts >= 5) {
          await handleAccountLocked({ navigate, toast });
          return;
        }

        // Verify subscription status
        if (!profile.subscription_plan || profile.subscription_plan === 'free') {
          console.log('No valid subscription found, redirecting to pricing');
          await handleSubscriptionRequired({ navigate, toast });
          return;
        }

        // Create new session after all checks pass
        console.log("Creating new session and invalidating others...");
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
  }, [navigate, toast, createNewSession, searchParams, selectedPlan, priceId]);

  return null;
};