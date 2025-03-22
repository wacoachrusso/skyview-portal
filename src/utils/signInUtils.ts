
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const handleSignIn = async (email: string, password: string, rememberMe: boolean = false) => {
  console.log("Starting sign in process");
  try {
    // Set a flag to prevent redirection during login process
    localStorage.setItem('login_in_progress', 'true');
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // No need to check email confirmation - we assume emails are already confirmed
    // Set session storage flag to prevent pricing redirects
    sessionStorage.setItem('recently_signed_up', 'true');

    // Handle "Remember Me" functionality for 30 days
    if (rememberMe && data.session?.refresh_token) {
      // Store refresh token in localStorage and a long-lived cookie (30 days)
      localStorage.setItem('supabase.refresh-token', data.session.refresh_token);
      document.cookie = `sb-refresh-token=${data.session.refresh_token}; path=/; secure; samesite=strict; max-age=${30 * 24 * 60 * 60}`;
      console.log("Remember Me enabled, set 30-day session");
    }
    
    // Store auth tokens in localStorage for persistence across page refreshes
    if (data.session) {
      localStorage.setItem('auth_access_token', data.session.access_token);
      localStorage.setItem('auth_refresh_token', data.session.refresh_token);
      localStorage.setItem('auth_user_id', data.session.user.id);
      localStorage.setItem('auth_user_email', email);
      
      // Set session tokens in cookies for additional persistence
      document.cookie = `sb-access-token=${data.session.access_token}; path=/; max-age=${60 * 60 * 24 * 7}; secure; samesite=strict`;
      document.cookie = `sb-refresh-token=${data.session.refresh_token}; path=/; max-age=${60 * 60 * 24 * 7}; secure; samesite=strict`;
      document.cookie = `session_user_id=${data.session.user.id}; path=/; max-age=${60 * 60 * 24 * 7}; secure; samesite=strict`;
    }

    console.log("Sign in successful");
    
    // Clear the login_in_progress flag after a short delay
    // This allows time for other components to complete their initialization
    setTimeout(() => {
      localStorage.removeItem('login_in_progress');
    }, 2000);
    
    return true;
  } catch (error) {
    console.error("Sign in error:", error);
    localStorage.removeItem('login_in_progress');
    toast({
      variant: "destructive",
      title: "Error",
      description: "Invalid email or password",
    });
    return false;
  }
};
