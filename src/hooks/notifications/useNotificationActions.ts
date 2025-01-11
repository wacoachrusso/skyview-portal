import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { sendPushNotification } from "@/utils/pushNotifications";

type NotificationType = "system" | "update" | "release";

interface NotificationData {
  title: string;
  message: string;
  profile_id: string;
  type: NotificationType;
  notification_type: NotificationType;
}

export const useNotificationActions = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteNotification = async (id: string) => {
    try {
      console.log("Deleting notification:", id);
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting notification:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to delete notification",
        });
        return false;
      }

      // Invalidate both admin and user notification queries
      await queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
      await queryClient.invalidateQueries({ queryKey: ["notifications"] });
      
      return true;
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete notification",
      });
      return false;
    }
  };

  const sendNotification = async (notification: NotificationData) => {
    try {
      console.log("Sending notification:", notification);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");
      
      if (!notification.profile_id) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please select a recipient",
        });
        return false;
      }

      let usersToNotify: any[] = [];

      const { data: adminProfile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();

      if (notification.profile_id === "all") {
        const { data: pushEnabledProfiles } = await supabase
          .from("profiles")
          .select("id, push_notifications, push_subscription")
          .eq("push_notifications", true)
          .neq('account_status', 'deleted');
        
        usersToNotify = (pushEnabledProfiles || []).filter(profile => 
          !(adminProfile?.is_admin && profile.id === user.id)
        );
      } else {
        const { data: profile } = await supabase
          .from("profiles")
          .select("id, push_notifications, push_subscription")
          .eq("id", notification.profile_id)
          .single();
        
        if (profile?.push_notifications) {
          usersToNotify = [profile];
        }
      }

      const notificationsToInsert = usersToNotify.map(profile => ({
        title: notification.title,
        message: notification.message,
        type: notification.type,
        notification_type: notification.type,
        profile_id: profile.id,
        user_id: profile.id,
      }));

      if (notificationsToInsert.length > 0) {
        console.log("Inserting notifications:", notificationsToInsert);
        const { error: insertError } = await supabase
          .from("notifications")
          .insert(notificationsToInsert);

        if (insertError) {
          console.error("Error inserting notifications:", insertError);
          throw insertError;
        }

        // Play notification sound
        const audio = new Audio('/notification-sound.mp3');
        await audio.play();

        for (const profile of usersToNotify) {
          if (profile.push_subscription) {
            try {
              await sendPushNotification(
                notification.title,
                {
                  body: notification.message,
                  icon: "/lovable-uploads/017a86c8-ed21-4240-9134-bef047180bf2.png",
                  badge: "/lovable-uploads/017a86c8-ed21-4240-9134-bef047180bf2.png",
                  tag: notification.type,
                  data: {
                    url: '/dashboard',
                    type: notification.type
                  },
                  renotify: true,
                  requireInteraction: true,
                  vibrate: [200, 100, 200]
                }
              );
            } catch (error) {
              console.error("Error sending push notification to user:", profile.id, error);
            }
          }
        }

        await queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
        await queryClient.invalidateQueries({ queryKey: ["notifications"] });
        return true;
      }

      return true;
    } catch (error) {
      console.error("Error sending notification:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send notification",
      });
      return false;
    }
  };

  return {
    deleteNotification,
    sendNotification,
  };
};