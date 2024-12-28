import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type NotificationType = "system" | "update" | "release";

interface NotificationData {
  title: string;
  message: string;
  type: NotificationType;
  notification_type: NotificationType;
  profile_id: string;
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
        .select("id, full_name, email");
      if (error) throw error;
      return data;
    },
  });

  const sendNotification = async (notification: NotificationData) => {
    try {
      console.log("Sending notification:", notification);
      
      // Validate profile_id
      if (!notification.profile_id) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please select a recipient",
        });
        return false;
      }

      // Ensure notification type is valid
      if (!["system", "update", "release"].includes(notification.type)) {
        throw new Error("Invalid notification type");
      }

      if (notification.profile_id === "all") {
        // Send to all users
        const { data: allProfiles } = await supabase
          .from("profiles")
          .select("id");
        
        if (!allProfiles || allProfiles.length === 0) {
          throw new Error("No profiles found");
        }

        const notifications = allProfiles.map(profile => ({
          title: notification.title,
          message: notification.message,
          type: notification.type,
          notification_type: notification.type, // Ensure both fields match
          profile_id: profile.id,
          user_id: profile.id,
        }));
        
        const { error } = await supabase
          .from("notifications")
          .insert(notifications);

        if (error) throw error;
      } else {
        // Send to single user
        const { error } = await supabase
          .from("notifications")
          .insert([{
            title: notification.title,
            message: notification.message,
            type: notification.type,
            notification_type: notification.type, // Ensure both fields match
            profile_id: notification.profile_id,
            user_id: notification.profile_id
          }]);

        if (error) throw error;
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
    refetchNotifications: refetch,
  };
};