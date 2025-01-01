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

        // Check for other sessions
        const { data: sessions } = await supabase.auth.getSession();
        
        if (sessions && sessions.length > 1) {
          console.log("Multiple sessions detected, signing out from others");
          
          // Sign out globally and restore current session
          await supabase.auth.signOut({ scope: 'global' });
          await supabase.auth.setSession({
            access_token: session.access_token,
            refresh_token: session.refresh_token
          });

          toast({
            variant: "destructive",
            title: "Other Sessions Terminated",
            description: "You've been signed out from other devices for security."
          });
        }

        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          console.error("Error getting user or no user found:", userError);
          if (mounted) {
            await supabase.auth.signOut({ scope: 'local' });
            localStorage.clear();
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
          localStorage.clear();
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
        localStorage.clear();
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
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log("No active session found, cleaning up");
        localStorage.clear();
        navigate('/login');
        return;
      }

      // Sign out from all sessions
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      if (error) {
        console.error("Error during sign out:", error);
        throw error;
      }
      
      console.log("Sign out successful");
      localStorage.clear();
      
      toast({
        title: "Signed out successfully",
        description: "You have been logged out of your account.",
      });
      
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      localStorage.clear();
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