import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useAuthState = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('Setting up auth state listener');
    let mounted = true;
    
    // First check the initial session
    const checkInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log('Initial session check:', session ? 'Session exists' : 'No session');
        
        if (mounted) {
          setIsAuthenticated(!!session);
          setUserEmail(session?.user?.email || null);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error checking initial session:', error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    checkInitialSession();

    // Then set up the auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.email);
      
      if (event === 'SIGNED_OUT' || !session) {
        console.log("User signed out or session ended");
        localStorage.clear();
        if (mounted) {
          setIsAuthenticated(false);
          setUserEmail(null);
          // Only navigate to login if we're not already on a public route
          // and we're not in the test environment
          const isTestEnvironment = window.location.pathname.startsWith('/test-app');
          const publicRoutes = ['/', '/test-app', '/test-app/login', '/test-app/signup'];
          if (!isTestEnvironment && !publicRoutes.includes(window.location.pathname)) {
            navigate('/login');
          }
        }
      } else if (session?.user) {
        console.log("Valid session detected");
        if (mounted) {
          setUserEmail(session.user.email);
          setIsAuthenticated(true);
        }
      }
    });

    return () => {
      console.log("Auth state cleanup");
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

  return { userEmail, isAuthenticated, isLoading };
};