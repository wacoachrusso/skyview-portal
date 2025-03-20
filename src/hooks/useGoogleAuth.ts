
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useGoogleAuth = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleGoogleSignIn = async () => {
    try {
      console.log("Initiating Google sign in...");
      setLoading(true);
      
      // Clear any existing session data first to prevent issues
      localStorage.removeItem('session_token');
      localStorage.removeItem('supabase.refresh-token');
      document.cookie = 'sb-refresh-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=strict';
      
      // Sign out first to ensure a clean state
      await supabase.auth.signOut({ scope: 'local' });
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?provider=google`,
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
        setLoading(false);
      } else {
        console.log("Google sign in initiated, awaiting redirect...", data);
        if (!data.url) {
          console.error("No redirect URL returned from signInWithOAuth");
          toast({
            variant: "destructive",
            title: "Sign In Failed",
            description: "Failed to initialize Google sign in. Please try again.",
          });
          setLoading(false);
        } else {
          // Manual redirect for more reliability
          console.log("Manually redirecting to:", data.url);
          window.location.href = data.url;
          // Don't set loading to false here as we're redirecting away
        }
      }
    } catch (error) {
      console.error("Unexpected error during Google sign in:", error);
      toast({
        variant: "destructive",
        title: "Sign In Error",
        description: "An unexpected error occurred. Please try again.",
      });
      setLoading(false);
    }
  };

  return { handleGoogleSignIn, loading };
};
