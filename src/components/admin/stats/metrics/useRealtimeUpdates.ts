import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useRealtimeUpdates = (refetch: () => Promise<void>) => {
  useEffect(() => {
    console.log("Setting up real-time subscriptions for admin stats...");

    const subscriptions = [
      supabase
        .channel("profiles-changes")
        .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, 
          () => {
            console.log("Profiles table changed, triggering refetch...");
            refetch();
          }
        )
        .subscribe((status) => {
          console.log("Profiles subscription status:", status);
        }),

      supabase
        .channel("notifications-changes")
        .on("postgres_changes", { event: "*", schema: "public", table: "notifications" },
          () => {
            console.log("Notifications table changed, triggering refetch...");
            refetch();
          }
        )
        .subscribe((status) => {
          console.log("Notifications subscription status:", status);
        }),
    ];

    return () => {
      console.log("Cleaning up real-time subscriptions...");
      subscriptions.forEach(subscription => {
        subscription.unsubscribe();
      });
    };
  }, [refetch]);
};