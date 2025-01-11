import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface NotificationBellButtonProps {
  unreadCount: number;
}

export const NotificationBellButton = ({ unreadCount }: NotificationBellButtonProps) => {
  return (
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
  );
};