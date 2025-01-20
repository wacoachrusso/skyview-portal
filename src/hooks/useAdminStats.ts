import { StatsData } from "@/types/stats";
import { 
  fetchUserStats, 
  fetchSubscriptionStats, 
  fetchSystemStats, 
  fetchTesterStats,
  fetchMessageFeedback 
} from "./admin/queries/useStatsQueries";

export const useAdminStats = async (): Promise<StatsData> => {
  console.log("Fetching admin stats...");
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Fetch all stats in parallel for better performance
  const [
    [{ count: userCount, data: users }, { count: activeUserCount, data: activeUsers }, { count: newUserCount, data: newUsers }],
    [{ count: monthlySubCount, data: monthlySubUsers }, { count: yearlySubCount, data: yearlySubUsers }],
    [{ count: notificationCount, data: notifications }, { count: releaseNoteCount, data: releaseNotes }],
    [{ count: alphaTestersCount, data: alphaTesters }, { count: promotersCount, data: promoters }],
    { count: messageFeedbackCount, data: messageFeedback }
  ] = await Promise.all([
    fetchUserStats(thirtyDaysAgo),
    fetchSubscriptionStats(),
    fetchSystemStats(),
    fetchTesterStats(),
    fetchMessageFeedback()
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