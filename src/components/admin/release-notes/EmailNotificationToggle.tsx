
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface EmailNotificationToggleProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export function EmailNotificationToggle({ checked, onCheckedChange }: EmailNotificationToggleProps) {
  return (
    <div className="flex items-center space-x-2">
      <Switch 
        id="email-notification" 
        checked={checked}
        onCheckedChange={onCheckedChange}
      />
      <Label htmlFor="email-notification">Send email notification to subscribers</Label>
    </div>
  );
}
