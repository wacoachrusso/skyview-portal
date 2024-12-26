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
      console.log("Attempting to sign out...");
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      console.log("Sign out successful, clearing local storage...");
      localStorage.removeItem("sb-xnlzqsoujwsffoxhhybk-auth-token");
      
      console.log("Redirecting to home page...");
      navigate("/");
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account",
      });
    } catch (error) {
      console.error("Error logging out:", error);
      toast({
        title: "Error logging out",
        description: "There was a problem logging out. Please try again.",
        variant: "destructive",
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