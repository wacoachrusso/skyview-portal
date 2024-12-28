import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type NotificationType = "system" | "update" | "release";

interface NotificationFormFieldsProps {
  profiles: any[];
  notification: {
    title: string;
    message: string;
    notification_type: NotificationType;
    profile_id: string;
  };
  onChange: (field: string, value: any) => void;
}

export const NotificationFormFields = ({
  profiles,
  notification,
  onChange,
}: NotificationFormFieldsProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="recipient">Recipient</Label>
        <Select
          value={notification.profile_id || undefined}
          onValueChange={(value) => onChange("profile_id", value)}
        >
          <SelectTrigger className="bg-background border-input">
            <SelectValue placeholder="Select recipient" />
          </SelectTrigger>
          <SelectContent className="bg-background border-2 border-input shadow-lg">
            <SelectItem value="all" className="hover:bg-accent">All Users</SelectItem>
            {profiles?.map((profile) => (
              <SelectItem 
                key={profile.id} 
                value={profile.id}
                className="hover:bg-accent"
              >
                {profile.full_name || "Unnamed User"} ({profile.email || "No email"})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={notification.title}
          onChange={(e) => onChange("title", e.target.value)}
          className="bg-background"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <Input
          id="message"
          value={notification.message}
          onChange={(e) => onChange("message", e.target.value)}
          className="bg-background"
        />
      </div>
    </div>
  );
};