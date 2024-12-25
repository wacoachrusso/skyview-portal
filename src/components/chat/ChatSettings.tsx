import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { ThemeSelector } from "./settings/ThemeSelector";
import { FontSizeSelector } from "./settings/FontSizeSelector";
import { NotificationToggle } from "./settings/NotificationToggle";
import { AutoSaveToggle } from "./settings/AutoSaveToggle";
import { AccountInfo } from "./settings/AccountInfo";

export function ChatSettings() {
  const [fontSize, setFontSize] = useState(() => localStorage.getItem("chat-font-size") || "medium");
  const [notifications, setNotifications] = useState(() => localStorage.getItem("chat-notifications") === "true");
  const [autoSave, setAutoSave] = useState(() => localStorage.getItem("chat-auto-save") !== "false");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      console.log("Attempting to sign out...");
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      console.log("Sign out successful, clearing local storage...");
      // Clear any stored tokens or user data
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

  // Check auth status when component mounts
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log("No active session in settings, redirecting to login");
        navigate('/login');
      }
    };

    checkSession();
  }, [navigate]);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/10"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] bg-gradient-to-b from-[#1E1E2E] to-[#2A2F3C] border-l border-white/10">
        <SheetHeader>
          <SheetTitle className="text-2xl font-bold text-white">Settings</SheetTitle>
        </SheetHeader>
        
        <div className="mt-6 space-y-6">
          <ThemeSelector />
          <FontSizeSelector fontSize={fontSize} setFontSize={setFontSize} />
          <NotificationToggle notifications={notifications} setNotifications={setNotifications} />
          <AutoSaveToggle autoSave={autoSave} setAutoSave={setAutoSave} />
          <AccountInfo />

          <Button
            variant="destructive"
            className="w-full mt-6"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Log Out
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}