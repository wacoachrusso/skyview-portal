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
        console.log("Checking session in Dashboard");
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

        console.log("Session found, checking user");
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          console.error("Error getting user or no user found:", userError);
          if (mounted) {
            // Check if we still have a session before attempting to sign out
            const { data: { session: currentSession } } = await supabase.auth.getSession();
            if (currentSession) {
              await supabase.auth.signOut({ scope: 'local' });
            }
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
          // Check if we still have a session before attempting to sign out
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            await supabase.auth.signOut({ scope: 'local' });
          }
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
      
      // Check if we still have a session before attempting to sign out
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await supabase.auth.signOut({ scope: 'local' });
      }
      
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