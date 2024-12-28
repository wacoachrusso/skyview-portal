import { useState } from "react";
import { Bell, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useNotifications } from "@/hooks/useNotifications";
import { format } from "date-fns";

export const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const { notifications, deleteNotification, refetchNotifications } = useNotifications();
  const unreadCount = notifications?.filter((n) => !n.is_read).length || 0;

  const handleDelete = async (id: string) => {
    console.log("Deleting notification:", id);
    await deleteNotification(id);
    await refetchNotifications();
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        {notifications?.length === 0 ? (
          <DropdownMenuItem className="text-center">
            No notifications
          </DropdownMenuItem>
        ) : (
          notifications?.map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              className="flex flex-col items-start p-4 space-y-1 cursor-default"
            >
              <div className="flex justify-between items-start w-full">
                <div>
                  <div className="font-semibold">{notification.title}</div>
                  <div className="text-sm text-muted-foreground">
                    {notification.message}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {format(new Date(notification.created_at), "MMM d, yyyy HH:mm")}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(notification.id);
                  }}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};