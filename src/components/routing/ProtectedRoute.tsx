
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { WaitlistCheck } from "./WaitlistCheck";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    let mounted = true;
    
    const checkAuth = async () => {
      try {
        const checkStarted = sessionStorage.getItem('auth_check_started') === 'true';
        if (checkStarted && !isAuthenticated) {
          console.log("Auth check already in progress, preventing loop");
          setIsLoading(false);
          return;
        }
        
        sessionStorage.setItem('auth_check_started', 'true');
        
        if (localStorage.getItem('login_in_progress') === 'true' ||
            localStorage.getItem('skip_initial_redirect') === 'true') {
          console.log("Skipping auth check due to special flags");
          if (mounted) {
            setIsAuthenticated(true);
            setIsLoading(false);
          }
          return;
        }
        
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.log("No session found in ProtectedRoute, redirecting to login");
          if (mounted) {
            localStorage.setItem('skip_initial_redirect', 'true');
            navigate("/login", { replace: true });
          }
          return;
        }
        
        if (mounted) {
          setIsAuthenticated(true);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error in ProtectedRoute:", error);
        if (mounted) {
          setIsLoading(false);
          navigate("/login", { replace: true });
        }
      } finally {
        sessionStorage.removeItem('auth_check_started');
      }
    };
    
    checkAuth();
    
    return () => {
      mounted = false;
    };
  }, [navigate, isAuthenticated]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return isAuthenticated ? <WaitlistCheck>{children}</WaitlistCheck> : null;
};
