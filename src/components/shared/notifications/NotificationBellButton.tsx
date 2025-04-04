
import { forwardRef } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

interface NotificationBellButtonProps {
  unreadCount: number;
}

export const NotificationBellButton = forwardRef<HTMLButtonElement, NotificationBellButtonProps>(
  ({ unreadCount }, ref) => {
    console.log('Rendering NotificationBellButton with unreadCount:', unreadCount);
    
    return (
      <Button 
        ref={ref} 
        type="button"
        variant="ghost" 
        size="icon"
        className="relative w-8 h-8 md:w-9 md:h-9 hover:bg-accent/80 focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2"
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
      >
        <motion.div 
          animate={unreadCount > 0 ? { scale: [1, 1.2, 1] } : {}}
          transition={{ repeat: 0, duration: 0.5 }}
        >
          <Bell className="h-4 w-4 md:h-5 md:w-5" />
        </motion.div>
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute -top-1 -right-1"
            >
              <Badge
                variant="destructive"
                className="h-4 w-4 md:h-5 md:w-5 rounded-full p-0 flex items-center justify-center text-[10px] md:text-xs"
              >
                {unreadCount}
              </Badge>
            </motion.div>
          )}
        </AnimatePresence>
      </Button>
    );
  }
);

NotificationBellButton.displayName = "NotificationBellButton";
