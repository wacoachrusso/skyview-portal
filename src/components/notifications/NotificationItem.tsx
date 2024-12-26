import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Bell, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Notification } from "@/types/notifications";
import { cn } from "@/lib/utils";

interface NotificationItemProps {
  notification: Notification;
}

export function NotificationItem({ notification }: NotificationItemProps) {
  const [isRead, setIsRead] = useState(notification.is_read);

  const markAsRead = async () => {
    if (isRead) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notification.id);

      if (error) throw error;
      setIsRead(true);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  return (
    <div
      className={cn(
        "p-4 rounded-lg border transition-colors",
        isRead ? "bg-gray-50" : "bg-white cursor-pointer hover:bg-gray-50"
      )}
      onClick={markAsRead}
    >
      <div className="flex items-start gap-3">
        <div className="mt-1">
          {notification.type === 'app_update' ? (
            <Bell className="h-5 w-5 text-blue-500" />
          ) : (
            <Bell className="h-5 w-5 text-gray-500" />
          )}
        </div>
        <div className="flex-1 space-y-1">
          <p className="font-medium">{notification.title}</p>
          <p className="text-sm text-gray-500">{notification.message}</p>
          <p className="text-xs text-gray-400">
            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
          </p>
        </div>
        {isRead && (
          <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
        )}
      </div>
    </div>
  );
}