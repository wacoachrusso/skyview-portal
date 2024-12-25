import { useToast } from "@/hooks/use-toast";

interface NotificationPermissionHandlerProps {
  setNotifications: (enabled: boolean) => void;
}

export async function handleNotificationPermission({ setNotifications }: NotificationPermissionHandlerProps) {
  const { toast } = useToast();
  
  console.log("Checking notification permissions...");
  
  if (!("Notification" in window)) {
    console.log("Notifications not supported");
    setNotifications(false);
    toast({
      title: "Important Updates Blocked",
      description: "Your browser doesn't support notifications",
      variant: "destructive",
    });
    return false;
  }

  if (Notification.permission === "denied") {
    console.log("Notifications blocked by browser");
    setNotifications(false);
    toast({
      title: "Important Updates Blocked",
      description: "To receive notifications, please enable them in your browser settings and try again.",
      variant: "destructive",
    });
    return false;
  }

  try {
    console.log("Requesting notification permission");
    const permission = await Notification.requestPermission();
    
    if (permission !== "granted") {
      console.log("Permission denied by user");
      setNotifications(false);
      toast({
        title: "Important Updates Blocked",
        description: "To receive notifications, please enable them in your browser settings and try again.",
        variant: "destructive",
      });
      return false;
    }
    
    console.log("Permission granted");
    new Notification("Notifications Enabled", {
      body: "You'll now receive important updates and notifications.",
      icon: "/favicon.ico"
    });
    return true;
    
  } catch (error) {
    console.error("Error requesting notification permission:", error);
    setNotifications(false);
    toast({
      title: "Important Updates Blocked",
      description: "To receive notifications, please enable them in your browser settings and try again.",
      variant: "destructive",
    });
    return false;
  }
}