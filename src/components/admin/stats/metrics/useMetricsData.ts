import { Users, UserCheck, Bell, FileText, UserPlus, CreditCard, Star, UserCog, MessageSquare } from "lucide-react";
import { useAdminStats } from "@/hooks/useAdminStats";
import { useQuery } from "@tanstack/react-query";

export type MetricType = 
  | "messageFeedback"
  | "alphaTesters"
  | "promoters"
  | "users"
  | "activeUsers"
  | "notifications"
  | "releaseNotes"
  | "newUsers"
  | "monthlySubUsers"
  | "yearlySubUsers";

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
  details: {
    users: any[];
    activeUsers: any[];
    notifications: any[];
    releaseNotes: any[];
    newUsers: any[];
    monthlySubUsers: any[];
    yearlySubUsers: any[];
    alphaTesters: any[];
    promoters: any[];
    messageFeedback: any[];
  };
}

export const useMetricsData = () => {
  const { data: stats, refetch } = useQuery<StatsData>({
    queryKey: ["admin-stats"],
    queryFn: useAdminStats
  });

  const metrics = [
    {
      id: "messageFeedback",
      title: "Message Feedback",
      value: stats?.messageFeedbackCount || 0,
      icon: MessageSquare,
    },
    {
      id: "alphaTesters",
      title: "Active Alpha Testers",
      value: stats?.alphaTestersCount || 0,
      icon: UserCog,
    },
    {
      id: "promoters",
      title: "Active Promoters",
      value: stats?.promotersCount || 0,
      icon: Star,
    },
    {
      id: "users",
      title: "Total Users",
      value: stats?.userCount || 0,
      icon: Users,
    },
    {
      id: "activeUsers",
      title: "Active Users (30d)",
      value: stats?.activeUserCount || 0,
      icon: UserCheck,
    },
    {
      id: "notifications",
      title: "Notifications Sent",
      value: stats?.notificationCount || 0,
      icon: Bell,
    },
    {
      id: "releaseNotes",
      title: "Release Notes",
      value: stats?.releaseNoteCount || 0,
      icon: FileText,
    },
    {
      id: "newUsers",
      title: "New Users (30d)",
      value: stats?.newUserCount || 0,
      icon: UserPlus,
    },
    {
      id: "monthlySubUsers",
      title: "Monthly Subscribers",
      value: stats?.monthlySubCount || 0,
      icon: CreditCard,
    },
    {
      id: "yearlySubUsers",
      title: "Yearly Subscribers",
      value: stats?.yearlySubCount || 0,
      icon: CreditCard,
    },
  ];

  return { metrics, stats, refetch };
};