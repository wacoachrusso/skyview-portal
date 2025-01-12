import { forwardRef } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface NotificationBellButtonProps {
  unreadCount: number;
}

export const NotificationBellButton = forwardRef<HTMLButtonElement, NotificationBellButtonProps>(
  ({ unreadCount }, ref) => {
    console.log('Rendering NotificationBellButton with unreadCount:', unreadCount);
    
    return (
      <Button 
        ref={ref} 
        variant="ghost" 
        size="icon"
        className="relative w-8 h-8 md:w-9 md:h-9 hover:bg-accent focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
      >
        <Bell className="h-4 w-4 md:h-5 md:w-5" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-4 w-4 md:h-5 md:w-5 rounded-full p-0 flex items-center justify-center text-[10px] md:text-xs"
          >
            {unreadCount}
          </Badge>
        )}
      </Button>
    );
  }
);

NotificationBellButton.displayName = "NotificationBellButton";