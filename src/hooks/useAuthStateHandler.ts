import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSessionManagement } from "@/hooks/useSessionManagement";

export const useAuthStateHandler = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { createNewSession } = useSessionManagement();

  const handleAuthStateChange = async (event: string, session: any) => {
    console.log("Auth state changed in SessionCheck:", event, session?.user?.email);
    
    if (event === 'SIGNED_OUT' || !session) {
      console.log("User signed out or session ended");
      localStorage.clear();
      navigate('/login');
      return;
    }
    
    if (event === 'SIGNED_IN' && session?.user) {
      console.log("New sign-in detected, creating session...");
      try {
        // When a new sign-in occurs, create a new session (this will invalidate others)
        await createNewSession(session.user.id);
        
        // Only attempt re-authentication for Google users
        if (session.user.app_metadata.provider === 'google') {
          console.log("Re-authenticating Google user...");
          const { error: reAuthError } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              queryParams: {
                access_type: 'offline',
                prompt: 'consent',
              },
              redirectTo: `${window.location.origin}/auth/callback`
            }
          });

          if (reAuthError) {
            console.error("Error re-authenticating:", reAuthError);
            localStorage.clear();
            await supabase.auth.signOut();
            toast({
              variant: "destructive",
              title: "Session Error",
              description: "Your session has expired. Please log in again."
            });
            navigate('/login');
          }
        }
      } catch (error) {
        console.error("Error handling sign-in:", error);
        localStorage.clear();
        await supabase.auth.signOut();
        toast({
          variant: "destructive",
          title: "Session Error",
          description: "Your session has expired. Please log in again."
        });
        navigate('/login');
      }
    }
  };

  return { handleAuthStateChange };
};