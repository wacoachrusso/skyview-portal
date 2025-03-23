
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AdminRouteProps {
  children: React.ReactNode;
}

export const AdminRoute = ({ children }: AdminRouteProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const cachedAdminStatus = localStorage.getItem('user_is_admin') === 'true';
        
        if (cachedAdminStatus) {
          console.log("User is admin according to localStorage");
          setIsAdmin(true);
          setIsLoading(false);
          return;
        }
        
        setIsLoading(true);
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          console.log("No active session, redirecting to login");
          navigate("/login");
          return;
        }
        
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', session.user.id)
          .single();
          
        if (profileError || !profile) {
          console.error("Error fetching admin status:", profileError);
          navigate("/chat");
          return;
        }
        
        if (!profile.is_admin) {
          console.log("User is not an admin, redirecting to chat");
          navigate("/chat");
          return;
        }
        
        localStorage.setItem('user_is_admin', 'true');
        setIsAdmin(true);
      } catch (error) {
        console.error("Error checking admin status:", error);
        navigate("/chat");
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAdminStatus();
  }, [navigate, toast]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return isAdmin ? <>{children}</> : null;
};
