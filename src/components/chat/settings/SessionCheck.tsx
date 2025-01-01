import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function SessionCheck() {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log("Checking session in SessionCheck component...");
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.log("No active session found, redirecting to login");
          localStorage.clear();
          navigate('/login');
          return;
        }

        // Verify the session is still valid
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          console.error("Error getting user or no user found:", userError);
          localStorage.clear();
          await supabase.auth.signOut();
          toast({
            variant: "destructive",
            title: "Session Error",
            description: "Your session has expired. Please log in again."
          });
          navigate('/login');
          return;
        }

        console.log("Valid session found for user:", user.email);
      } catch (error) {
        console.error("Unexpected error in session check:", error);
        localStorage.clear();
        await supabase.auth.signOut();
        toast({
          variant: "destructive",
          title: "Session Error",
          description: "An error occurred with your session. Please log in again."
        });
        navigate('/login');
      }
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed in SessionCheck:", event, session?.user?.email);
      if (event === 'SIGNED_OUT' || !session) {
        localStorage.clear();
        navigate('/login');
      } else if (event === 'SIGNED_IN') {
        // When a new sign-in occurs, sign out other sessions
        const { error: signOutError } = await supabase.auth.signOut({ 
          scope: 'others'
        });
        
        if (signOutError) {
          console.error("Error signing out other sessions:", signOutError);
          toast({
            variant: "destructive",
            title: "Session Warning",
            description: "Unable to sign out other sessions. You may be signed in on other devices."
          });
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

  return null;
}