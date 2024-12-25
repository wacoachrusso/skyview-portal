import { useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

type NotificationToggleProps = {
  notifications: boolean;
  setNotifications: (enabled: boolean) => void;
};

export function NotificationToggle({ notifications, setNotifications }: NotificationToggleProps) {
  const { toast } = useToast();

  useEffect(() => {
    const handleNotificationPermission = async () => {
      if (notifications) {
        console.log("Checking notification permissions...");
        
        // First check if notifications are supported
        if (!("Notification" in window)) {
          console.log("Notifications not supported");
          setNotifications(false);
          toast({
            title: "Notifications Not Supported",
            description: "Your browser doesn't support notifications. You won't receive important updates.",
            variant: "destructive",
          });
          return;
        }

        // Check if permission is already denied
        if (Notification.permission === "denied") {
          console.log("Notifications blocked by browser");
          setNotifications(false);
          toast({
            title: "Important Updates Blocked",
            description: "To receive contract updates, grievance notifications, and other important information, please enable notifications in your browser settings and try again.",
            variant: "destructive",
          });
          return;
        }

        // Request permission only if not already granted
        if (Notification.permission !== "granted") {
          try {
            console.log("Requesting notification permission");
            const permission = await Notification.requestPermission();
            if (permission !== "granted") {
              console.log("Permission denied by user");
              setNotifications(false);
              toast({
                title: "Updates Will Be Missed",
                description: "You won't receive notifications about important contract changes and updates.",
                variant: "destructive",
              });
            } else {
              console.log("Permission granted");
              // Send a test notification
              new Notification("Notifications Enabled", {
                body: "You'll now receive notifications about important contract and grievance updates.",
                icon: "/favicon.ico"
              });
            }
          } catch (error) {
            console.error("Error requesting notification permission:", error);
            setNotifications(false);
            toast({
              title: "Error Enabling Notifications",
              description: "There was a problem enabling notifications. Please try again.",
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
      
      {notifications && (
        <Alert className="bg-white/5 border-white/10">
          <Info className="h-4 w-4 text-white" />
          <AlertDescription className="text-sm text-gray-300">
            You'll receive notifications for:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Contract revisions and amendments</li>
              <li>Grievance status changes</li>
              <li>Important policy updates</li>
              <li>System maintenance notices</li>
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}