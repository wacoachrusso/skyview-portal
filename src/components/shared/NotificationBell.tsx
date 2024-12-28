import { useState } from "react";
import { Bell, Trash2, FileText } from "lucide-react";
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
            <DropdownMenuItem
              key={notification.id}
              className="flex flex-col items-start p-4 space-y-1 cursor-default hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-100 dark:border-gray-800 last:border-0"
            >
              <div className="flex justify-between items-start w-full">
                <div className="flex items-start space-x-3">
                  {notification.type === 'release' ? (
                    <FileText className="h-5 w-5 text-blue-500 mt-1" />
                  ) : (
                    <Bell className="h-5 w-5 text-gray-500 mt-1" />
                  )}
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-gray-100">
                      {notification.title}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      {notification.message}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {format(new Date(notification.created_at), "MMM d, yyyy HH:mm")}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(notification.id);
                  }}
                  className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};