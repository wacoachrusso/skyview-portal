import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface NewNotificationDialogProps {
  profiles: any[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSend: (notification: any) => void;
}

export const NewNotificationDialog = ({
  profiles,
  open,
  onOpenChange,
  onSend,
}: NewNotificationDialogProps) => {
  const [newNotification, setNewNotification] = useState({
    title: "",
    message: "",
    type: "system",
    profile_id: "",
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Send New Notification</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="recipient">Recipient</Label>
            <Select
              value={newNotification.profile_id}
              onValueChange={(value) =>
                setNewNotification({ ...newNotification, profile_id: value })
              }
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
              value={newNotification.type}
              onValueChange={(value) =>
                setNewNotification({ ...newNotification, type: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="system">System</SelectItem>
                <SelectItem value="alert">Alert</SelectItem>
                <SelectItem value="update">Update</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={newNotification.title}
              onChange={(e) =>
                setNewNotification({
                  ...newNotification,
                  title: e.target.value,
                })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Input
              id="message"
              value={newNotification.message}
              onChange={(e) =>
                setNewNotification({
                  ...newNotification,
                  message: e.target.value,
                })
              }
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button onClick={() => onSend(newNotification)}>Send</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};