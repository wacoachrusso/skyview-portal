
import { useSessionCheck } from "./useSessionCheck";
import { useAuthState } from "./useAuthState";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

export const useAuthManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isLoading: sessionLoading } = useSessionCheck();
  const { userEmail } = useAuthState();
  const [isLoading, setIsLoading] = useState(sessionLoading);

  // Add a safety mechanism to prevent indefinite loading
  useEffect(() => {
    let timeoutId: number;
    
    if (sessionLoading) {
      timeoutId = window.setTimeout(() => {
        setIsLoading(false);
      }, 3000); // 3-second safety timeout
    } else {
      setIsLoading(sessionLoading);
    }
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, [sessionLoading]);

  const handleSignOut = async () => {
    try {
      console.log("Starting sign out process");
      
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      if (error) {
        console.error("Error during sign out:", error);
        throw error;
      }
      
      console.log("Sign out successful");
      localStorage.clear();
      
      toast({
        title: "Signed out successfully",
        description: "You have been logged out of your account.",
      });
      
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      localStorage.clear();
      navigate('/login');
      
      toast({
        title: "Error signing out",
        description: "There was a problem signing out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return { userEmail, isLoading, handleSignOut };
};
