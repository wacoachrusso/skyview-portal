
import { useState, useEffect } from "react";
import { useNotifications } from "@/hooks/useNotifications";
import { supabase } from "@/integrations/supabase/client";

export const useNotificationState = () => {
  const [open, setOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const { notifications, deleteNotification, refetchNotifications } = useNotifications();
  const unreadCount = notifications?.filter((n) => !n.is_read).length || 0;

  useEffect(() => {
    if (open && notifications?.length > 0) {
      markNotificationsAsRead();
    }
  }, [open, notifications]);

  const markNotificationsAsRead = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      console.log("Marking notifications as read");
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) {
        console.error("Error marking notifications as read:", error);
        throw error;
      }

      await refetchNotifications();
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  const handleDelete = async (id: string) => {
    console.log("Deleting notification:", id);
    try {
      await deleteNotification(id);
      setSelectedNotification(null);
      await refetchNotifications();
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const handleNotificationClick = (notification: any) => {
    console.log("Opening notification details:", notification);
    setSelectedNotification(notification);
    setOpen(false);
  };

  return {
    open,
    setOpen,
    selectedNotification,
    setSelectedNotification,
    notifications,
    unreadCount,
    handleDelete,
    handleNotificationClick,
  };
};
