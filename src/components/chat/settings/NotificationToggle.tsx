import { useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { NotificationDescription } from "./notifications/NotificationDescription";
import { handleNotificationPermission } from "./notifications/NotificationPermissionHandler";

type NotificationToggleProps = {
  notifications: boolean;
  setNotifications: (enabled: boolean) => void;
};

export function NotificationToggle({ notifications, setNotifications }: NotificationToggleProps) {
  const { toast } = useToast();

  useEffect(() => {
    if (notifications) {
      handleNotificationPermission({ setNotifications });
    }
    localStorage.setItem("chat-notifications", notifications.toString());
  }, [notifications, setNotifications]);

  const handleToggle = async (checked: boolean) => {
    if (checked && Notification.permission === "denied") {
      console.log("Attempting to enable notifications while blocked");
      toast({
        title: "Important Updates Blocked",
        description: "To receive notifications, please enable them in your browser settings and try again.",
        variant: "destructive",
      });
      return;
    }
    setNotifications(checked);
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
      
      {notifications && <NotificationDescription />}
    </div>
  );
}