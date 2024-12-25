import { useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

type NotificationToggleProps = {
  notifications: boolean;
  setNotifications: (enabled: boolean) => void;
};

export function NotificationToggle({ notifications, setNotifications }: NotificationToggleProps) {
  const { toast } = useToast();

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
  }, [notifications, setNotifications, toast]);

  return (
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
  );
}