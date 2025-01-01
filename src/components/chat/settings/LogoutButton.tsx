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
      
      // First check if we still have a valid session
      const { data: { session } } = await supabase.auth.getSession();
      console.log("Current session status:", session ? "Active" : "No session");

      if (session) {
        // Only attempt to sign out if we have a session
        const { error } = await supabase.auth.signOut({ scope: 'local' });
        if (error) {
          console.error("Error during signOut:", error);
          // Even if there's an error, we should clean up local state
          navigate("/login", { replace: true });
          return;
        }
      } else {
        console.log("No active session found, proceeding with cleanup...");
      }
      
      console.log("Redirecting to login page...");
      navigate("/login", { replace: true });
      
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account",
      });
    } catch (error) {
      console.error("Error in logout process:", error);
      // Even if there's an error, we should redirect to login
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