import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

interface PushNotificationToggleProps {
  enabled: boolean;
  loading: boolean;
  onToggle: (enabled: boolean) => void;
  onPermissionRequest: () => void;
}

export function PushNotificationToggle({ 
  enabled, 
  loading, 
  onToggle,
  onPermissionRequest 
}: PushNotificationToggleProps) {
  const { toast } = useToast();
  
  const handleToggle = async (checked: boolean) => {
    console.log("Push notifications toggle clicked:", checked);
    
    if (checked) {
      if (!("Notification" in window)) {
        console.log("Browser doesn't support notifications");
        toast({
          title: "Notifications Not Supported",
          description: "Your browser doesn't support notifications",
          variant: "destructive",
        });
        return;
      }

      if (Notification.permission === "granted") {
        onToggle(true);
      } else if (Notification.permission === "denied") {
        toast({
          title: "Notifications Blocked",
          description: "Please enable notifications in your browser settings.",
          variant: "destructive",
        });
      } else {
        onPermissionRequest();
      }
    } else {
      onToggle(false);
      toast({
        title: "Notifications Disabled",
        description: "You won't receive any notifications.",
      });
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div className="space-y-0.5">
        <label className="text-sm font-medium text-foreground">Push Notifications</label>
        <p className="text-sm text-muted-foreground">Get browser notifications for important updates</p>
      </div>
      <Switch
        checked={enabled}
        onCheckedChange={handleToggle}
        disabled={loading}
        className="data-[state=checked]:bg-primary"
      />
    </div>
  );
}