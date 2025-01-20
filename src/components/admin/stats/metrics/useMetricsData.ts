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
  details: Record<string, any>;
}

export const useMetricsData = () => {
  const { toast } = useToast();
  const fetchStats = useAdminStats();

  const { data, error, isLoading, refetch } = useQuery<StatsData, Error>({
    queryKey: ["admin-stats"],
    queryFn: fetchStats,
    retry: 2,
    retryDelay: 1000,
  });

  const metrics: Metric[] = data ? [
    { id: "users", title: "Total Users", value: data.userCount || 0, icon: Users },
    { id: "activeUsers", title: "Active Users", value: data.activeUserCount || 0, icon: Activity },
    { id: "notifications", title: "Active Notifications", value: data.notificationCount || 0, icon: Bell },
    { id: "releaseNotes", title: "Release Notes", value: data.releaseNoteCount || 0, icon: FileText },
    { id: "newUsers", title: "New Users", value: data.newUserCount || 0, icon: UserPlus },
    { id: "monthlySubUsers", title: "Monthly Subscribers", value: data.monthlySubCount || 0, icon: CreditCard },
    { id: "yearlySubUsers", title: "Yearly Subscribers", value: data.yearlySubCount || 0, icon: Calendar },
    { id: "alphaTesters", title: "Alpha Testers", value: data.alphaTestersCount || 0, icon: TestTube2 },
    { id: "promoters", title: "Active Promoters", value: data.promotersCount || 0, icon: Megaphone },
    { id: "messageFeedback", title: "Message Feedback", value: data.messageFeedbackCount || 0, icon: MessageSquare },
  ] : [];

  return {
    metrics,
    stats: data,
    refetch,
    error,
    isLoading
  };
};