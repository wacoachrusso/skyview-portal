
import { Bell, Clock, FileText, MessageSquare, RefreshCw, Trash2 } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { Button } from "@/components/ui/button";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

interface NotificationItemProps {
  notification: any;
  onDelete: (id: string) => Promise<void>;
  onClick: () => void;
  type?: "update" | "message" | "reminder";
}

export const NotificationItem = ({ notification, onDelete, onClick, type = "update" }: NotificationItemProps) => {
  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await onDelete(notification.id);
  };

  const getNotificationIcon = () => {
    switch (type) {
      case "update":
        return <RefreshCw className="h-5 w-5 text-blue-500 mt-1 flex-shrink-0" />;
      case "message":
        return <MessageSquare className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />;
      case "reminder":
        return <Clock className="h-5 w-5 text-amber-500 mt-1 flex-shrink-0" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500 mt-1 flex-shrink-0" />;
    }
  };

  // Format date - if less than 24 hours ago use relative time, otherwise use actual date
  const formatDate = (date: string) => {
    const dateObj = new Date(date);
    const now = new Date();
    const diffInHours = (now.getTime() - dateObj.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return formatDistanceToNow(dateObj, { addSuffix: true });
    }
    return format(dateObj, "MMM d, HH:mm");
  };

  const formattedDate = formatDate(notification.created_at);

  return (
    <DropdownMenuItem
      className={`flex flex-col items-start p-3 cursor-pointer hover:bg-accent space-y-1 border-l-2 ${
        !notification.is_read ? 'border-l-primary' : 'border-l-transparent'
      }`}
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
    >
      <div className="flex justify-between items-start w-full">
        <div className="flex items-start space-x-3 flex-1 min-w-0">
          {getNotificationIcon()}
          <div className="space-y-1 flex-1 min-w-0">
            <div className="font-medium text-sm text-foreground line-clamp-1">
              {notification.title}
            </div>
            <div className="text-xs text-muted-foreground line-clamp-2">
              {notification.message}
            </div>
            <div className="text-xs text-muted-foreground/70 flex items-center mt-1">
              <Clock className="h-3 w-3 mr-1 inline" />
              {formattedDate}
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDelete}
          className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10 -mr-1 flex-shrink-0"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </DropdownMenuItem>
  );
};
