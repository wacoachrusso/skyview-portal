import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

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
  onPermissionRequest,
}: PushNotificationToggleProps) {
  const { toast } = useToast();
  const [showHelp, setShowHelp] = useState(false);

  const handleToggle = async (checked: boolean) => {
    console.log("Push notifications toggle clicked:", checked);
    
    // If turning off, just do it
    if (!checked) {
      onToggle(false);
      setShowHelp(false);
      toast({
        title: "Notifications Disabled",
        description: "You won't receive any notifications.",
      });
      return;
    }
    
    // If turning on
    if (!("Notification" in window)) {
      toast({
        title: "Notifications Not Supported",
        description: "Your browser doesn't support notifications.",
        variant: "destructive",
      });
      return;
    }

    // Check current permission status
    if (Notification.permission === "granted") {
      // Already have permission, just enable
      onToggle(true);
      toast({
        title: "Notifications Enabled",
        description: "You'll now receive important updates.",
      });
    } else if (Notification.permission === "denied") {
      // Show instructions to enable in browser settings
      setShowHelp(true);
      toast({
        title: "Notifications Blocked",
        description: "Please enable notifications in your browser settings.",
        variant: "destructive",
      });
    } else {
      // Request permission
      onPermissionRequest();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <label className="text-sm font-medium text-foreground">
            Push Notifications
          </label>
          <p className="text-sm text-muted-foreground">
            Get browser notifications for important updates
          </p>
        </div>
        <Switch
          checked={enabled}
          onCheckedChange={handleToggle}
          className="data-[state=checked]:bg-primary"
        />
      </div>

      {showHelp && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Notifications are currently blocked. To enable them:
            <ol className="mt-2 list-decimal list-inside space-y-1">
              <li>Click the lock/info icon in your browser's address bar</li>
              <li>Find "Notifications" in the site settings</li>
              <li>Change the setting from "Block" to "Allow"</li>
              <li>Refresh this page</li>
            </ol>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}