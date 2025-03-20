
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const handleSignIn = async (email: string, password: string) => {
  console.log("Starting sign in process");
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    if (!data.user?.email_confirmed_at) {
      console.log("Email not confirmed");
      
      try {
        const { error: emailError } = await supabase.functions.invoke('send-signup-confirmation', {
          body: { 
            email,
            confirmationUrl: `${window.location.origin}/auth/callback?email=${encodeURIComponent(email)}`
          }
        });

        if (emailError) throw emailError;

        toast({
          variant: "destructive",
          title: "Email not verified",
          description: "Please check your email and verify your account before signing in. We've sent a new verification email.",
        });
        return false;
      } catch (emailError) {
        console.error("Error sending verification email:", emailError);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to send verification email. Please try again or contact support.",
        });
        return false;
      }
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

// Extension for handling "Remember Me" functionality
export const persistSession = async (rememberMe: boolean) => {
  if (rememberMe) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.refresh_token) {
        // Store refresh token for long-term persistence
        localStorage.setItem('supabase.refresh-token', session.refresh_token);
        // Set a cookie with 30-day expiration
        document.cookie = `sb-refresh-token=${session.refresh_token}; path=/; secure; samesite=strict; max-age=${30 * 24 * 60 * 60}`;
        console.log("30-day session persistence enabled");
        return true;
      }
    } catch (error) {
      console.error("Error persisting session:", error);
    }
  }
  return false;
};
