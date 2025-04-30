import { Switch } from "@/components/ui/switch";

interface EmailNotificationToggleProps {
  enabled: boolean;
  loading: boolean;
  onToggle: (enabled: boolean) => void;
}

export function EmailNotificationToggle({ enabled, loading, onToggle }: EmailNotificationToggleProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-0.5">
        <label className="text-sm font-medium text-foreground">Email Notifications</label>
        <p className="text-sm text-muted-foreground">Receive updates and notifications via email</p>
      </div>
      <Switch
        checked={enabled}
        onCheckedChange={onToggle}
        disabled={loading}
        className="data-[state=checked]:bg-primary"
      />
    </div>
  );
}