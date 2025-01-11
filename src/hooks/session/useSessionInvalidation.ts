import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useSessionInvalidation = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSessionInvalidation = async (message: string) => {
    console.log('Handling session invalidation:', message);
    
    // Clear all local storage except refresh token
    const refreshToken = localStorage.getItem('supabase.refresh-token');
    localStorage.clear();
    if (refreshToken) {
      localStorage.setItem('supabase.refresh-token', refreshToken);
    }
    
    try {
      await supabase.auth.signOut();
      toast({
        variant: "default",
        title: "Session Ended",
        description: message
      });
    } catch (error) {
      console.error('Error during forced signout:', error);
    }
    
    navigate('/login', { replace: true });
  };

  return {
    handleSessionInvalidation
  };
};