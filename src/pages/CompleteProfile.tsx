
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const CompleteProfile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkUserStatus = async () => {
      console.log("Checking user status...");
      
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          console.log("No authenticated user found");
          navigate('/login');
          return;
        }

        console.log("Redirecting to account page for profile completion");
        navigate('/account');
        
      } catch (error) {
        console.error("Error checking user status:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to check user status. Please try again.",
        });
        navigate('/login');
      }
    };

    checkUserStatus();
  }, [navigate, toast]);

  return null; // This component just handles redirection
};

export default CompleteProfile;
