import { useState } from "react";
import { Button } from "@/components/ui/button";
import { NotificationTable } from "./notifications/NotificationTable";
import { NotificationDialog } from "./notifications/NotificationDialog";
import { NewNotificationDialog } from "./notifications/NewNotificationDialog";
import { useNotifications } from "@/hooks/useNotifications";

export const NotificationManager = () => {
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const [showNewNotificationDialog, setShowNewNotificationDialog] = useState(false);
  const { notifications, profiles, sendNotification, refetchNotifications } = useNotifications();

  const handleSendNotification = async (notification: any) => {
    const success = await sendNotification(notification);
    if (success) {
      setShowNewNotificationDialog(false);
      refetchNotifications();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Notification History</h2>
        <Button onClick={() => setShowNewNotificationDialog(true)}>
          Send New Notification
        </Button>
      </div>

      <NotificationTable
        notifications={notifications || []}
        onViewDetails={setSelectedNotification}
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