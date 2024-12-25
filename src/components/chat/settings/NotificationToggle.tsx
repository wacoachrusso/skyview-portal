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
        // First check if notifications are supported
        if (!("Notification" in window)) {
          setNotifications(false);
          toast({
            title: "Notifications Not Supported",
            description: "Your browser doesn't support notifications",
            variant: "destructive",
          });
          return;
        }

        // Check if permission is already denied
        if (Notification.permission === "denied") {
          setNotifications(false);
          toast({
            title: "Notifications Blocked",
            description: "Please enable notifications in your browser settings to receive updates",
            variant: "destructive",
          });
          return;
        }

        // Request permission only if not already granted
        if (Notification.permission !== "granted") {
          try {
            const permission = await Notification.requestPermission();
            if (permission !== "granted") {
              setNotifications(false);
              toast({
                title: "Notifications Permission Denied",
                description: "You won't receive notifications about updates",
                variant: "destructive",
              });
            }
          } catch (error) {
            console.error("Error requesting notification permission:", error);
            setNotifications(false);
            toast({
              title: "Error Enabling Notifications",
              description: "There was a problem enabling notifications",
              variant: "destructive",
            });
          }
        }
      }
    };

    handleNotificationPermission();
    localStorage.setItem("chat-notifications", notifications.toString());
  }, [notifications, setNotifications, toast]);

  const handleToggle = async (checked: boolean) => {
    if (checked && Notification.permission === "denied") {
      toast({
        title: "Notifications Blocked",
        description: "Please enable notifications in your browser settings and try again",
        variant: "destructive",
      });
      return;
    }
    setNotifications(checked);
  };

  return (
    <div className="flex items-center justify-between">
      <div className="space-y-0.5">
        <label className="text-sm font-medium text-white">Notifications</label>
        <p className="text-sm text-gray-400">Receive notifications about updates</p>
      </div>
      <Switch
        checked={notifications}
        onCheckedChange={handleToggle}
        className="data-[state=checked]:bg-primary"
      />
    </div>
  );
}