import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Notification } from "@/types/notifications";
import { NotificationItem } from "./NotificationItem";

export function NotificationList() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        // Explicitly type the data as Notification[]
        const typedData = data as Notification[];
        setNotifications(typedData);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();

    // Subscribe to notifications changes
    const channel = supabase
      .channel('notifications_list')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
        },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  return (
    <ScrollArea className="h-[calc(100vh-8rem)] mt-4">
      <div className="space-y-4">
        {notifications.length === 0 ? (
          <p className="text-center text-sm text-gray-500">No notifications yet</p>
        ) : (
          notifications.map((notification) => (
            <NotificationItem 
              key={notification.id} 
              notification={notification} 
            />
          ))
        )}
      </div>
    </ScrollArea>
  );
}