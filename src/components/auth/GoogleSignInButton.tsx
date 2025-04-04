
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const GoogleSignInButton = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      console.log("Initiating Google sign in...");
      
      // Clear any existing session data first to prevent issues
      localStorage.removeItem('session_token');
      localStorage.removeItem('supabase.refresh-token');
      document.cookie = 'sb-refresh-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=strict';
      
      // Sign out first to ensure a clean state
      await supabase.auth.signOut({ scope: 'local' });
      
      // Get the current origin to use as base for redirect
      const redirectUrl = `${window.location.origin}/auth/callback?provider=google`;
      console.log("Setting redirect URL to:", redirectUrl);
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) {
        console.error("Google sign in error:", error);
        toast({
          variant: "destructive",
          title: "Sign In Failed",
          description: error.message || "Failed to sign in with Google.",
        });
      } else {
        console.log("Google sign in initiated, awaiting redirect...");
        // Set a flag to indicate login is in progress - prevents redirect loops
        localStorage.setItem('login_in_progress', 'true');
      }
    } catch (error) {
      console.error("Unexpected error during Google sign in:", error);
      toast({
        variant: "destructive",
        title: "Sign In Error",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full border-white/20 text-white hover:bg-white/10 hover:text-white"
      onClick={handleGoogleSignIn}
      disabled={loading}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span>Connecting...</span>
        </div>
      ) : (
        <>
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google logo"
            className="w-4 h-4 mr-2"
          />
          Sign In with Google
        </>
      )}
    </Button>
  );
};
