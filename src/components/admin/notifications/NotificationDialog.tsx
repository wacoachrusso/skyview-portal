import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface NotificationDialogProps {
  notification: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NotificationDialog = ({
  notification,
  open,
  onOpenChange,
}: NotificationDialogProps) => {
  if (!notification) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Notification Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <h4 className="text-sm font-medium mb-1">Title</h4>
            <p className="text-sm text-muted-foreground">
              {notification?.title}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-1">Message</h4>
            <p className="text-sm text-muted-foreground">
              {notification?.message}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-1">Recipient</h4>
            <p className="text-sm text-muted-foreground">
              {notification.profile_id === "all" 
                ? "All Users"
                : (notification?.profiles as any)?.full_name || "N/A"}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-1">Type</h4>
            <Badge variant="outline">{notification?.type}</Badge>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-1">Status</h4>
            <Badge
              variant={notification?.is_read ? "secondary" : "default"}
            >
              {notification?.is_read ? "Read" : "Unread"}
            </Badge>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-1">Sent At</h4>
            <p className="text-sm text-muted-foreground">
              {notification &&
                format(
                  new Date(notification.created_at),
                  "MMM d, yyyy HH:mm:ss"
                )}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};