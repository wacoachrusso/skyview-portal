import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { NotificationDescription } from "./notifications/NotificationDescription";

type NotificationToggleProps = {
  notifications: boolean;
  setNotifications: (enabled: boolean) => void;
};

export function NotificationToggle({ notifications, setNotifications }: NotificationToggleProps) {
  const { toast } = useToast();
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);

  useEffect(() => {
    localStorage.setItem("chat-notifications", notifications.toString());
  }, [notifications]);

  const handlePermissionRequest = async () => {
    console.log("Requesting notification permission...");
    try {
      const permission = await Notification.requestPermission();
      console.log("Permission result:", permission);
      
      if (permission === "granted") {
        console.log("Permission granted, enabling notifications");
        setNotifications(true);
        setShowPermissionDialog(false);
        new Notification("Notifications Enabled", {
          body: "You'll now receive important updates and notifications.",
          icon: "/favicon.ico"
        });
      } else {
        console.log("Permission denied, disabling notifications");
        setNotifications(false);
        toast({
          title: "Notifications Blocked",
          description: "Please allow notifications in your browser settings to receive important updates.",
          variant: "destructive",
          duration: 2000,
        });
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      setNotifications(false);
      toast({
        title: "Notification Error",
        description: "There was a problem enabling notifications. Please try again.",
        variant: "destructive",
        duration: 2000,
      });
    }
  };

  const handleToggle = (checked: boolean) => {
    console.log("Notification toggle clicked:", checked);
    
    if (checked) {
      if (!("Notification" in window)) {
        console.log("Browser doesn't support notifications");
        toast({
          title: "Notifications Not Supported",
          description: "Your browser doesn't support notifications",
          variant: "destructive",
          duration: 2000,
        });
        setNotifications(false);
        return;
      }

      // Show permission dialog instead of requesting directly
      setShowPermissionDialog(true);
    } else {
      console.log("Notifications disabled by user");
      setNotifications(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <label className="text-sm font-medium text-white">Important Updates</label>
          <p className="text-sm text-gray-400">Get notified about critical changes and updates</p>
        </div>
        <Switch
          checked={notifications}
          onCheckedChange={handleToggle}
          className="data-[state=checked]:bg-primary"
        />
      </div>
      
      {notifications && (
        <NotificationDescription 
          showPermissionDialog={showPermissionDialog}
          setShowPermissionDialog={setShowPermissionDialog}
          onConfirmPermission={handlePermissionRequest}
        />
      )}
    </div>
  );
}