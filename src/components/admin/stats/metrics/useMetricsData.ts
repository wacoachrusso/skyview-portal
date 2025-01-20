import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAdminStats } from "@/hooks/useAdminStats";

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

export const useMetricsData = () => {
  const { toast } = useToast();

  return useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      try {
        console.log("Fetching metrics data...");
        const stats = await useAdminStats().queryFn();
        console.log("Metrics data fetched successfully:", stats);
        return stats;
      } catch (error) {
        console.error("Error fetching metrics data:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch metrics data. Please try again.",
        });
        throw error;
      }
    },
    retry: 2,
    retryDelay: 1000,
  });
};