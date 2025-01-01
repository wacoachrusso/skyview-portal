import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useAuthManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        console.log("Checking session in useAuthManagement");
        
        // First clear any existing session to ensure clean state
        const { error: clearError } = await supabase.auth.signOut({ scope: 'local' });
        if (clearError) {
          console.error("Error clearing existing session:", clearError);
        }

        // Get fresh session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          if (mounted) {
            setIsLoading(false);
            navigate('/login');
          }
          return;
        }

        if (!session) {
          console.log("No active session found");
          if (mounted) {
            setIsLoading(false);
            navigate('/login');
          }
          return;
        }

        // Verify the session is still valid
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error("Error getting user:", userError);
          if (mounted) {
            setIsLoading(false);
            navigate('/login');
          }
          return;
        }

        if (!user) {
          console.log("No user found");
          if (mounted) {
            setIsLoading(false);
            navigate('/login');
          }
          return;
        }

        console.log("Valid session found for user:", user.email);
        if (mounted) {
          setUserEmail(user.email);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Unexpected error in checkAuth:", error);
        if (mounted) {
          setIsLoading(false);
          navigate('/login');
        }
      }
    };

    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.email);
      
      if (!mounted) return;

      if (event === 'SIGNED_OUT' || !session) {
        console.log("User signed out or session ended");
        setUserEmail(null);
        navigate('/login');
      } else if (session?.user) {
        console.log("Valid session detected");
        setUserEmail(session.user.email);
      }
    });

    return () => {
      console.log("Auth management cleanup");
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handleSignOut = async () => {
    try {
      console.log("Starting sign out process");
      setIsLoading(true);
      
      // Check if we have an active session before attempting to sign out
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        const { error } = await supabase.auth.signOut({ scope: 'local' });
        if (error) {
          console.error("Error during sign out:", error);
          // Even if there's an error, we should clean up the local state
        }
      }
      
      // Clear local state and redirect
      setUserEmail(null);
      localStorage.clear();
      
      console.log("Sign out successful");
      toast({
        title: "Signed out successfully",
        description: "You have been logged out of your account.",
      });
      
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      // Even if there's an error, we should redirect
      navigate('/login');
      
      toast({
        title: "Error signing out",
        description: "There was a problem signing out. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { userEmail, isLoading, handleSignOut };
};