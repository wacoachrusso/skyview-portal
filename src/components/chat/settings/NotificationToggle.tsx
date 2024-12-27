import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { NotificationDescription } from "./notifications/NotificationDescription";

type NotificationToggleProps = {
  notifications: boolean;
  setNotifications: (enabled: boolean) => void;
};

export function NotificationToggle({ notifications, setNotifications }: NotificationToggleProps) {
  const { toast } = useToast();
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load user preferences
    const loadPreferences = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('email_notifications, push_notifications')
          .eq('id', user.id)
          .single();
          
        if (profile) {
          console.log("Loaded notification preferences:", profile);
          setEmailNotifications(profile.email_notifications ?? true);
          setPushNotifications(profile.push_notifications ?? true);
          setNotifications(profile.push_notifications ?? true);
        }
      }
    };
    loadPreferences();
  }, []);

  const savePreferences = async (emailEnabled: boolean, pushEnabled: boolean) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { error } = await supabase
        .from('profiles')
        .update({
          email_notifications: emailEnabled,
          push_notifications: pushEnabled
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Preferences Updated",
        description: "Your notification preferences have been saved.",
      });
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast({
        title: "Error",
        description: "Failed to save preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailToggle = async (checked: boolean) => {
    setEmailNotifications(checked);
    await savePreferences(checked, pushNotifications);
  };

  const handlePushToggle = async (checked: boolean) => {
    console.log("Push notifications toggle clicked:", checked);
    
    if (checked) {
      if (!("Notification" in window)) {
        console.log("Browser doesn't support notifications");
        toast({
          title: "Notifications Not Supported",
          description: "Your browser doesn't support notifications",
          variant: "destructive",
        });
        setPushNotifications(false);
        return;
      }

      if (Notification.permission === "granted") {
        setPushNotifications(true);
        await savePreferences(emailNotifications, true);
      } else if (Notification.permission === "denied") {
        toast({
          title: "Notifications Blocked",
          description: "Please enable notifications in your browser settings.",
          variant: "destructive",
        });
        setPushNotifications(false);
      } else {
        setShowPermissionDialog(true);
      }
    } else {
      console.log("Notifications disabled by user");
      setPushNotifications(false);
      await savePreferences(emailNotifications, false);
      toast({
        title: "Notifications Disabled",
        description: "You won't receive any notifications.",
      });
    }
  };

  const handlePermissionRequest = async () => {
    console.log("Requesting notification permission...");
    try {
      const permission = await Notification.requestPermission();
      console.log("Permission result:", permission);
      
      if (permission === "granted") {
        console.log("Permission granted, enabling notifications");
        setPushNotifications(true);
        setShowPermissionDialog(false);
        await savePreferences(emailNotifications, true);
        new Notification("Notifications Enabled", {
          body: "You'll now receive important updates and notifications.",
          icon: "/favicon.ico"
        });
      } else {
        console.log("Permission denied, disabling notifications");
        setPushNotifications(false);
        toast({
          title: "Notifications Blocked",
          description: "Please allow notifications in your browser settings to receive important updates.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      setPushNotifications(false);
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
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <label className="text-sm font-medium text-foreground">Email Notifications</label>
            <p className="text-sm text-muted-foreground">Receive updates and notifications via email</p>
          </div>
          <Switch
            checked={emailNotifications}
            onCheckedChange={handleEmailToggle}
            disabled={loading}
            className="data-[state=checked]:bg-primary"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <label className="text-sm font-medium text-foreground">Push Notifications</label>
            <p className="text-sm text-muted-foreground">Get browser notifications for important updates</p>
          </div>
          <Switch
            checked={pushNotifications}
            onCheckedChange={handlePushToggle}
            disabled={loading}
            className="data-[state=checked]:bg-primary"
          />
        </div>
      </div>
      
      {pushNotifications && (
        <NotificationDescription 
          showPermissionDialog={showPermissionDialog}
          setShowPermissionDialog={setShowPermissionDialog}
          onConfirmPermission={handlePermissionRequest}
        />
      )}
    </div>
  );
}