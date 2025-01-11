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

  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <NotificationBellButton unreadCount={unreadCount} />
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