import { useState } from "react";
import { MetricsGrid } from "./stats/metrics/MetricsGrid";
import { StatsDialog } from "./stats/StatsDialog";
import { getDialogContent } from "./stats/getDialogContent";
import { useMetricsData } from "./stats/metrics/useMetricsData";
import { useRealtimeUpdates } from "./stats/metrics/useRealtimeUpdates";
import type { MetricType } from "./stats/metrics/useMetricsData";
import { useToast } from "@/hooks/use-toast";

export const SystemStats = () => {
  const [selectedMetric, setSelectedMetric] = useState<MetricType | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { stats, refetch, error } = useMetricsData();
  const { toast } = useToast();

  // Set up real-time updates with error handling
  useRealtimeUpdates(async () => {
    try {
      console.log("Refreshing metrics data...");
      await refetch();
    } catch (error) {
      console.error("Error refreshing metrics:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to refresh metrics data. Please try again.",
      });
    }
  });

  const handleMetricClick = (metric: MetricType) => {
    console.log("Metric clicked:", metric);
    setSelectedMetric(metric);
    setIsDialogOpen(true);
  };

  // Show error state if metrics data fails to load
  if (error) {
    console.error("Error loading metrics:", error);
    toast({
      variant: "destructive",
      title: "Error",
      description: "Failed to load metrics data. Please refresh the page.",
    });
  }

  const dialogContent = getDialogContent(stats?.details, selectedMetric);

  return (
    <>
      <MetricsGrid onMetricClick={handleMetricClick} />
      <StatsDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        content={dialogContent}
      />
    </>
  );
};