import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAdminStats } from "@/hooks/useAdminStats";
import { Users, Activity, Bell, FileText, UserPlus, CreditCard, Calendar, TestTube2, Megaphone, MessageSquare } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type MetricType = 
  | "users"
  | "activeUsers"
  | "notifications"
  | "releaseNotes"
  | "newUsers"
  | "monthlySubUsers"
  | "yearlySubUsers"
  | "alphaTesters"
  | "promoters"
  | "messageFeedback";

interface Metric {
  id: MetricType;
  title: string;
  value: number;
  icon: LucideIcon;
}

interface StatsData {
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
  details: Record<string, any>;
}

export const useMetricsData = () => {
  const { toast } = useToast();
  const adminStats = useAdminStats();

  const query = useQuery<StatsData, Error>({
    queryKey: ["admin-stats"],
    queryFn: adminStats,
    retry: 2,
    retryDelay: 1000,
  });

  const metrics: Metric[] = query.data ? [
    { id: "users", title: "Total Users", value: query.data.userCount || 0, icon: Users },
    { id: "activeUsers", title: "Active Users", value: query.data.activeUserCount || 0, icon: Activity },
    { id: "notifications", title: "Active Notifications", value: query.data.notificationCount || 0, icon: Bell },
    { id: "releaseNotes", title: "Release Notes", value: query.data.releaseNoteCount || 0, icon: FileText },
    { id: "newUsers", title: "New Users", value: query.data.newUserCount || 0, icon: UserPlus },
    { id: "monthlySubUsers", title: "Monthly Subscribers", value: query.data.monthlySubCount || 0, icon: CreditCard },
    { id: "yearlySubUsers", title: "Yearly Subscribers", value: query.data.yearlySubCount || 0, icon: Calendar },
    { id: "alphaTesters", title: "Alpha Testers", value: query.data.alphaTestersCount || 0, icon: TestTube2 },
    { id: "promoters", title: "Active Promoters", value: query.data.promotersCount || 0, icon: Megaphone },
    { id: "messageFeedback", title: "Message Feedback", value: query.data.messageFeedbackCount || 0, icon: MessageSquare },
  ] : [];

  return {
    metrics,
    stats: query.data,
    refetch: query.refetch,
    error: query.error,
    isLoading: query.isLoading
  };
};