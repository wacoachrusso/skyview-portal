import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, BellDot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { requestNotificationPermission, setupPushNotifications } from "@/utils/pushNotifications";
import { useToast } from "@/hooks/use-toast";

export const NotificationBell = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ["unreadNotifications"],
    queryFn: async () => {
      console.log("Fetching unread notifications count");
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 0;

      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false);
      
      console.log("Unread notifications count:", count);
      return count || 0;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const markNotificationsAsRead = useMutation({
    mutationFn: async () => {
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
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unreadNotifications"] });
    },
    onError: (error) => {
      console.error("Failed to mark notifications as read:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update notification status",
      });
    },
  });

  useEffect(() => {
    const setupNotifications = async () => {
      try {
        const permissionGranted = await requestNotificationPermission();
        if (permissionGranted) {
          console.log("Setting up push notifications");
          const cleanup = await setupPushNotifications();
          return cleanup;
        }
      } catch (error) {
        console.error("Error setting up notifications:", error);
      }
    };

    setupNotifications();
  }, []);

  const handleClick = async () => {
    console.log("Notification bell clicked, navigating to release notes");
    await markNotificationsAsRead.mutateAsync();
    navigate('/release-notes');
  };

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      className="relative p-2"
      onClick={handleClick}
    >
      {unreadCount > 0 ? (
        <>
          <BellDot className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        </>
      ) : (
        <Bell className="h-5 w-5" />
      )}
    </Button>
  );
};