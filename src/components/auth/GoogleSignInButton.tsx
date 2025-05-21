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
      
      // Check if we're already in a profile completion flow
      const isInProfileCompletion = window.location.pathname.includes('/complete-profile');
      const currentPath = window.location.pathname;
      
      console.log(`Current path: ${currentPath}, Is in profile completion: ${isInProfileCompletion}`);
      
      // Save current location if we're in the midst of profile completion
      if (isInProfileCompletion) {
        console.log(`Preserving auth flow context: ${currentPath}`);
        localStorage.setItem('auth_return_path', currentPath);
        localStorage.setItem('auth_flow_preserved', 'true');
      }
      
      // Check any existing auth flow flags before clearing them
      const existingLoginInProgress = localStorage.getItem('login_in_progress');
      const existingNeedsCompletion = localStorage.getItem('needs_profile_completion');
      
      console.log(`Auth flow state before sign-out: login_in_progress=${existingLoginInProgress}, needs_profile_completion=${existingNeedsCompletion}`);
      
      // Clear specific session data while preserving flow flags if needed
      console.log("Clearing specific session tokens...");
      localStorage.removeItem('session_token');
      localStorage.removeItem('supabase.refresh-token');
      document.cookie = 'sb-refresh-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=strict';
      
      // Sign out first to ensure a clean state
      console.log("Signing out to ensure clean auth state...");
      await supabase.auth.signOut({ scope: 'local' });
      
      // Get the current origin to use as base for redirect
      const redirectUrl = `${window.location.origin}/auth/callback?provider=google`;
      
      // Add a flag in the URL to indicate if we're coming from profile completion
      if (isInProfileCompletion) {
        console.log(`Adding profile_completion=true to redirect URL`);
        const redirectWithFlag = `${redirectUrl}&from_profile_completion=true`;
        console.log("Setting redirect URL to:", redirectWithFlag);
        
        // Set a flag to maintain context between sign-out and callback
        localStorage.setItem('resuming_auth_flow', 'true');
        
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: redirectWithFlag,
            queryParams: {
              access_type: "offline",
              prompt: "consent",
            },
          },
        });
        
        if (error) {
          handleAuthError(error);
        } else {
          console.log("Google sign in initiated from profile completion flow, awaiting redirect...");
          localStorage.setItem('login_in_progress', 'true');
        }
      } else {
        // Regular sign in flow
        console.log("Setting standard redirect URL to:", redirectUrl);
        
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
          handleAuthError(error);
        } else {
          console.log("Google sign in initiated, awaiting redirect...");
          // Set a flag to indicate login is in progress - prevents redirect loops
          localStorage.setItem('login_in_progress', 'true');
        }
      }
    } catch (error) {
      handleUnexpectedError(error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleAuthError = (error) => {
    console.error("Google sign in error:", error);
    toast({
      variant: "destructive",
      title: "Sign In Failed",
      description: error.message || "Failed to sign in with Google.",
    });
  };
  
  const handleUnexpectedError = (error) => {
    console.error("Unexpected error during Google sign in:", error);
    toast({
      variant: "destructive",
      title: "Sign In Error",
      description: "An unexpected error occurred. Please try again.",
    });
  };

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full border-white/20 text-black bg-white hover:bg-white/10 hover:text-white"
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