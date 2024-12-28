import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface NotificationFormFieldsProps {
  profiles: any[];
  notification: {
    title: string;
    message: string;
    notification_type: "system" | "update" | "release";
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
          value={notification.profile_id}
          onValueChange={(value) => onChange("profile_id", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select recipient" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
            {profiles?.map((profile) => (
              <SelectItem key={profile.id} value={profile.id}>
                {profile.full_name || "Unnamed User"} ({profile.email || "No email"})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Type</Label>
        <Select
          value={notification.notification_type}
          onValueChange={(value: "system" | "update" | "release") =>
            onChange("notification_type", value)
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="system">System</SelectItem>
            <SelectItem value="update">Update</SelectItem>
            <SelectItem value="release">Release</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={notification.title}
          onChange={(e) => onChange("title", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <Input
          id="message"
          value={notification.message}
          onChange={(e) => onChange("message", e.target.value)}
        />
      </div>
    </div>
  );
};