import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { GoogleAuthHandler } from "./handlers/GoogleAuthHandler";
import { useSessionManagement } from "@/hooks/useSessionManagement";

export const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { createNewSession } = useSessionManagement();
  const provider = searchParams.get("provider");

  if (provider === "google") {
    return <GoogleAuthHandler />;
  }

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log("Handling auth callback...");
        
        // Check for CSRF token if present in state
        const state = searchParams.get('state');
        const storedState = localStorage.getItem('auth_state');
        if (state && storedState && state !== storedState) {
          throw new Error("Invalid state parameter");
        }

        // Clear stored state
        localStorage.removeItem('auth_state');

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

        // Check if user exists in profiles with additional security checks
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*, sessions!inner(*)')
          .eq('email', session.user.email)
          .eq('account_status', 'active')
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

        // Check if profile has subscription
        if (!profile.subscription_plan || profile.subscription_plan === 'free') {
          console.log('No subscription plan, redirecting to pricing');
          toast({
            title: "Welcome!",
            description: "Please select a subscription plan to continue."
          });
          navigate('/?scrollTo=pricing-section');
          return;
        }

        // Reset login attempts on successful auth
        await supabase
          .from('profiles')
          .update({ 
            login_attempts: 0,
            last_login: new Date().toISOString()
          })
          .eq('id', profile.id);

        // All good, redirect to dashboard
        toast({
          title: "Welcome back!",
          description: "You've been successfully signed in. Any other active sessions have been ended."
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
  }, [navigate, toast, createNewSession, searchParams]);

  return null;
};