import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface NotificationDialogProps {
  notification: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NotificationDialog = ({ notification, open, onOpenChange }: NotificationDialogProps) => {
  if (!notification) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{notification.title}</DialogTitle>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          <div className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
            {notification.message}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {format(new Date(notification.created_at), "MMMM d, yyyy HH:mm")}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};