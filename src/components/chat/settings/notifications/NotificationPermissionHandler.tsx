import { useToast } from "@/hooks/use-toast";

interface NotificationPermissionHandlerProps {
  setNotifications: (enabled: boolean) => void;
}

export async function handleNotificationPermission({ setNotifications }: NotificationPermissionHandlerProps) {
  const { toast } = useToast();
  
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
    return false;
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
    return false;
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
        return false;
      } else {
        console.log("Permission granted");
        // Send a test notification
        new Notification("Notifications Enabled", {
          body: "You'll now receive notifications about important contract and grievance updates.",
          icon: "/favicon.ico"
        });
        return true;
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      setNotifications(false);
      toast({
        title: "Error Enabling Notifications",
        description: "There was a problem enabling notifications. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  }
  
  return true;
}