import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { createNewSession } from "./useSessionCreation";
import { useSessionStore } from "@/stores/session";

export const useSessionInitialization = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const store = useSessionStore();
  const [isLoading, setIsLoading] = useState(true);

  const initializeSession = async () => {
    try {
      console.log("Initializing session");
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Error getting session:", error);
        setIsLoading(false);
        navigate('/login');
        return;
      }
      
      if (!session) {
        console.log("No active session found");
        setIsLoading(false);
        navigate('/login');
        return;
      }

      // Store auth tokens in store and ensure refresh token is properly stored
      store.setAuthTokens(session.access_token, session.refresh_token);
      store.setUserId(session.user.id);
      store.setUserEmail(session.user.email || null);
      
      if (session.refresh_token) {
        // Keep cookie as backup for persistence across page reloads
        document.cookie = `sb-refresh-token=${session.refresh_token}; path=/; secure; samesite=strict; max-age=${7 * 24 * 60 * 60}`;
      }

      // Verify user profile and admin status
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
        
      if (profileError) {
        console.error("Error fetching profile:", profileError);
      } else if (profile) {
        console.log("User profile loaded:", profile.email, "Is admin:", profile.is_admin);
        
        // Store admin status in store
        store.setIsAdmin(profile.is_admin || false);
        console.log("Admin status set in store:", profile.is_admin);
      }

      // Get current session token from store
      const sessionToken = store.sessionToken;
      if (!sessionToken) {
        // Create a new session if none exists
        await createNewSession(session.user.id);
      } else {
        // Validate existing session
        const { data: isValid } = await supabase
          .rpc('is_session_valid', {
            p_session_token: sessionToken
          });

        if (!isValid) {
          console.log('Session token invalid, creating new session');
          await createNewSession(session.user.id);
        }
      }

      setIsLoading(false);
    } catch (error) {
      console.error("Error initializing session:", error);
      setIsLoading(false);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred. Please try again."
      });
      navigate('/login');
    }
  };

  return {
    isLoading,
    initializeSession
  };
};