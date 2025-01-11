import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useAuthState = () => {
  console.log("Initializing useAuthState hook");
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    console.log("Setting up auth state listener");
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.email);
      
      if (event === 'SIGNED_OUT' || !session) {
        console.log("User signed out or session ended");
        localStorage.clear();
        navigate('/login');
      } else if (session?.user) {
        console.log("Valid session detected");
        setUserEmail(session.user.email);
        
        // Sign out other sessions when a new sign in occurs
        if (event === 'SIGNED_IN') {
          console.log('New sign-in detected, invalidating other sessions...');
          const currentToken = localStorage.getItem('session_token');
          
          try {
            const { error: signOutError } = await supabase
              .rpc('invalidate_other_sessions', {
                p_user_id: session.user.id,
                p_current_session_token: currentToken || ''
              });
            
            if (signOutError) {
              console.error("Error signing out other sessions:", signOutError);
              toast({
                variant: "destructive",
                title: "Session Warning",
                description: "Unable to sign out other sessions. You may be signed in on other devices."
              });
            }
          } catch (error) {
            console.error("Unexpected error during session invalidation:", error);
          }
        }
      }
    });

    return () => {
      console.log("Auth state cleanup");
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

  return { userEmail };
};