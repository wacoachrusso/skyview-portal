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
        console.log("Starting session check...");
        
        // First clear any existing session to ensure clean state
        const { error: clearError } = await supabase.auth.signOut({ scope: 'local' });
        if (clearError) {
          console.error("Error clearing existing session:", clearError);
        }

        // Get fresh session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          localStorage.clear();
          navigate('/login');
          return;
        }

        if (!session) {
          console.log("No active session found, redirecting to login");
          localStorage.clear();
          navigate('/login');
          return;
        }

        // Verify the session is still valid with a separate check
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error("Error getting user:", userError);
          await supabase.auth.signOut({ scope: 'local' });
          localStorage.clear();
          navigate('/login');
          return;
        }

        if (!user) {
          console.log("No user found in valid session");
          await supabase.auth.signOut({ scope: 'local' });
          localStorage.clear();
          navigate('/login');
          return;
        }

        // Check if user has an active profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('account_status')
          .eq('id', user.id)
          .single();

        if (profileError || !profile) {
          console.error("Error fetching profile:", profileError);
          await supabase.auth.signOut({ scope: 'local' });
          localStorage.clear();
          toast({
            variant: "destructive",
            title: "Profile Error",
            description: "Unable to verify your account. Please log in again."
          });
          navigate('/login');
          return;
        }

        if (profile.account_status !== 'active') {
          console.log("Account not active:", profile.account_status);
          await supabase.auth.signOut({ scope: 'local' });
          localStorage.clear();
          toast({
            variant: "destructive",
            title: "Account Not Active",
            description: "Your account is not active. Please contact support."
          });
          navigate('/login');
          return;
        }

        console.log("Session check complete - valid session for:", user.email);
      } catch (error) {
        console.error("Unexpected error in session check:", error);
        await supabase.auth.signOut({ scope: 'local' });
        localStorage.clear();
        navigate('/login');
      }
    };

    checkSession();

    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed in SessionCheck:", event);
      if (event === 'SIGNED_OUT' || !session) {
        console.log("User signed out or session ended");
        localStorage.clear();
        navigate('/login');
      }
    });

    return () => {
      console.log("SessionCheck cleanup - unsubscribing from auth changes");
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

  return null;
}