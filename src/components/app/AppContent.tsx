import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AppRoutes } from "@/components/routing/AppRoutes";

export function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        console.log('User is logged in, current path:', location.pathname);
        // Only redirect if on login, signup, or root path AND not coming from dashboard
        if (['/login', '/signup'].includes(location.pathname) || 
            (location.pathname === '/' && !location.state?.fromDashboard)) {
          console.log('Redirecting to chat page');
          navigate('/chat');
        }
      }
    };

    checkAuthAndRedirect();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event);
      if (event === 'SIGNED_IN' && session) {
        console.log('User signed in, redirecting to chat');
        navigate('/chat');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, location]);

  return (
    <div className="min-h-screen bg-background">
      <AppRoutes />
    </div>
  );
}