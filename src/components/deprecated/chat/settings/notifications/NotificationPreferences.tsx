import { useState } from "react";
import { useNotificationPreferences } from "./hooks/useNotificationPreferences";
import { PushNotificationToggle } from "./PushNotificationToggle";
import { NotificationDescription } from "./NotificationDescription";
import { useToast } from "@/hooks/use-toast";

export function NotificationPreferences() {
  const { preferences, loading, savePreferences } = useNotificationPreferences();
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const { toast } = useToast();

  const handlePushToggle = async (checked: boolean) => {
    try {
      await savePreferences(checked);
    } catch (error) {
      console.error("Failed to toggle push notifications:", error);
    }
  };

  const handlePermissionRequest = async () => {
    console.log("Requesting notification permission...");
    try {
      const permission = await Notification.requestPermission();
      console.log("Permission result:", permission);
  
      if (permission === "granted") {
        console.log("Permission granted, enabling notifications");
        await savePreferences(true);
        setShowPermissionDialog(false);
        new Notification("Notifications Enabled", {
          body: "You'll now receive important updates and notifications.",
          icon: "/favicon.ico",
        });
      } else {
        console.log("Permission denied, disabling notifications");
        await savePreferences(false);
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
          onToggle={handlePushToggle}
          onPermissionRequest={handlePermissionRequest}
        />
      </div>
      
      {preferences.pushNotifications && (
        <NotificationDescription 
          showPermissionDialog={showPermissionDialog}
          setShowPermissionDialog={setShowPermissionDialog}
          onConfirmPermission={handlePermissionRequest}
        />
      )}
    </div>
  );
}