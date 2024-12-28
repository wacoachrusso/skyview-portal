import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { NotificationTable } from "./notifications/NotificationTable";
import { NotificationDialog } from "./notifications/NotificationDialog";
import { NewNotificationDialog } from "./notifications/NewNotificationDialog";

export const NotificationManager = () => {
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const [showNewNotificationDialog, setShowNewNotificationDialog] = useState(false);
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

  const handleSendNotification = async (notification: any) => {
    try {
      console.log("Sending notification:", notification);
      
      if (notification.profile_id === "all") {
        // Send to all users
        const { data: allProfiles } = await supabase
          .from("profiles")
          .select("id");
        
        const notifications = allProfiles!.map(profile => ({
          ...notification,
          profile_id: profile.id,
        }));
        
        const { error } = await supabase
          .from("notifications")
          .insert(notifications);

        if (error) throw error;
      } else {
        // Send to single user
        const { error } = await supabase
          .from("notifications")
          .insert([notification]);

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Notification sent successfully",
      });
      setShowNewNotificationDialog(false);
      refetch();
    } catch (error) {
      console.error("Error sending notification:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send notification",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Notification History</h2>
        <Button onClick={() => setShowNewNotificationDialog(true)}>
          Send New Notification
        </Button>
      </div>

      <NotificationTable
        notifications={notifications || []}
        onViewDetails={setSelectedNotification}
      />

      <NotificationDialog
        notification={selectedNotification}
        open={!!selectedNotification}
        onOpenChange={(open) => !open && setSelectedNotification(null)}
      />

      <NewNotificationDialog
        profiles={profiles || []}
        open={showNewNotificationDialog}
        onOpenChange={setShowNewNotificationDialog}
        onSend={handleSendNotification}
      />
    </div>
  );
};