import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useRealtimeUpdates = (refetch: () => void) => {
  useEffect(() => {
    console.log("Setting up real-time subscriptions for admin stats...");
    
    const channel = supabase
      .channel('admin-stats-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        () => {
          console.log("Detected change in profiles table, refetching stats...");
          refetch();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications'
        },
        () => {
          console.log("Detected change in notifications table, refetching stats...");
          refetch();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'release_notes'
        },
        () => {
          console.log("Detected change in release_notes table, refetching stats...");
          refetch();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'alpha_testers'
        },
        () => {
          console.log("Detected change in alpha_testers table, refetching stats...");
          refetch();
        }
      )
      .subscribe();

    return () => {
      console.log("Cleaning up real-time subscriptions...");
      supabase.removeChannel(channel);
    };
  }, [refetch]);
};