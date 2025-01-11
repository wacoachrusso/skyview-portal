import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useNotifications } from "@/hooks/useNotifications";
import { NotificationDialog } from "./notifications/NotificationDialog";
import { NotificationItem } from "./notifications/NotificationItem";
import { supabase } from "@/integrations/supabase/client";

export const NotificationBell = () => {
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

  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-2 -right-2 h-4 w-4 rounded-full p-0 flex items-center justify-center text-xs"
              >
                {unreadCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className="w-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-lg"
        >
          {notifications?.length === 0 ? (
            <DropdownMenuItem className="text-center text-gray-500 dark:text-gray-400">
              No notifications
            </DropdownMenuItem>
          ) : (
            notifications?.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onDelete={handleDelete}
                onClick={() => handleNotificationClick(notification)}
              />
            ))
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <NotificationDialog
        notification={selectedNotification}
        open={!!selectedNotification}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedNotification(null);
          }
        }}
      />
    </>
  );
};