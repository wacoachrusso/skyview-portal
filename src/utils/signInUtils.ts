
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const handleSignIn = async (email: string, password: string, rememberMe: boolean = false) => {
  console.log("Starting sign in process");
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // No need to check email confirmation - we assume emails are already confirmed
    // Just set session storage flag to prevent pricing redirects
    sessionStorage.setItem('recently_signed_up', 'true');

    // Handle "Remember Me" functionality for 30 days
    if (rememberMe && data.session?.refresh_token) {
      // Store refresh token in localStorage and a long-lived cookie (30 days)
      localStorage.setItem('supabase.refresh-token', data.session.refresh_token);
      document.cookie = `sb-refresh-token=${data.session.refresh_token}; path=/; secure; samesite=strict; max-age=${30 * 24 * 60 * 60}`;
      console.log("Remember Me enabled, set 30-day session");
    }

    console.log("Sign in successful");
    return true;
  } catch (error) {
    console.error("Sign in error:", error);
    toast({
      variant: "destructive",
      title: "Error",
      description: "Invalid email or password",
    });
    return false;
  }
};
