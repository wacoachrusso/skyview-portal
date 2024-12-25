import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/components/theme-provider";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

// Font size utility
const FONT_SIZES = {
  small: "text-sm",
  medium: "text-base",
  large: "text-lg"
};

export function ChatSettings() {
  const { theme, setTheme } = useTheme();
  const [fontSize, setFontSize] = useState(() => localStorage.getItem("chat-font-size") || "medium");
  const [notifications, setNotifications] = useState(() => localStorage.getItem("chat-notifications") === "true");
  const [autoSave, setAutoSave] = useState(() => localStorage.getItem("chat-auto-save") !== "false");
  const navigate = useNavigate();
  const { toast } = useToast();

  // Apply font size to the chat container
  useEffect(() => {
    const chatContainer = document.querySelector('.chat-container');
    if (chatContainer) {
      // Remove all font size classes
      Object.values(FONT_SIZES).forEach(size => {
        chatContainer.classList.remove(size);
      });
      // Add the selected font size class
      chatContainer.classList.add(FONT_SIZES[fontSize as keyof typeof FONT_SIZES]);
    }
    localStorage.setItem("chat-font-size", fontSize);
  }, [fontSize]);

  // Handle notifications
  useEffect(() => {
    const handleNotificationPermission = async () => {
      if (notifications) {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          setNotifications(false);
          toast({
            title: "Notification Permission Denied",
            description: "Please enable notifications in your browser settings.",
            variant: "destructive",
          });
        }
      }
    };

    handleNotificationPermission();
    localStorage.setItem("chat-notifications", notifications.toString());
  }, [notifications, toast]);

  // Handle auto-save
  useEffect(() => {
    localStorage.setItem("chat-auto-save", autoSave.toString());
  }, [autoSave]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
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

  const showNotification = (title: string, body: string) => {
    if (notifications && Notification.permission === "granted") {
      new Notification(title, { body });
    }
  };

  // Example of how to trigger a notification (you can use this function where needed)
  const triggerTestNotification = () => {
    if (notifications) {
      showNotification("Test Notification", "Notifications are working!");
    }
  };

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
          {/* Theme Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Theme</label>
            <Select value={theme} onValueChange={(value: "light" | "dark" | "system") => setTheme(value)}>
              <SelectTrigger className="w-full bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent className="bg-[#2A2F3C] border-white/10">
                <SelectItem value="light" className="text-white hover:bg-white/5">Light</SelectItem>
                <SelectItem value="dark" className="text-white hover:bg-white/5">Dark</SelectItem>
                <SelectItem value="system" className="text-white hover:bg-white/5">System</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Font Size */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Font Size</label>
            <Select value={fontSize} onValueChange={setFontSize}>
              <SelectTrigger className="w-full bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Select font size" />
              </SelectTrigger>
              <SelectContent className="bg-[#2A2F3C] border-white/10">
                <SelectItem value="small" className="text-white hover:bg-white/5">Small</SelectItem>
                <SelectItem value="medium" className="text-white hover:bg-white/5">Medium</SelectItem>
                <SelectItem value="large" className="text-white hover:bg-white/5">Large</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notifications */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-sm font-medium text-white">Notifications</label>
              <p className="text-sm text-gray-400">Receive notifications about updates</p>
            </div>
            <Switch
              checked={notifications}
              onCheckedChange={setNotifications}
              className="data-[state=checked]:bg-blue-600"
            />
          </div>

          {/* Auto Save */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-sm font-medium text-white">Auto Save</label>
              <p className="text-sm text-gray-400">Automatically save conversations offline</p>
            </div>
            <Switch
              checked={autoSave}
              onCheckedChange={setAutoSave}
              className="data-[state=checked]:bg-blue-600"
            />
          </div>

          {/* Account Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Account Information</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Email</span>
                <span className="text-sm text-white">user@example.com</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Plan</span>
                <span className="text-sm text-white">Free Trial</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Queries Remaining</span>
                <span className="text-sm text-white">2</span>
              </div>
            </div>
          </div>

          {/* Logout Button */}
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