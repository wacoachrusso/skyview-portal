import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useAuthState = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.email);
      
      if (event === 'SIGNED_OUT' || !session) {
        console.log("User signed out or session ended");
        localStorage.clear();
        toast({
          title: "Signed Out",
          description: "You have been signed out successfully."
        });
        navigate('/login');
      } else if (session?.user) {
        console.log("Valid session detected");
        setUserEmail(session.user.email);
        
        // Sign out other sessions when a new sign in occurs
        if (event === 'SIGNED_IN') {
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
      }
    });

    return () => {
      console.log("Auth state cleanup");
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

  return { userEmail };
};