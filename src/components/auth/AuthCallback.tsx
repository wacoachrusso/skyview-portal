import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { GoogleAuthHandler } from "./handlers/GoogleAuthHandler";
import { useSessionManagement } from "@/hooks/useSessionManagement";
import { checkSession, checkUserProfile } from "@/utils/authCallbackUtils";
import { handleSelectedPlan } from "@/utils/authCallbackHandlers";

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
        
        // Check for CSRF token if present in state
        const state = searchParams.get('state');
        const storedState = localStorage.getItem('auth_state');
        if (state && storedState && state !== storedState) {
          console.error("Invalid state parameter");
          throw new Error("Invalid state parameter");
        }

        // Clear stored state
        localStorage.removeItem('auth_state');

        const session = await checkSession({ navigate, toast });
        if (!session) return;

        console.log("Valid session found for user:", session.user.email);

        // Create a new session and invalidate others
        console.log("Creating new session and invalidating others...");
        const newSession = await createNewSession(session.user.id);
        
        if (!newSession) {
          throw new Error("Failed to create new session");
        }

        // Check if user exists in profiles
        const profile = await checkUserProfile(session.user.id, { navigate, toast });
        if (!profile) return;

        // Check if account is locked
        if (profile.login_attempts >= 5) {
          await supabase.auth.signOut();
          toast({
            variant: "destructive",
            title: "Account Locked",
            description: "Too many login attempts. Please reset your password."
          });
          navigate('/login');
          return;
        }

        // IMPORTANT: Check if user selected a paid plan but hasn't paid yet
        if (selectedPlan && selectedPlan !== 'free') {
          console.log('User selected paid plan, redirecting to payment');
          const success = await handleSelectedPlan(selectedPlan, { navigate, toast });
          if (!success) {
            // If payment setup fails, sign out and redirect to pricing
            await supabase.auth.signOut();
            toast({
              title: "Payment Required",
              description: "Please complete your subscription payment to continue."
            });
            navigate('/?scrollTo=pricing-section');
          }
          return;
        }

        // For free plan users, check if they have a valid subscription
        if (!profile.subscription_plan || profile.subscription_plan === 'free') {
          console.log('No valid subscription found, redirecting to pricing');
          await supabase.auth.signOut();
          toast({
            title: "Subscription Required",
            description: "Please select a subscription plan to continue."
          });
          navigate('/?scrollTo=pricing-section');
          return;
        }

        // Reset login attempts on successful auth
        await supabase
          .from('profiles')
          .update({ login_attempts: 0 })
          .eq('id', profile.id);

        console.log("=== Auth Callback Flow Complete ===");
        toast({
          title: "Welcome back!",
          description: "You've been successfully signed in."
        });
        navigate('/dashboard');

      } catch (error) {
        console.error("Error in auth callback:", error);
        await supabase.auth.signOut();
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "Please try logging in again."
        });
        navigate('/login');
      }
    };

    handleAuthCallback();
  }, [navigate, toast, createNewSession, searchParams, selectedPlan, priceId]);

  return null;
};