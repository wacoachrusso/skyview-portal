
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotificationDialog } from "./notifications/NotificationDialog";
import { NotificationItem } from "./notifications/NotificationItem";
import { NotificationBellButton } from "./notifications/NotificationBellButton";
import { useNotificationState } from "@/hooks/notifications/useNotificationState";
import { useEffect } from "react";
import { clearNotificationBadge } from "@/utils/pushNotifications";

export const NotificationBell = () => {
  const {
    open,
    setOpen,
    selectedNotification,
    setSelectedNotification,
    notifications,
    unreadCount,
    handleDelete,
    handleNotificationClick,
  } = useNotificationState();

  console.log('Rendering NotificationBell with state:', { 
    open, 
    unreadCount, 
    notificationsCount: notifications?.length,
    notifications 
  });

  const handleOpenChange = (isOpen: boolean) => {
    console.log('Dropdown open state changing to:', isOpen);
    setOpen(isOpen);
    
    // Clear app badge when opening notifications
    if (isOpen) {
      clearNotificationBadge();
    }
  };

  // Clear badge when unreadCount becomes 0
  useEffect(() => {
    if (unreadCount === 0) {
      clearNotificationBadge();
    }
  }, [unreadCount]);

  return (
    <>
      <DropdownMenu open={open} onOpenChange={handleOpenChange}>
        <DropdownMenuTrigger asChild>
          <div className="inline-flex">
            <NotificationBellButton unreadCount={unreadCount} />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className="w-[280px] md:w-[320px] bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
          sideOffset={5}
        >
          {!notifications || notifications.length === 0 ? (
            <DropdownMenuItem disabled className="text-center text-muted-foreground">
              No notifications
            </DropdownMenuItem>
          ) : (
            notifications.map((notification) => (
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
