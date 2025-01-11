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
        { count: alphaTestersCount, data: alphaTesters },
        { count: promotersCount, data: promoters },
        { count: messageFeedbackCount, data: messageFeedback }
      ] = await Promise.all([
        // Total users (excluding deleted)
        supabase
          .from("profiles")
          .select("*", { count: "exact" })
          .neq('account_status', 'deleted'),
        
        // Active users in last 30 days (excluding deleted)
        supabase
          .from("profiles")
          .select("*", { count: "exact" })
          .gte("last_query_timestamp", thirtyDaysAgo)
          .neq('account_status', 'deleted'),
        
        // Active notifications
        supabase
          .from("notifications")
          .select("*", { count: "exact" })
          .eq('is_read', false),
        
        // Release notes
        supabase
          .from("release_notes")
          .select("*", { count: "exact" }),
        
        // New users in last 30 days (excluding deleted)
        supabase
          .from("profiles")
          .select("*", { count: "exact" })
          .gte("created_at", thirtyDaysAgo)
          .neq('account_status', 'deleted'),
        
        // Monthly subscribers (active only)
        supabase
          .from("profiles")
          .select("*", { count: "exact" })
          .eq("subscription_plan", "monthly")
          .neq('account_status', 'deleted'),
        
        // Yearly subscribers (active only)
        supabase
          .from("profiles")
          .select("*", { count: "exact" })
          .eq("subscription_plan", "yearly")
          .neq('account_status', 'deleted'),
        
        // Active alpha testers
        supabase
          .from("alpha_testers")
          .select("*, profiles(full_name, email)", { count: "exact" })
          .eq("status", "active"),
        
        // Active promoters
        supabase
          .from("alpha_testers")
          .select("*, profiles(full_name, email)", { count: "exact" })
          .eq("status", "active")
          .eq("is_promoter", true),

        // Message feedback with related data
        supabase
          .from('message_feedback')
          .select(`
            *,
            messages (content),
            user:profiles!message_feedback_profile_id_fkey (full_name, email)
          `, { count: 'exact' })
          .order('created_at', { ascending: false })
      ]);

      console.log("Stats fetched:", {
        userCount,
        activeUserCount,
        notificationCount,
        releaseNoteCount,
        newUserCount,
        monthlySubCount,
        yearlySubCount,
        alphaTestersCount,
        promotersCount,
        messageFeedbackCount
      });

      return {
        userCount,
        activeUserCount,
        notificationCount,
        releaseNoteCount,
        newUserCount,
        monthlySubCount,
        yearlySubCount,
        alphaTestersCount,
        promotersCount,
        messageFeedbackCount,
        details: {
          users,
          activeUsers,
          notifications,
          releaseNotes,
          newUsers,
          monthlySubUsers,
          yearlySubUsers,
          alphaTesters,
          promoters,
          messageFeedback
        },
      };
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 15000, // Consider data stale after 15 seconds
  });
};
