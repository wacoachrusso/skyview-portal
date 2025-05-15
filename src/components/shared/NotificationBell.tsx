import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { NotificationDialog } from "./notifications/NotificationDialog";
import { NotificationItem } from "./notifications/NotificationItem";
import { NotificationBellButton } from "./notifications/NotificationBellButton";
import { useNotificationState } from "@/hooks/notifications/useNotificationState";
import { useEffect } from "react";
import { clearNotificationBadge } from "@/utils/pushNotifications";
import { Bell, MessageSquare, Clock, RefreshCw } from "lucide-react";
import { useTheme } from "../theme-provider";

export const NotificationBell = () => {
  const { theme } = useTheme();
  const isPrivateRoute = ["/dashboard", "/account", "/chat", "/referrals"].some(
    (path) => location.pathname.startsWith(path)
  );
  const isPublicRoute = !isPrivateRoute;
  const {
    open,
    setOpen,
    selectedNotification,
    setSelectedNotification,
    categories,
    unreadCount,
    handleDelete,
    handleNotificationClick,
  } = useNotificationState();

  console.log("Rendering NotificationBell with categories:", categories);

  const handleOpenChange = (isOpen: boolean) => {
    console.log("Dropdown open state changing to:", isOpen);
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

  // Check if there are any notifications at all
  const hasNotifications = Object.values(categories).some(
    (cat) => cat.length > 0
  );
  const dropdownBgClass = isPublicRoute
    ? "bg-slate-900/95 border-gray-700"
    : theme === "dark"
      ? "bg-slate-900/95 border-gray-700"
      : "bg-white border-gray-300";
  return (
    <>
      <DropdownMenu open={open} onOpenChange={handleOpenChange}>
        <DropdownMenuTrigger asChild>
          <div className="inline-flex">
            <NotificationBellButton unreadCount={unreadCount} isPublicRoute={isPublicRoute} />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-[320px] md:w-[380px] bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 max-h-[80vh] overflow-y-auto"
          sideOffset={5}
        >
          <div className="px-2 py-2 sticky top-0 bg-background/95 hover:bg-white/10 hover:text-white backdrop-blur z-10 border-b">
            <h3 className="font-medium text-lg flex items-center">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
              {unreadCount > 0 && (
                <span className="ml-2 text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </h3>
          </div>

          {!hasNotifications ? (
            <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground px-4">
              <Bell className="h-10 w-10 mb-2 text-muted-foreground/50" />
              <p>No notifications yet</p>
              <p className="text-sm mt-1">
                We'll notify you of important updates and messages
              </p>
            </div>
          ) : (
            <>
              {categories.updates.length > 0 && (
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="flex items-center">
                    <RefreshCw className="h-4 w-4 mr-2 text-blue-500" />
                    Updates
                  </DropdownMenuLabel>
                  {categories.updates.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onDelete={handleDelete}
                      onClick={() => handleNotificationClick(notification)}
                      type="update"
                    />
                  ))}
                  {(categories.messages.length > 0 ||
                    categories.reminders.length > 0) && (
                    <DropdownMenuSeparator />
                  )}
                </DropdownMenuGroup>
              )}

              {categories.messages.length > 0 && (
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="flex items-center">
                    <MessageSquare className="h-4 w-4 mr-2 text-green-500" />
                    Messages
                  </DropdownMenuLabel>
                  {categories.messages.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onDelete={handleDelete}
                      onClick={() => handleNotificationClick(notification)}
                      type="message"
                    />
                  ))}
                  {categories.reminders.length > 0 && <DropdownMenuSeparator />}
                </DropdownMenuGroup>
              )}

              {categories.reminders.length > 0 && (
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-amber-500" />
                    Reminders
                  </DropdownMenuLabel>
                  {categories.reminders.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onDelete={handleDelete}
                      onClick={() => handleNotificationClick(notification)}
                      type="reminder"
                    />
                  ))}
                </DropdownMenuGroup>
              )}
            </>
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
