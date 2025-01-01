import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function LogoutButton() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      console.log("Starting logout process...");
      localStorage.clear();
      
      // Sign out from all sessions, not just the current one
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      if (error) {
        console.error("Error during signOut:", error);
        throw error;
      }
      
      console.log("Sign out successful, redirecting to login page...");
      navigate("/login", { replace: true });
      
      toast({
        title: "Logged out successfully",
        description: "You have been logged out from all devices",
      });
    } catch (error) {
      console.error("Error in logout process:", error);
      // Even if there's an error, we should clean up and redirect
      navigate("/login", { replace: true });
      
      toast({
        title: "Session ended",
        description: "Your session has been cleared",
        variant: "default",
      });
    }
  };

  return (
    <Button
      variant="destructive"
      className="w-full mt-6"
      onClick={handleLogout}
    >
      <LogOut className="w-4 h-4 mr-2" />
      Log Out
    </Button>
  );
}