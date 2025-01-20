import { StatsDetails } from "@/types/stats";

export interface StatsData {
  userCount: number;
  activeUserCount: number;
  notificationCount: number;
  releaseNoteCount: number;
  newUserCount: number;
  monthlySubCount: number;
  yearlySubCount: number;
  alphaTestersCount: number;
  promotersCount: number;
  messageFeedbackCount: number;
  details: StatsDetails;
}

export const useAdminStats = async (): Promise<StatsData> => {
  console.log("Fetching admin stats...");
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

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
      .gte("last_query_timestamp", thirtyDaysAgo.toISOString())
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
      .gte("created_at", thirtyDaysAgo.toISOString())
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

  console.log("Stats fetched successfully");

  return {
    userCount: userCount || 0,
    activeUserCount: activeUserCount || 0,
    notificationCount: notificationCount || 0,
    releaseNoteCount: releaseNoteCount || 0,
    newUserCount: newUserCount || 0,
    monthlySubCount: monthlySubCount || 0,
    yearlySubCount: yearlySubCount || 0,
    alphaTestersCount: alphaTestersCount || 0,
    promotersCount: promotersCount || 0,
    messageFeedbackCount: messageFeedbackCount || 0,
    details: {
      users: users || [],
      activeUsers: activeUsers || [],
      notifications: notifications || [],
      releaseNotes: releaseNotes || [],
      newUsers: newUsers || [],
      monthlySubUsers: monthlySubUsers || [],
      yearlySubUsers: yearlySubUsers || [],
      alphaTesters: alphaTesters || [],
      promoters: promoters || [],
      messageFeedback: messageFeedback || []
    }
  };
};