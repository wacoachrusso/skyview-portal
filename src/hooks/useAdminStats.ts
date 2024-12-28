import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { subDays } from "date-fns";

export const useAdminStats = () => {
  return useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      console.log("Fetching admin stats...");
      const thirtyDaysAgo = subDays(new Date(), 30).toISOString();

      // Fetch all stats in parallel for better performance
      const [
        { count: userCount, data: users },
        { count: activeUserCount, data: activeUsers },
        { count: notificationCount, data: notifications },
        { count: releaseNoteCount, data: releaseNotes },
        { count: newUserCount, data: newUsers },
        { count: monthlySubCount, data: monthlySubUsers },
        { count: yearlySubCount, data: yearlySubUsers },
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact" }),
        supabase
          .from("profiles")
          .select("*", { count: "exact" })
          .gte("last_query_timestamp", thirtyDaysAgo),
        supabase.from("notifications").select("*", { count: "exact" }),
        supabase.from("release_notes").select("*", { count: "exact" }),
        supabase
          .from("profiles")
          .select("*", { count: "exact" })
          .gte("created_at", thirtyDaysAgo),
        supabase
          .from("profiles")
          .select("*", { count: "exact" })
          .eq("subscription_plan", "monthly"),
        supabase
          .from("profiles")
          .select("*", { count: "exact" })
          .eq("subscription_plan", "yearly"),
      ]);

      console.log("Stats fetched:", {
        userCount,
        activeUserCount,
        notificationCount,
        releaseNoteCount,
        newUserCount,
        monthlySubCount,
        yearlySubCount,
      });

      return {
        userCount,
        activeUserCount,
        notificationCount,
        releaseNoteCount,
        newUserCount,
        monthlySubCount,
        yearlySubCount,
        details: {
          users,
          activeUsers,
          notifications,
          releaseNotes,
          newUsers,
          monthlySubUsers,
          yearlySubUsers,
        },
      };
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 15000, // Consider data stale after 15 seconds
  });
};