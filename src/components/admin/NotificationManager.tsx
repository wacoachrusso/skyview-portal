import { useState } from "react";
import { Button } from "@/components/ui/button";
import { NotificationTable } from "./notifications/NotificationTable";
import { NotificationDialog } from "./notifications/NotificationDialog";
import { NewNotificationDialog } from "./notifications/NewNotificationDialog";
import { useNotifications } from "@/hooks/useNotifications";
import { useToast } from "@/hooks/use-toast";

export const NotificationManager = () => {
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const [showNewNotificationDialog, setShowNewNotificationDialog] = useState(false);
  const { notifications, profiles, sendNotification, deleteNotification, refetchNotifications } = useNotifications();
  const { toast } = useToast();

  const handleSendNotification = async (notification: any) => {
    console.log("Sending notification:", notification);
    const success = await sendNotification(notification);
    if (success) {
      toast({
        title: "Success",
        description: "Notification sent successfully to all devices",
      });
      setShowNewNotificationDialog(false);
      refetchNotifications();
    }
  };

  const handleDeleteNotification = async (id: string) => {
    await deleteNotification(id);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Notification History</h2>
          <p className="text-sm text-muted-foreground">
            Send updates and alerts to all devices including mobile and tablet
          </p>
        </div>
        <Button onClick={() => setShowNewNotificationDialog(true)}>
          Send New Notification
        </Button>
      </div>

      <NotificationTable
        notifications={notifications || []}
        onViewDetails={setSelectedNotification}
        onDelete={handleDeleteNotification}
      />

      <NotificationDialog
        notification={selectedNotification}
        open={!!selectedNotification}
        onOpenChange={(open) => !open && setSelectedNotification(null)}
      />

      <NewNotificationDialog
        profiles={profiles || []}
        open={showNewNotificationDialog}
        onOpenChange={setShowNewNotificationDialog}
        onSend={handleSendNotification}
      />
    </div>
  );
};