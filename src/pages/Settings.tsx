import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ThemeSelector } from "@/components/chat/settings/ThemeSelector";
import { NotificationToggle } from "@/components/chat/settings/NotificationToggle";
import { AutoSaveToggle } from "@/components/chat/settings/AutoSaveToggle";
import { FontSizeSelector } from "@/components/chat/settings/FontSizeSelector";
import { AccountInfo } from "@/components/chat/settings/AccountInfo";
import { useTheme } from "@/components/theme-provider";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const { theme, setTheme } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [fontSize, setFontSize] = useState("medium");

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log('No active session, redirecting to login');
        navigate('/login');
      } else {
        setUserEmail(session.user.email);
      }
    };

    checkAuth();

    // Load saved preferences
    const savedFontSize = localStorage.getItem("chat-font-size") || "medium";
    const savedAutoSave = localStorage.getItem("chat-auto-save") === "true";
    setFontSize(savedFontSize);
    setAutoSave(savedAutoSave);
  }, [navigate]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Signed out successfully",
        description: "You have been logged out of your account.",
      });
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Error signing out",
        description: "There was a problem signing out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A1F2C] to-[#2A2F3C]">
      <DashboardHeader userEmail={userEmail} onSignOut={handleSignOut} />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card className="bg-[#2A2F3C] border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Account Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <AccountInfo />
              <Separator className="bg-white/10" />
              
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-white">Appearance</h3>
                <ThemeSelector currentTheme={theme} onThemeChange={setTheme} />
                <FontSizeSelector fontSize={fontSize} setFontSize={setFontSize} />
              </div>
              
              <Separator className="bg-white/10" />
              
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-white">Notifications</h3>
                <NotificationToggle 
                  notifications={notifications} 
                  setNotifications={setNotifications} 
                />
              </div>
              
              <Separator className="bg-white/10" />
              
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-white">Data Management</h3>
                <AutoSaveToggle autoSave={autoSave} setAutoSave={setAutoSave} />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Settings;