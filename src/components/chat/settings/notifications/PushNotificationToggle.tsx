import { useState } from "react";
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
  onPermissionRequest 
}: PushNotificationToggleProps) {
  const { toast } = useToast();
  const [showHelp, setShowHelp] = useState(false);
  
  const handleToggle = async (checked: boolean) => {
    console.log("Push notifications toggle clicked:", checked);
    
    if (checked) {
      if (!("Notification" in window)) {
        console.log("Browser doesn't support notifications");
        toast({
          title: "Notifications Not Supported",
          description: "Your browser doesn't support notifications. Please try using a modern browser.",
          variant: "destructive",
        });
        return;
      }

      if (Notification.permission === "granted") {
        onToggle(true);
        setShowHelp(false);
      } else if (Notification.permission === "denied") {
        setShowHelp(true);
        toast({
          title: "Notifications Blocked",
          description: "Please enable notifications in your browser settings to receive updates.",
          variant: "destructive",
        });
      } else {
        onPermissionRequest();
      }
    } else {
      onToggle(false);
      setShowHelp(false);
      toast({
        title: "Notifications Disabled",
        description: "You won't receive any notifications.",
      });
    }
  };

  return (
    <div className="space-y-4">
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