
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { createNewSession } from "./useSessionCreation";

export const useSessionInitialization = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
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

      // Ensure refresh token is properly stored
      if (session.refresh_token) {
        localStorage.setItem('supabase.refresh-token', session.refresh_token);
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
        
        // Store admin status in local storage for quick access
        if (profile.is_admin) {
          localStorage.setItem('user_is_admin', 'true');
          console.log("Admin status set in local storage");
        } else {
          localStorage.removeItem('user_is_admin');
        }
      }

      // Get current session token
      const sessionToken = localStorage.getItem('session_token');
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
      
      // Redirect to chat page after successful initialization
      // Check current location to avoid redirecting if already on chat page
      if (window.location.pathname !== '/chat') {
        console.log("Session initialized successfully, redirecting to chat page");
        navigate('/chat');
      }
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
