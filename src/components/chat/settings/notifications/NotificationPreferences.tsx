import { useState, useEffect } from "react";
import { useNotificationPreferences } from "./hooks/useNotificationPreferences";
import { PushNotificationToggle } from "./PushNotificationToggle";
import { NotificationDescription } from "./NotificationDescription";
import { useToast } from "@/hooks/use-toast";

export function NotificationPreferences() {
  const { preferences, loading, savePreferences } = useNotificationPreferences();
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [canEnableNotifications, setCanEnableNotifications] = useState(true);
  const { toast } = useToast();

  // Check notification permission on component mount
  useEffect(() => {
    if ("Notification" in window) {
      if (Notification.permission === "denied") {
        setCanEnableNotifications(false);
      }
    } else {
      setCanEnableNotifications(false);
    }
  }, []);

  const handlePushToggle = async (checked: boolean) => {
    console.log("Push toggle:", checked);
    
    if (checked) {
      // User wants to enable notifications
      if (!("Notification" in window)) {
        toast({
          title: "Notifications Not Supported",
          description: "Your browser doesn't support notifications",
          variant: "destructive",
        });
        return;
      }

      if (Notification.permission === "granted") {
        // Already has permission, just save preference
        await savePreferences(true);
      } else if (Notification.permission === "denied") {
        // Permission previously denied
        toast({
          title: "Notifications Blocked",
          description: "Please enable notifications in your browser settings.",
          variant: "destructive",
        });
        setCanEnableNotifications(false);
      } else {
        // Need to request permission
        setShowPermissionDialog(true);
      }
    } else {
      // User wants to disable notifications
      await savePreferences(false);
      toast({
        title: "Notifications Disabled",
        description: "You won't receive any new notifications.",
      });
    }
  };

  const handlePermissionRequest = async () => {
    try {
      const permission = await Notification.requestPermission();
      
      if (permission === "granted") {
        await savePreferences(true);
        setShowPermissionDialog(false);
        new Notification("Notifications Enabled", {
          body: "You'll now receive important updates and notifications.",
          icon: "/favicon.ico"
        });
      } else {
        setCanEnableNotifications(false);
        toast({
          title: "Notifications Blocked",
          description: "Please allow notifications in your browser settings to receive important updates.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      toast({
        title: "Notification Error",
        description: "There was a problem enabling notifications. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <PushNotificationToggle
          enabled={preferences.pushNotifications}
          loading={loading}
          disabled={!canEnableNotifications && !preferences.pushNotifications}
          onToggle={handlePushToggle}
        />
      </div>
      
      {showPermissionDialog && (
        <NotificationDescription 
          showPermissionDialog={showPermissionDialog}
          setShowPermissionDialog={setShowPermissionDialog}
          onConfirmPermission={handlePermissionRequest}
        />
      )}
    </div>
  );
}