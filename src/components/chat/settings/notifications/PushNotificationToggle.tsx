import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

interface PushNotificationToggleProps {
  enabled: boolean;
  loading: boolean;
  disabled?: boolean;
  onToggle: (enabled: boolean) => void;
}

export function PushNotificationToggle({ 
  enabled, 
  loading, 
  disabled = false,
  onToggle 
}: PushNotificationToggleProps) {
  const { toast } = useToast();
  const [showHelp, setShowHelp] = useState(false);
  
  // Check if notifications are blocked on component mount
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "denied") {
      setShowHelp(true);
    }
  }, []);
  
  const handleToggle = async (checked: boolean) => {
    console.log("Push notifications toggle clicked:", checked);
    
    // Always call onToggle to update the database preference
    onToggle(checked);
    
    if (!checked) {
      setShowHelp(false);
      toast({
        title: "Notifications Disabled",
        description: "You won't receive any new notifications.",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <label className="text-sm font-medium text-foreground">Push Notifications</label>
          <p className="text-sm text-muted-foreground">
            Get browser notifications for important updates. 
            When disabled, you won't receive any new notifications.
          </p>
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