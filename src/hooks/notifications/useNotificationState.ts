
import { useState, useEffect } from "react";
import { useNotifications } from "@/hooks/useNotifications";
import { supabase } from "@/integrations/supabase/client";

export const useNotificationState = () => {
  const [open, setOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const [categories, setCategories] = useState<{[key: string]: any[]}>({
    updates: [],
    messages: [],
    reminders: []
  });
  
  const { notifications, deleteNotification, refetchNotifications } = useNotifications();
  const unreadCount = notifications?.filter((n) => !n.is_read).length || 0;

  // Categorize notifications when they change
  useEffect(() => {
    if (notifications) {
      const categorized = {
        updates: notifications.filter(n => n.type === 'release' || n.type === 'update'),
        messages: notifications.filter(n => n.type === 'message'),
        reminders: notifications.filter(n => n.type === 'reminder' || n.type === 'system')
      };
      setCategories(categorized);
    }
  }, [notifications]);

  useEffect(() => {
    if (open && notifications?.length > 0) {
      markNotificationsAsRead();
    }
  }, [open, notifications]);

  // Set up real-time listener for new notifications
  useEffect(() => {
    const setupNotificationListener = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        
        console.log("Setting up notification listener");
        const channel = supabase
          .channel('notifications_changes')
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'notifications',
              filter: `user_id=eq.${user.id}`
            },
            (payload) => {
              console.log('New notification received:', payload);
              refetchNotifications();
            }
          )
          .subscribe();
          
        return () => {
          supabase.removeChannel(channel);
        };
      } catch (error) {
        console.error("Error setting up notification listener:", error);
      }
    };
    
    setupNotificationListener();
  }, [refetchNotifications]);

  const markNotificationsAsRead = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      console.log("Marking notifications as read");
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) {
        console.error("Error marking notifications as read:", error);
        throw error;
      }

      await refetchNotifications();
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  const handleDelete = async (id: string) => {
    console.log("Deleting notification:", id);
    try {
      await deleteNotification(id);
      setSelectedNotification(null);
      await refetchNotifications();
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const handleNotificationClick = (notification: any) => {
    console.log("Opening notification details:", notification);
    setSelectedNotification(notification);
    setOpen(false);
  };

  return {
    open,
    setOpen,
    selectedNotification,
    setSelectedNotification,
    categories,
    notifications,
    unreadCount,
    handleDelete,
    handleNotificationClick,
  };
};
