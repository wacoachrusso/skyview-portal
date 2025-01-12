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

  console.log('Notification bell state:', { open, unreadCount, notificationsCount: notifications?.length });

  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <NotificationBellButton unreadCount={unreadCount} />
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className="w-[280px] md:w-[320px] bg-background/95 backdrop-blur-sm border border-border"
        >
          {!notifications || notifications.length === 0 ? (
            <DropdownMenuItem className="text-center text-muted-foreground">
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