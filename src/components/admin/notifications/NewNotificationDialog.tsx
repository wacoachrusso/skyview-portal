import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { NotificationFormFields } from "./NotificationFormFields";

type NotificationType = "system" | "update" | "release";

interface NotificationData {
  title: string;
  message: string;
  type: NotificationType;
  notification_type: NotificationType;
  profile_id: string;
}

interface NewNotificationDialogProps {
  profiles: any[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSend: (notification: NotificationData) => void;
}

export const NewNotificationDialog = ({
  profiles,
  open,
  onOpenChange,
  onSend,
}: NewNotificationDialogProps) => {
  const [newNotification, setNewNotification] = useState<NotificationData>({
    title: "",
    message: "",
    type: "system",
    notification_type: "system",
    profile_id: "",
  });

  const handleFieldChange = (field: string, value: any) => {
    setNewNotification((prev) => {
      const updates: Partial<NotificationData> = { [field]: value };
      
      // Sync type and notification_type when either changes
      if (field === "notification_type" || field === "type") {
        const notificationType = value as NotificationType;
        updates.type = notificationType;
        updates.notification_type = notificationType;
      }
      
      return { ...prev, ...updates };
    });
  };

  const handleSend = () => {
    // Ensure both type fields are set correctly
    const notification = {
      ...newNotification,
      type: newNotification.notification_type,
    };
    onSend(notification);
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
            <Button onClick={handleSend}>Send</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};