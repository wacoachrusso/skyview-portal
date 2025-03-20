import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useGoogleAuth = () => {
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Listen for authentication state changes
  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
    };

    fetchSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event);
      setSession(session);
      
      // If user signs in, we'll let the GoogleAuthHandler component handle the redirect
      if (event === 'SIGNED_IN') {
        // Only redirect if not already on the callback path
        if (window.location.pathname !== '/auth/callback') {
          console.log("Auth state is SIGNED_IN, redirecting to callback page");
          navigate('/auth/callback', { replace: true });
        }
      } else if (event === 'SIGNED_OUT') {
        // Clear local storage and redirect to login
        localStorage.removeItem('session_token');
        localStorage.removeItem('supabase.refresh-token');
        console.log("Auth state is SIGNED_OUT, redirecting to login page");
        navigate('/login', { replace: true });
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      console.log("Initiating Google sign in...");
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
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

  const handleSignOut = async () => {
    try {
      setLoading(true);
      
      // Clear session data first
      localStorage.removeItem('session_token');
      localStorage.removeItem('supabase.refresh-token');
      document.cookie = 'sb-refresh-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=strict';
      
      // Then sign out from Supabase
      await supabase.auth.signOut();
      setSession(null);
      
      // Navigate to login page
      navigate("/login", { replace: true });
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      });
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        variant: "destructive",
        title: "Sign Out Error",
        description: "Failed to sign out. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return { handleGoogleSignIn, handleSignOut, loading, session };
};
