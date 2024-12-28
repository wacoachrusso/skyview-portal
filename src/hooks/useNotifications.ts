import { useQuery } from "@tanstack/react-query";
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

export const useNotifications = () => {
  const { toast } = useToast();

  const { data: notifications, refetch } = useQuery({
    queryKey: ["admin-notifications"],
    queryFn: async () => {
      console.log("Fetching notifications with profile data...");
      const { data, error } = await supabase
        .from("notifications")
        .select("*, profiles(full_name, email)")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching notifications:", error);
        throw error;
      }
      console.log("Fetched notifications:", data);
      return data;
    },
  });

  const { data: profiles } = useQuery({
    queryKey: ["profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, push_notifications");
      if (error) throw error;
      return data;
    },
  });

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

      toast({
        title: "Success",
        description: "Notification deleted successfully",
      });
      await refetch();
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
      
      if (!notification.profile_id) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please select a recipient",
        });
        return false;
      }

      let usersToNotify: any[] = [];

      if (notification.profile_id === "all") {
        const { data: pushEnabledProfiles } = await supabase
          .from("profiles")
          .select("id, push_notifications")
          .eq("push_notifications", true);
        
        usersToNotify = pushEnabledProfiles || [];
      } else {
        const { data: profile } = await supabase
          .from("profiles")
          .select("id, push_notifications")
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
        notification_type: notification.type, // Ensure they stay in sync
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

        const notificationOptions: NotificationOptions = {
          body: notification.message,
          icon: "/lovable-uploads/017a86c8-ed21-4240-9134-bef047180bf2.png",
          badge: "/lovable-uploads/017a86c8-ed21-4240-9134-bef047180bf2.png",
          tag: notification.type,
          data: {
            type: notification.type,
          },
          renotify: true,
          requireInteraction: true,
        };

        await sendPushNotification(notification.title, notificationOptions);
      }

      toast({
        title: "Success",
        description: "Notification sent successfully",
      });
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
    notifications,
    profiles,
    sendNotification,
    deleteNotification,
    refetchNotifications: refetch,
  };
};