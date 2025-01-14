import { Session } from "@supabase/supabase-js";
import { NavigateFunction } from "react-router-dom";
import { toast as toastFunction } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AuthCallbackProps {
  navigate: NavigateFunction;
  toast: typeof toastFunction;
}

export const validateCsrfToken = (state: string | null, storedState: string | null): boolean => {
  if (state && storedState && state !== storedState) {
    console.error("Invalid state parameter");
    return false;
  }
  return true;
};

export const handleAuthenticationError = async ({ navigate, toast }: AuthCallbackProps) => {
  await supabase.auth.signOut();
  toast({
    variant: "destructive",
    title: "Authentication Error",
    description: "Please try logging in again."
  });
  navigate('/login');
};

export const handlePaymentRequired = async ({ navigate, toast }: AuthCallbackProps) => {
  await supabase.auth.signOut();
  toast({
    title: "Payment Required",
    description: "Please complete your subscription payment to continue."
  });
  navigate('/?scrollTo=pricing-section');
};

export const handleSubscriptionRequired = async ({ navigate, toast }: AuthCallbackProps) => {
  await supabase.auth.signOut();
  toast({
    title: "Subscription Required",
    description: "Please select a subscription plan to continue."
  });
  navigate('/?scrollTo=pricing-section');
};

export const handleAccountLocked = async ({ navigate, toast }: AuthCallbackProps) => {
  await supabase.auth.signOut();
  toast({
    variant: "destructive",
    title: "Account Locked",
    description: "Too many login attempts. Please reset your password."
  });
  navigate('/login');
};

export const handleSuccessfulAuth = async (
  session: Session,
  { navigate, toast }: AuthCallbackProps
) => {
  toast({
    title: "Welcome back!",
    description: "You've been successfully signed in."
  });
  navigate('/dashboard');
};