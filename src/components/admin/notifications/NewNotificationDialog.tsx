import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { NotificationFormFields } from "./NotificationFormFields";

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
    notification_type: "system" as "system" | "update" | "release",
    profile_id: "",
  });

  const handleFieldChange = (field: string, value: any) => {
    setNewNotification((prev) => {
      const updates: any = { [field]: value };
      
      // Sync type and notification_type when notification_type changes
      if (field === "notification_type") {
        updates.type = value;
      }
      
      return { ...prev, ...updates };
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Send New Notification</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <NotificationFormFields
            profiles={profiles}
            notification={newNotification}
            onChange={handleFieldChange}
          />
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={() => onSend(newNotification)}>Send</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};