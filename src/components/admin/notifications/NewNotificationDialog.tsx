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
  profile_id: string;
  type: NotificationType;
  notification_type: NotificationType;
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
    profile_id: "",
    type: "system",
    notification_type: "system",
  });

  const handleFieldChange = (field: string, value: any) => {
    if (field === "notification_type") {
      setNewNotification((prev) => ({ 
        ...prev, 
        [field]: value,
        type: value // Keep type and notification_type in sync
      }));
    } else {
      setNewNotification((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleSend = () => {
    onSend(newNotification);
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