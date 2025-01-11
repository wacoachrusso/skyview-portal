import { Bell, FileText, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

interface NotificationItemProps {
  notification: any;
  onDelete: (id: string) => Promise<void>;
  onClick: () => void;
}

export const NotificationItem = ({ notification, onDelete, onClick }: NotificationItemProps) => {
  return (
    <DropdownMenuItem
      key={notification.id}
      className="flex flex-col items-start p-4 space-y-1 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-100 dark:border-gray-800 last:border-0"
      onClick={onClick}
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
            <div className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
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
            onDelete(notification.id);
          }}
          className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </DropdownMenuItem>
  );
};