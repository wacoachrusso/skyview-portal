import { Checkbox } from "@/components/ui/checkbox";

interface EmailNotificationToggleProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export const EmailNotificationToggle = ({
  checked,
  onCheckedChange,
}: EmailNotificationToggleProps) => {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        id="sendEmail"
        checked={checked}
        onCheckedChange={(checked) => onCheckedChange(checked as boolean)}
      />
      <label
        htmlFor="sendEmail"
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        Send email notification to subscribed users
      </label>
    </div>
  );
};